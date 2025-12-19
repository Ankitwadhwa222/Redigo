 

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Navbar";
import {
  Delete,
  Edit2,
  MapPin,
  Calendar,
  Clock,
  Users,
  IndianRupee,
  Car,
  BookOpen,
  TrendingUp,
  Wallet,
} from "lucide-react";

function DashboardPage() {
  const [userInfo, setUserInfo] = useState(null);
  const [userRides, setUserRides] = useState([]);
  const [bookedRides, setBookedRides] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalRidesOffered: 0,
    totalRidesBooked: 0,
    totalEarnings: 0,
    totalSavings: 0,
    completedRides: 0,
    activeRides: 0,
    cancelledRides: 0,
    totalPassengers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const navigate = useNavigate();

  // 🔒 Ensure token exists and is valid
  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token missing or expired. Please log in again.");
    return { Authorization: `${token}` };
  };

  // ✅ Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/profile`,
        { headers: getAuthHeader() }
      );

      setUserInfo(res.data.user);
      if (res.data.user?.rides) {
        setUserRides(res.data.user.rides);
      }

      console.log("✅ User profile loaded:", res.data.user);
    } catch (err) {
      console.error("❌ Error fetching user profile:", err);
      if (err.response?.status === 401) {
        setError("Session expired. Please log in again.");
        localStorage.removeItem("token");
      } else {
        setError("Failed to load user profile.");
      }
    }
  };

  // ✅ Fetch user's posted rides
  const fetchUserRides = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/user-rides`,
        { headers: getAuthHeader() }
      );
      setUserRides(res.data.rides || []);
      console.log("✅ User rides loaded:", res.data.rides?.length || 0);
    } catch (err) {
      console.error("❌ Error fetching user rides:", err);
      setUserRides([]);
    }
  };

  // ✅ Fetch user's booked rides
  const fetchBookedRides = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/rides/user/booked/active?timeFilter=upcoming`,
        // `${import.meta.env.VITE_BACKEND_URL}/api/rides/user/booked/active`,
        { headers: getAuthHeader() }
      );
      setBookedRides(res.data.rides || []);
      console.log("✅ Booked rides loaded:", res.data.rides?.length || 0);
    } catch (err) {
      console.error("❌ Error fetching booked rides:", err);
      setBookedRides([]);
    }
  };

  // ✅ Fetch dashboard statistics (money spent, earned, etc.)
  const fetchDashboardStats = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/dashboard-stats`,
        { headers: getAuthHeader() }
      );
      setDashboardStats(res.data.stats || {});
      console.log("✅ Dashboard stats loaded:", res.data.stats);
    } catch (err) {
      console.error("❌ Error fetching dashboard stats:", err);
      calculateStatsFromData(); // fallback to local calculation
    }
  };

  // 🧮 Local stats calculation fallback
  const calculateStatsFromData = () => {
    try {
      // Note: bookedRides is already filtered to upcoming only for display,
      // but for money calculation we need ALL booked rides. Since we only have
      // upcoming rides here, we'll let the backend API handle the full calculation.
      const totalRidesOffered = userRides.length;
      const totalRidesBooked = bookedRides.length; // This is upcoming only

      const totalEarnings = userRides.reduce((sum, ride) => {
        const passengers = ride.passengers || [];
        return sum + passengers.length * (ride.price || 0);
      }, 0);

      // For totalSavings, we only have upcoming rides data here,
      // so this will be incomplete. Backend API should provide the full amount.
      const totalSavings = bookedRides.reduce((sum, ride) => sum + (ride.price || 0), 0);
      const completedRides = userRides.filter((r) => r.status === "completed").length;
      const activeRides = userRides.filter(
        (r) => r.status === "active" || r.status === "scheduled" || !r.status
      ).length;
      const cancelledRides = userRides.filter((r) => r.status === "cancelled").length;
      const totalPassengers = userRides.reduce(
        (sum, r) => sum + (r.passengers?.length || 0),
        0
      );

      setDashboardStats({
        totalRidesOffered,
        totalRidesBooked,
        totalEarnings,
        totalSavings,
        completedRides,
        activeRides,
        cancelledRides,
        totalPassengers,
      });

      console.log("📊 Stats recalculated locally:", {
        totalRidesOffered,
        totalRidesBooked,
        totalEarnings,
        totalSavings,
      });
    } catch (err) {
      console.error("❌ Error calculating stats:", err);
    }
  };

  // ✅ Fetch all dashboard data
  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUserProfile(),
        fetchUserRides(),
        fetchBookedRides(),
        fetchDashboardStats(),
      ]);
    } catch (err) {
      console.error("❌ Error fetching dashboard data:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Manual refresh button
  const refreshData = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  // 🧠 Load on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // 🔁 Recalculate stats on data change
  useEffect(() => {
    if (userRides.length > 0 || bookedRides.length > 0) {
      calculateStatsFromData();
    }
  }, [userRides, bookedRides]);

  // ✅ Delete ride
  const handleDeleteRide = async (rideId) => {
    if (!window.confirm("Are you sure you want to delete this ride?")) return;
    setLoading(true);
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/rides/${rideId}`, {
        headers: getAuthHeader(),
      });
      setUserRides((prev) => prev.filter((ride) => ride._id !== rideId));
      alert("✅ Ride deleted successfully!");
    } catch (err) {
      console.error("❌ Error deleting ride:", err);
      alert("Failed to delete ride. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Edit ride
  const handleEditRide = (ride) => {
    navigate(`/user/rides/edit-ride/${ride._id}`, { state: { ride } });
  };

  // ✅ Cancel booking
  const handleCancelBooking = async (rideId) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/rides/${rideId}/cancel-booking`,
        { headers: getAuthHeader() }
      );
      setBookedRides((prev) => prev.filter((r) => r._id !== rideId));
      alert("✅ Booking cancelled!");
    } catch (err) {
      console.error("❌ Error cancelling booking:", err);
      alert("Failed to cancel booking.");
    }
  };

  // 🎨 UI Helpers
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "active":
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  // 🌀 Loading UI
  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mb-4 mx-auto"></div>
            <p className="text-lg font-semibold text-gray-700">
              Loading your dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ⚠️ Error UI
  if (error && !userInfo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-lg font-semibold text-red-600 mb-4">{error}</p>
            <button
              onClick={refreshData}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-md"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Dashboard Render
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {userInfo?.name || "User"}!
              </h1>
              <p className="text-gray-600 mt-1">
                Here's an overview of your ridesharing activity
              </p>
              {userInfo?.email && (
                <p className="text-sm text-gray-500 mt-1">
                  📧 {userInfo.email} • 📱 {userInfo.phone || "Not provided"}
                </p>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                {refreshing ? "🔄 Refreshing..." : "🔄 Refresh"}
              </button>
              <Link
                to="/add-ride"
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-md text-sm font-medium"
              >
                + Post New Ride
              </Link>
            </div>
          </div>
        </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
             <div className="flex justify-between items-center">
               <div>
                 <p className="text-sm font-medium text-gray-600">Rides Offered</p>
                 <p className="text-3xl font-bold text-gray-900 mt-2">
                   {dashboardStats.totalRidesOffered || userRides.length}
                 </p>
                 <p className="text-sm text-gray-500 mt-1">
                   {dashboardStats.activeRides || 0} active
                 </p>
               </div>
               <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                 <Car className="w-6 h-6 text-green-600" />
               </div>
             </div>
           </div>

           {/* Rides Booked */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
             <div className="flex justify-between items-center">
               <div>
                 <p className="text-sm font-medium text-gray-600">Rides Booked</p>
                 <p className="text-3xl font-bold text-gray-900 mt-2">
                   {dashboardStats.totalRidesBooked || bookedRides.length}
                 </p>
                 <p className="text-sm text-gray-500 mt-1">
                   {dashboardStats.completedRides || 0} completed
                 </p>
               </div>
               <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                 <BookOpen className="w-6 h-6 text-blue-600" />
               </div>
             </div>
           </div>

           {/* Earnings */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
             <div className="flex justify-between items-center">
               <div>
                 <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                 <p className="text-3xl font-bold text-gray-900 mt-2">
                   ₹{dashboardStats.totalEarnings?.toLocaleString('en-IN') || '0'}
                 </p>
                 <p className="text-sm text-gray-500 mt-1">
                   {dashboardStats.totalPassengers || 0} passengers served
                 </p>
               </div>
               <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                 <TrendingUp className="w-6 h-6 text-yellow-600" />
               </div>
             </div>
           </div>

           {/* Savings */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
             <div className="flex justify-between items-center">
               <div>
                 <p className="text-sm font-medium text-gray-600">Money Spent</p>
                 <p className="text-3xl font-bold text-gray-900 mt-2">
                   ₹{dashboardStats.totalSavings?.toLocaleString('en-IN') || '0'}
                 </p>
                 <p className="text-sm text-gray-500 mt-1">On booked rides</p>
               </div> 
               <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                 <Wallet className="w-6 h-6 text-indigo-600" />
               </div>
             </div>
           </div>
         </div>

         {/* Main Content Grid */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Your Posted Rides */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200">
             <div className="p-6 border-b border-gray-200">
               <div className="flex justify-between items-center">
                 <h2 className="text-xl font-semibold text-gray-900">
                   Your Posted Rides ({userRides.length})
                 </h2>
                 <Link
                   to="/add-ride"
                   className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                 >
                   + Post New Ride
                </Link>
              </div>
            </div>

            <div className="p-6">
              {userRides.length > 0 ? (
                <div className="space-y-4">
                  {userRides.map((ride) => {
                    const { date, time } = formatDate(ride.date || ride.createdAt);
                    return (
                      <div key={ride._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span className="font-medium text-gray-900">
                                {ride.from} → {ride.to}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{date}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{time}</span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-4 text-sm">
                              <div className="flex items-center space-x-1">
                                <IndianRupee className="w-4 h-4 text-green-600" />
                                <span className="font-medium text-green-600">₹{ride.price}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="w-4 h-4 text-blue-600" />
                                <span>{ride.passengers?.length || 0}/{ride.availableSeats || 'N/A'} seats</span>
                              </div>
                              {ride.status && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ride.status)}`}>
                                  {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => handleEditRide(ride)}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Edit Ride"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRide(ride._id)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete Ride"
                            >
                              <Delete className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {ride.passengers && ride.passengers.length > 0 && (
                          <div className="border-t border-gray-100 pt-3 mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Passengers:</p>
                            <div className="flex flex-wrap gap-2">
                              {ride.passengers.map((passenger, index) => (
                                <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                  👤 {passenger.name || passenger.userId || `Passenger ${index + 1}`}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl text-gray-300 mb-4">🚗</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No rides posted yet</h3>
                  <p className="text-gray-600 mb-6">Start earning by posting your first ride</p>
                  <Link
                    to="/add-ride"
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-md font-medium"
                  >
                    Post Your First Ride
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Your Booked Rides */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Your Bookings ({bookedRides.length})
                </h2>
                <Link
                  to="/search-rides"
                  className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Find More Rides
                </Link>
              </div>
            </div>

            <div className="p-6">
              {bookedRides.length > 0 ? (
                <div className="space-y-4">
                  {bookedRides.map((ride) => {
                    const { date, time } = formatDate(ride.date || ride.createdAt);
                    return (
                      <div key={ride._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span className="font-medium text-gray-900">
                                {ride.from} → {ride.to}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{date}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{time}</span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-4 text-sm">
                              <div className="flex items-center space-x-1">
                                <IndianRupee className="w-4 h-4 text-green-600" />
                                <span className="font-medium text-green-600">₹{ride.price}</span>
                              </div>
                              {ride.driverName && (
                                <div className="flex items-center space-x-1">
                                  <span className="text-gray-500">Driver:</span>
                                  <span className="font-medium">{ride.driverName}</span>
                                </div>
                              )}
                              {ride.status && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ride.status)}`}>
                                  {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => navigate(`/ride-chat/${ride._id}`)}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Chat with Driver"
                            >
                              💬
                            </button>
                            <button
                              onClick={() => handleCancelBooking(ride._id, ride.bookingId)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Cancel Booking"
                            >
                              ❌
                            </button>
                          </div>
                        </div>

                        {ride.pickupLocation && (
                          <div className="border-t border-gray-100 pt-3 mt-3">
                            <p className="text-sm text-gray-600">
                              📍 Pickup: {ride.pickupLocation}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl text-gray-300 mb-4">👥</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                  <p className="text-gray-600 mb-6">Find and book your first ride</p>
                  <Link
                    to="/search-rides"
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-md font-medium"
                  >
                    Find Your First Ride
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {(userRides.length > 0 || bookedRides.length > 0) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {[...userRides, ...bookedRides]
                  .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
                  .slice(0, 5)
                  .map((ride, index) => {
                    const isPosted = userRides.some(r => r._id === ride._id);
                    const { date, time } = formatDate(ride.createdAt || ride.date);
                    
                    return (
                      <div key={`${ride._id}-${index}`} className="flex items-center space-x-3 py-2">
                        <div className={`w-2 h-2 rounded-full ${isPosted ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">
                              {isPosted ? 'Posted ride' : 'Booked ride'}
                            </span>
                            {' '}from {ride.from} to {ride.to}
                          </p>
                          <p className="text-xs text-gray-500">{date} at {time}</p>
                        </div>
                        <div className="text-sm font-medium text-green-600">₹{ride.price}</div>
                      </div>
                    );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
     
  );
}

export default DashboardPage;
