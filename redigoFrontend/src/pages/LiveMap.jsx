import React, { useEffect, useState, useCallback, useRef } from "react";
import { GoogleMap, InfoWindow, DirectionsRenderer, useJsApiLoader } from "@react-google-maps/api";
import { Navigation, MapPin, Clock, Phone, MessageCircle, Car, X, ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";

const socket = io(`${import.meta.env.VITE_BACKEND_URL}`, {
  transports: ["websocket", "polling"],
  withCredentials: true,
});

// ✅ Fix: Define libraries as a constant outside component
const GOOGLE_MAPS_LIBRARIES = ["geometry", "places", "marker"];

const LiveMap = () => {
  // ✅ Get data from URL and internal state instead of props
  const { rideId } = useParams();
  const navigate = useNavigate();
  
  // ✅ Internal state management
  const [currentUser, setCurrentUser] = useState(null);
  const [rideDetails, setRideDetails] = useState(null);
  const [otherUserInfo, setOtherUserInfo] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'driver' or 'passenger'
  const [loading, setLoading] = useState(true);
  
  // ✅ Map state
  const [currentLocation, setCurrentLocation] = useState(null);
  const [otherUserLocation, setOtherUserLocation] = useState(null);
  const [map, setMap] = useState(null);
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [eta, setEta] = useState(null);
  const [distance, setDistance] = useState(null);
  const [directions, setDirections] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [carRotation, setCarRotation] = useState(0);
  const [locationError, setLocationError] = useState(null);
  const [isUsingMockLocation, setIsUsingMockLocation] = useState(false);
  const [currentUserMarker, setCurrentUserMarker] = useState(null);
  const [otherUserMarker, setOtherUserMarker] = useState(null);

  // ✅ Get current user and ride data on component mount
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        setLoading(true);
        
        // ✅ Get current user from localStorage/token
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");
        
        let user;
        if (userData) {
          user = JSON.parse(userData);
        } else if (token) {
          // You can fetch user data from token here if needed
          user = { 
            _id: "user-from-token",
            name: "User",
            email: "user@example.com"
          };
        } else {
          user = { 
            _id: "guest-user",
            name: "Guest User",
            email: ""
          };
        }
        setCurrentUser(user);

        // ✅ Fetch ride details
        if (rideId) {
          console.log("📍 Fetching ride details for:", rideId);
          
          try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/rides/${rideId}`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            
            const ride = response.data.ride || response.data;
            setRideDetails(ride);
            
            // ✅ Determine user role
            const isDriver = ride.driver?._id === user._id || ride.driverId === user._id;
            const role = isDriver ? 'driver' : 'passenger';
            setUserRole(role);
            
            // ✅ Set other user info
            if (isDriver) {
              // If current user is driver, other user is passenger
              setOtherUserInfo({
                _id: ride.passenger?._id || ride.passengerId,
                name: ride.passenger?.name || "Passenger",
                role: "Passenger",
                phone: ride.passenger?.phone
              });
            } else {
              // If current user is passenger, other user is driver
              setOtherUserInfo({
                _id: ride.driver?._id || ride.driverId,
                name: ride.driver?.name || "Driver",
                role: "Driver",
                phone: ride.driver?.phone,
                car: ride.car
              });
            }
            
            console.log("✅ Ride data loaded:", { role, ride });
            
          } catch (error) {
            console.error("❌ Error fetching ride details:", error);
            
            // ✅ Fallback data for testing
            setRideDetails({
              _id: rideId,
              from: "Current Location",
              to: "Destination",
              driver: { _id: "driver123", name: "Driver Name" },
              passenger: { _id: "passenger123", name: "Passenger Name" }
            });
            
            // ✅ Default to passenger role
            setUserRole('passenger');
            setOtherUserInfo({
              _id: "driver123",
              name: "Test Driver",
              role: "Driver",
              phone: "+1234567890"
            });
          }
        }
        
      } catch (error) {
        console.error("❌ Error initializing component:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeComponent();
  }, [rideId]);

  // ✅ Professional Map Styles (Uber-like)
  const mapStyles = [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "transit",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#f5f5f5" }]
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#e8e8e8" }]
    }
  ];

  // ✅ Fix: Use constant libraries array
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES
  });

  if (loadError) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <h2 className="text-xl font-bold mb-2">Map Loading Error</h2>
          <p>Please check your Google Maps API key and try again.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ✅ Calculate car rotation based on movement direction
  const calculateCarRotation = useCallback((prevLocation, newLocation) => {
    if (!prevLocation || !newLocation) return 0;
    
    // ✅ Check if Google Maps API and geometry library are loaded
    if (!window.google || 
        !window.google.maps || 
        !window.google.maps.geometry || 
        !window.google.maps.geometry.spherical) {
      console.warn("Google Maps geometry library not loaded yet");
      return 0;
    }
    
    try {
      const heading = window.google.maps.geometry.spherical.computeHeading(
        new window.google.maps.LatLng(prevLocation.lat, prevLocation.lng),
        new window.google.maps.LatLng(newLocation.lat, newLocation.lng)
      );
      
      return heading;
    } catch (error) {
      console.warn("Error calculating heading:", error);
      return 0;
    }
  }, []);

  // ✅ Create Advanced Marker Element
  const createAdvancedMarker = useCallback((position, isCurrentUser = true, rotation = 0) => {
    if (!window.google || !window.google.maps || !window.google.maps.marker) {
      console.warn("Advanced Marker not available, falling back to regular marker");
      return null;
    }

    // Create custom marker content
    const markerContent = document.createElement('div');
    markerContent.style.cssText = `
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: rotate(${rotation}deg);
      transition: transform 0.3s ease;
    `;

    if (userRole === 'driver' && isCurrentUser) {
      // Car icon for driver
      markerContent.innerHTML = `
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 2L20 8H24C25.1 8 26 8.9 26 10V22C26 23.1 25.1 24 24 24H22V26C22 27.1 21.1 28 20 28H18C16.9 28 16 27.1 16 26V24H12V26C12 27.1 11.1 28 10 28H8C6.9 28 6 27.1 6 26V24H4C2.9 24 2 23.1 2 22V10C2 8.9 2.9 8 4 8H8L12 2H16Z" fill="#000000" stroke="white" stroke-width="2"/>
          <circle cx="8" cy="18" r="2" fill="white"/>
          <circle cx="20" cy="18" r="2" fill="white"/>
        </svg>
      `;
    } else {
      // Circle icon for passenger
      const color = isCurrentUser ? "#4285F4" : "#34D399";
      markerContent.innerHTML = `
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="3"/>
          <circle cx="16" cy="16" r="6" fill="white"/>
        </svg>
      `;
    }

    try {
      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        position: position,
        map: map,
        content: markerContent,
        title: isCurrentUser ? "Your Location" : "Other User"
      });

      return marker;
    } catch (error) {
      console.error("Error creating advanced marker:", error);
      return null;
    }
  }, [map, userRole]);

  // ✅ Update markers when locations change
  useEffect(() => {
    if (!map || !isLoaded) return;

    // Update current user marker
    if (currentLocation) {
      if (currentUserMarker) {
        currentUserMarker.position = currentLocation;
        // Update rotation for driver
        if (userRole === 'driver' && currentUserMarker.content) {
          currentUserMarker.content.style.transform = `rotate(${carRotation}deg)`;
        }
      } else {
        const marker = createAdvancedMarker(currentLocation, true, carRotation);
        setCurrentUserMarker(marker);
      }
    }

    // Update other user marker
    if (otherUserLocation) {
      if (otherUserMarker) {
        otherUserMarker.position = otherUserLocation;
      } else {
        const marker = createAdvancedMarker(otherUserLocation, false, 0);
        setOtherUserMarker(marker);
      }
    }
  }, [currentLocation, otherUserLocation, map, isLoaded, carRotation, createAdvancedMarker, currentUserMarker, otherUserMarker, userRole]);

  // ✅ Cleanup markers
  useEffect(() => {
    return () => {
      if (currentUserMarker) {
        currentUserMarker.map = null;
      }
      if (otherUserMarker) {
        otherUserMarker.map = null;
      }
    };
  }, [currentUserMarker, otherUserMarker]);

  // ✅ Show user-friendly error notification
  const showLocationErrorNotification = (message) => {
    setLocationError(message);
    setTimeout(() => setLocationError(null), 5000);
  };

  // ✅ Handle different types of location errors
  const handleLocationError = (errorCode) => {
    let fallbackLocation = { lat: 28.6139, lng: 77.2090 }; // Delhi default
    let errorMessage = "";

    switch (errorCode) {
      case 1:
      case 'PERMISSION_DENIED':
        errorMessage = "Location access denied. Click 'Test Car Movement' to use demo mode.";
        break;
      case 2:
        errorMessage = "Location unavailable. Using default location.";
        break;
      case 3:
        errorMessage = "Location request timeout. Using default location.";
        break;
      default:
        errorMessage = "Location service error. Using demo mode.";
    }

    console.warn(errorMessage);
    setCurrentLocation(fallbackLocation);
    showLocationErrorNotification(errorMessage);
  };

  // ✅ Enhanced Geolocation Setup
  useEffect(() => {
    if (!navigator.geolocation || !currentUser || !userRole) return;

    let prevLocation = null;
    let watchId = null;

    const options = {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 15000
    };

    // ✅ Setup location tracking
    const setupLocationTracking = async () => {
      try {
        // Check permission first
        if ('permissions' in navigator) {
          const permission = await navigator.permissions.query({ name: 'geolocation' });
          
          if (permission.state === 'denied') {
            handleLocationError('PERMISSION_DENIED');
            return;
          }
        }

        // Get initial position
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: Date.now(),
              speed: position.coords.speed || 0,
              heading: position.coords.heading || null
            };

            console.log("✅ Initial location obtained:", coords);
            setCurrentLocation(coords);
            prevLocation = coords;
            setLocationError(null);

            // Start watching for changes
            startWatching();
          },
          (error) => {
            console.error("Initial geolocation error:", error);
            handleLocationError(error.code);
          },
          options
        );

      } catch (error) {
        console.error("Permission check failed:", error);
        handleLocationError('UNKNOWN');
      }
    };

    // ✅ Start continuous watching
    const startWatching = () => {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now(),
            speed: position.coords.speed || 0,
            heading: position.coords.heading || null
          };

          // ✅ Calculate car rotation for smooth movement
          if (prevLocation && userRole === 'driver') {
            const rotation = calculateCarRotation(prevLocation, coords);
            setCarRotation(rotation);
          }

          setCurrentLocation(coords);
          prevLocation = coords;
          
          // Emit location update with movement data
          socket.emit("location-update", {
            userId: currentUser._id,
            rideId,
            userRole,
            coords,
            rotation: carRotation,
            timestamp: coords.timestamp
          });
        },
        (error) => {
          console.error("Watch position error:", error);
          if (error.code === 3) { // TIMEOUT
            console.warn("Location timeout, continuing...");
          }
        },
        options
      );
    };

    // Start the location setup
    setupLocationTracking();

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [currentUser, rideId, userRole, carRotation, calculateCarRotation]);

  // ✅ Mock Movement Function (Works without real GPS)
  const startMockMovement = useCallback(() => {
    if (!currentUser) return;
    
    console.log("🚗 Starting mock movement...");
    setIsUsingMockLocation(true);

    // Use current location or default Delhi location
    const startingPoint = currentLocation || { lat: 28.6139, lng: 77.2090 };

    // Mock route coordinates (simulate realistic driving)
    const mockRoute = [
      startingPoint,
      { lat: startingPoint.lat + 0.001, lng: startingPoint.lng + 0.0005 },
      { lat: startingPoint.lat + 0.002, lng: startingPoint.lng + 0.001 },
      { lat: startingPoint.lat + 0.003, lng: startingPoint.lng + 0.0015 },
      { lat: startingPoint.lat + 0.004, lng: startingPoint.lng + 0.002 },
      { lat: startingPoint.lat + 0.005, lng: startingPoint.lng + 0.0025 },
      { lat: startingPoint.lat + 0.006, lng: startingPoint.lng + 0.003 },
      { lat: startingPoint.lat + 0.007, lng: startingPoint.lng + 0.0035 }
    ];

    let currentIndex = 0;
    
    const moveInterval = setInterval(() => {
      if (currentIndex >= mockRoute.length) {
        clearInterval(moveInterval);
        console.log("🏁 Mock movement completed");
        setIsUsingMockLocation(false);
        return;
      }

      const nextLocation = mockRoute[currentIndex];
      const prevLocation = currentIndex > 0 ? mockRoute[currentIndex - 1] : nextLocation;
      
      // ✅ Calculate rotation with safety check
      let rotation = 0;
      if (window.google && window.google.maps && window.google.maps.geometry) {
        rotation = calculateCarRotation(prevLocation, nextLocation);
        setCarRotation(rotation);
      } else {
        // ✅ Simple mathematical rotation calculation as fallback
        const deltaLat = nextLocation.lat - prevLocation.lat;
        const deltaLng = nextLocation.lng - prevLocation.lng;
        rotation = Math.atan2(deltaLng, deltaLat) * (180 / Math.PI);
        setCarRotation(rotation);
      }
      
      // Update location
      const mockCoords = {
        ...nextLocation,
        accuracy: 10,
        speed: 25 + Math.random() * 10, // Random speed 25-35 km/h
        timestamp: Date.now()
      };

      setCurrentLocation(mockCoords);
      
      console.log(`🚗 Moving to position ${currentIndex + 1}/${mockRoute.length}:`, nextLocation);
      
      // Emit location update
      socket.emit("location-update", {
        userId: currentUser._id,
        rideId,
        userRole,
        coords: mockCoords,
        rotation: rotation,
        timestamp: Date.now()
      });

      currentIndex++;
    }, 2000); // Update every 2 seconds

    // Store interval ID for cleanup
    window.mockMovementInterval = moveInterval;

    return () => clearInterval(moveInterval);
  }, [currentUser, rideId, userRole, calculateCarRotation, currentLocation]);

  // ✅ Listen for Other User's Location Updates
  useEffect(() => {
    if (!currentUser) return;

    socket.on("receive-location-update", (data) => {
      if (data.rideId === rideId && data.userId !== currentUser._id) {
        console.log("📍 Received location update:", data);
        setOtherUserLocation(data.coords);
        calculateRouteAndETA(currentLocation, data.coords);
      }
    });

    return () => socket.off("receive-location-update");
  }, [rideId, currentUser, currentLocation]);

  // ✅ Calculate Route and ETA with Directions API
  const calculateRouteAndETA = useCallback((from, to) => {
    if (!from || !to || !window.google) return;

    const directionsService = new window.google.maps.DirectionsService();
    
    directionsService.route({
      origin: from,
      destination: to,
      travelMode: window.google.maps.TravelMode.DRIVING,
      avoidTolls: false,
      avoidHighways: false,
    }, (result, status) => {
      if (status === 'OK') {
        setDirections(result);
        const route = result.routes[0].legs[0];
        setEta(route.duration.text);
        setDistance(route.distance.text);
        
        // Extract route coordinates for smooth car movement
        const path = result.routes[0].overview_path;
        const coordinates = path.map(point => ({
          lat: point.lat(),
          lng: point.lng()
        }));
        setRouteCoordinates(coordinates);
      }
    });
  }, []);

  // ✅ Join ride tracking room
  useEffect(() => {
    if (!currentUser || !rideId || !userRole) return;

    socket.emit("join-ride-tracking", { rideId, userId: currentUser._id, userRole });
    
    return () => {
      socket.emit("leave-ride-tracking", { rideId, userId: currentUser._id });
      // Clear any running intervals
      if (window.mockMovementInterval) {
        clearInterval(window.mockMovementInterval);
      }
    };
  }, [rideId, currentUser, userRole]);

  // ✅ Auto-center map when locations update
  useEffect(() => {
    if (map && currentLocation && otherUserLocation) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(currentLocation);
      bounds.extend(otherUserLocation);
      map.fitBounds(bounds, { padding: 100 });
    } else if (map && currentLocation) {
      map.panTo(currentLocation);
      map.setZoom(16);
    }
  }, [map, currentLocation, otherUserLocation]);

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  // ✅ Handle back navigation
  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  // ✅ Loading state
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4 mx-auto"></div>
          <p className="text-white text-lg font-medium">Loading ride tracking...</p>
          <p className="text-gray-400 text-sm mt-2">Ride ID: {rideId}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4 mx-auto"></div>
          <p className="text-white text-lg font-medium">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen">
      {/* ✅ Location Error Notification */}
      {locationError && (
        <div className="absolute top-16 left-4 right-4 bg-yellow-500 text-white p-4 rounded-lg shadow-lg z-30 mx-auto max-w-md">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span className="text-sm font-medium">{locationError}</span>
          </div>
          <button
            onClick={() => setLocationError(null)}
            className="absolute top-2 right-2 text-white hover:text-gray-200"
          >
            ✕
          </button>
        </div>
      )}

      {/* ✅ Location Permission Request Modal */}
      {!currentLocation && !locationError && !loading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md mx-4 text-center">
            <MapPin className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Enable Location Access</h3>
            <p className="text-gray-600 mb-6">
              To track your ride and provide real-time updates, please enable location access in your browser.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Enable Location Access
              </button>
              
              <button
                onClick={startMockMovement}
                className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Use Test Mode Instead
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              Click the location icon in your browser's address bar to enable location access
            </p>
          </div>
        </div>
      )}

      {/* ✅ Modern Google Map with Advanced Markers */}
      <GoogleMap
        mapContainerClassName="w-full h-full"
        center={currentLocation || { lat: 28.6139, lng: 77.209 }}
        zoom={15}
        options={{
          // mapId: "YOUR_MAP_ID", // ✅ Add this when you get a Map ID
          styles: mapStyles,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: "greedy",
        }}
        onLoad={onLoad}
      >
        {/* ✅ Route Directions */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: "#4285F4",
                strokeWeight: 5,
                strokeOpacity: 0.8,
              }
            }}
          />
        )}

        {/* ✅ Info Window for other user */}
        {showInfoWindow && otherUserLocation && (
          <InfoWindow 
            position={otherUserLocation}
            onCloseClick={() => setShowInfoWindow(false)}
          >
            <div className="p-2">
              <h3 className="font-semibold">{otherUserInfo?.name}</h3>
              <p className="text-sm text-gray-600">{otherUserInfo?.role}</p>
              {distance && (
                <p className="text-sm text-blue-600 font-medium">{distance} away</p>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* ✅ Back Button */}
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 bg-white p-3 rounded-full shadow-lg z-20 hover:bg-gray-100"
      >
        <ArrowLeft className="h-6 w-6 text-gray-700" />
      </button>

      {/* ✅ Close Button */}
      <button
        onClick={handleBack}
        className="absolute top-4 right-4 bg-white p-3 rounded-full shadow-lg z-20 hover:bg-gray-100"
      >
        <X className="h-6 w-6 text-gray-700" />
      </button>

      {/* ✅ Professional Top Status Bar */}
      <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-90 text-white p-4 z-10">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center space-x-2">
            <Car className="h-5 w-5" />
            <span className="font-medium">
              {userRole === 'driver' ? 'Driving to Passenger' : 'Driver En Route'}
            </span>
            {isUsingMockLocation && (
              <span className="text-xs bg-orange-500 px-2 py-1 rounded-full">DEMO</span>
            )}
          </div>
          
          {eta && (
            <div className="flex items-center space-x-1 bg-green-600 px-3 py-1 rounded-full">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">{eta}</span>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Test Car Movement Button */}
      <button
        onClick={startMockMovement}
        className="absolute bottom-72 left-4 bg-red-500 text-white p-3 rounded-full shadow-lg z-10 hover:bg-red-600 transition-colors"
        title="Start test movement"
      >
        🚗
      </button>

      {/* ✅ Center Location Button */}
      <button
        onClick={() => {
          if (currentLocation) {
            map?.panTo(currentLocation);
            map?.setZoom(16);
          }
        }}
        className="absolute bottom-72 right-4 bg-white p-3 rounded-full shadow-lg z-10 hover:bg-gray-100 transition-colors"
        title="Center on my location"
      >
        <Navigation className="h-6 w-6 text-gray-700" />
      </button>

      {/* ✅ Re-center Both Users Button */}
      {otherUserLocation && (
        <button
          onClick={() => {
            if (currentLocation && otherUserLocation) {
              const bounds = new window.google.maps.LatLngBounds();
              bounds.extend(currentLocation);
              bounds.extend(otherUserLocation);
              map?.fitBounds(bounds, { padding: 100 });
            }
          }}
          className="absolute bottom-80 right-4 bg-white p-3 rounded-full shadow-lg z-10 hover:bg-gray-100 transition-colors"
          title="Show both users"
        >
          <MapPin className="h-6 w-6 text-gray-700" />
        </button>
      )}

      {/* ✅ Bottom Info Card */}
      {otherUserInfo && (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t shadow-2xl z-10">
          <div className="p-6 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <Car className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{otherUserInfo.name}</h3>
                  <p className="text-sm text-gray-600">{otherUserInfo.role}</p>
                  {otherUserInfo.car && (
                    <p className="text-xs text-gray-500">{otherUserInfo.car.model} • {otherUserInfo.car.plateNumber}</p>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-3">
                {otherUserInfo.phone && (
                  <a
                    href={`tel:${otherUserInfo.phone}`}
                    className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                  >
                    <Phone className="h-5 w-5" />
                  </a>
                )}
                
                <button
                  onClick={() => navigate(`/ride/${rideId}/chat`)}
                  className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {distance && eta && (
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center space-x-1 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{distance}</span>
                </div>
                <div className="flex items-center space-x-1 text-green-600">
                  <Clock className="h-4 w-4" />
                  <span>{eta}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(LiveMap);