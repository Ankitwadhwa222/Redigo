import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, Users, Star, Clock, Car, Phone, MessageCircle, Filter, SortDesc } from "lucide-react";
import Header from "../components/Navbar";
import Footer from "../components/Footer";

const SearchRides = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    date: "",
    passengers: 1,
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [showFilters, setShowFilters] = useState(false);

  // Extract URL parameters and pre-fill form
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const from = searchParams.get('from') || '';
    const to = searchParams.get('to') || '';
    const date = searchParams.get('date') || '';
    const passengers = searchParams.get('passengers') || '1';

    const newFormData = {
      from,
      to,
      date,
      passengers: parseInt(passengers)
    };

    setFormData(newFormData);

    if (from && to) {
      handleSearch(newFormData);
    }
  }, [location.search]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = async (searchData = formData) => {
    setLoading(true);
    
    try {
      const query = new URLSearchParams(searchData).toString();
      const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/api/rides/search?${query}`;
      
      const res = await fetch(apiUrl);
      const data = await res.json();

      if (data.success) {
        setResults(data.rides);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Error searching rides:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookRide = (rideId) => {
    // Navigate to booking page or show booking modal
    navigate(`/checkout/${rideId}`);
  };

  const handleContactDriver = (ride) => {
    // Navigate to chat or show contact modal
    navigate(`/ride-chat/${ride._id}`);
  };

  const sortedResults = [...results].sort((a, b) => {
    switch (sortBy) {
      case "price":
        return a.price - b.price;
      case "time":
        return new Date(a.date) - new Date(b.date);
      case "rating":
        return (b.driver?.rating || 0) - (a.driver?.rating || 0);
      default:
        return new Date(a.date) - new Date(b.date);
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section with Search */}
      <div className="bg-gradient-to-r from-cyan-700/10 to-cyan-800/10 pt-10">
        <div className="max-w-full mx-auto px-4 py-5">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Find Your Perfect Ride
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Connect with travelers going your way
            </p>
          </div>
           

          {/* Enhanced Search Form */}
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  From
                </label>
                <input
                  type="text"
                  name="from"
                  placeholder="Departure city"
                  value={formData.from}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-cyan-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  To
                </label>
                <input
                  type="text"
                  name="to"
                  placeholder="Destination city"
                  value={formData.to}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-cyan-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-cyan-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Users className="inline w-4 h-4 mr-1" />
                  Passengers
                </label>
                <select
                  name="passengers"
                  value={formData.passengers}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-cyan-500 focus:outline-none transition-colors"
                >
                  <option value="1">1 passenger</option>
                  <option value="2">2 passengers</option>
                  <option value="3">3 passengers</option>
                  <option value="4">4 passengers</option>
                </select>
              </div>
            </div>

            <button
              className="w-full bg-gradient-to-r from-cyan-700 to-cyan-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-cyan-700 hover:to-cyan-800 disabled:opacity-50 transition-all duration-300 flex items-center justify-center space-x-2"
              onClick={() => handleSearch()}
              disabled={loading}
            >
              <Search className="w-5 h-5" />
              <span>{loading ? "Searching..." : "Search Rides"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Results Header with Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {loading ? "Searching..." : `${results.length} rides found`}
            </h2>
            {formData.from && formData.to && (
              <p className="text-gray-600">
                From {formData.from} to {formData.to}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="flex items-center space-x-2">
              <SortDesc className="w-4 h-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
              >
                <option value="date">Sort by Date</option>
                <option value="price">Sort by Price</option>
                <option value="rating">Sort by Rating</option>
              </select>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
            <p className="mt-4 text-gray-600">Finding the best rides for you...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && results.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No rides found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or check back later for new rides.
            </p>
            <button
              onClick={() => handleSearch()}
              className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
            >
              Search Again
            </button>
          </div>
        )}

        {/* Results Grid */}
        <div className="space-y-4">
          {sortedResults.map((ride, index) => (
            <div
              key={ride._id || index}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Driver Info */}
                  <div className="flex items-center gap-4 lg:w-64">
                    <div className="relative">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-700 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {ride.driver?.name?.charAt(0) || 'D'}
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <div className="h-2 w-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{ride.driver?.name || 'Unknown Driver'}</h4>
                      <div className="flex items-center space-x-1 mt-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-semibold text-gray-700">
                          {ride.driver?.rating || 'N/A'}
                        </span>
                        <span className="text-xs text-gray-500">(25 reviews)</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Verified Driver</p>
                    </div>
                  </div>

                  {/* Route Info */}
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{ride.from}</p>
                            <p className="text-xs text-gray-500">Pickup location</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{ride.to}</p>
                            <p className="text-xs text-gray-500">Drop-off location</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(ride.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(ride.date).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        {ride.car?.model && (
                          <div className="flex items-center space-x-2">
                            <Car className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{ride.car.model}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {ride.availableSeats} seats available
                          </span>
                        </div>
                        <div className="text-right md:text-left">
                          <p className="text-2xl font-bold text-cyan-600">₹{ride.price}</p>
                          <p className="text-xs text-gray-500">per person</p>
                        </div>
                      </div>
                    </div>

                    {ride.notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">{ride.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col justify-center space-y-3 lg:w-40">
                    <button 
                      onClick={() => handleBookRide(ride._id)}
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg"
                    >
                      Book Now
                    </button>
                    <button 
                      onClick={() => handleContactDriver(ride)}
                      className="flex items-center justify-center space-x-2 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:border-cyan-500 hover:text-cyan-600 transition-all duration-300"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Contact</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SearchRides;