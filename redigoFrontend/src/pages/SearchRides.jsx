import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Navbar";
import Footer from "../components/Footer";

const SearchRides = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    date: "",
    passengers: 1,
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Extract URL parameters and pre-fill form
  useEffect(() => {
    console.log("Current URL:", location.search); // Debug log
    
    const searchParams = new URLSearchParams(location.search);
    const from = searchParams.get('from') || '';
    const to = searchParams.get('to') || '';
    const date = searchParams.get('date') || '';
    const passengers = searchParams.get('passengers') || '1';

    console.log("Extracted params:", { from, to, date, passengers }); // Debug log

    const newFormData = {
      from,
      to,
      date,
      passengers: parseInt(passengers)
    };

    setFormData(newFormData);

    // Auto-search if we have from and to parameters
    if (from && to) {
      console.log("Auto-searching with:", newFormData); // Debug log
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
    console.log("Starting search with:", searchData); // Debug log
    setLoading(true);
    
    try {
      const query = new URLSearchParams(searchData).toString();
      const apiUrl = `http://localhost:5000/api/rides/search?${query}`;
      console.log("API URL:", apiUrl); // Debug log
      
      const res = await fetch(apiUrl);
      const data = await res.json();
      console.log("API Response:", data); // Debug log

      if (data.success) {
        setResults(data.rides);
        console.log("Rides found:", data.rides.length); // Debug log
      } else {
        setResults([]);
        console.log("No rides found or API error"); // Debug log
      }
    } catch (error) {
      console.error("Error searching rides:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  console.log("Current state:", { formData, results, loading }); // Debug log

  return (
    <>
      <Header />
      <div className="max-w-screen-2xl p-10 bg-gradient-to-br from-white to-blue-50 mx-auto min-h-screen font-Inter">
        <main className="w-full mx-auto px-4 py-8">
          <div className="bg-white rounded-lg p-6 mb-8 shadow">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Search for Rides
            </h2>

            {/* Search Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">From</label>
                <input
                  type="text"
                  name="from"
                  placeholder="Departure city"
                  value={formData.from}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">To</label>
                <input
                  type="text"
                  name="to"
                  placeholder="Destination city"
                  value={formData.to}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Passengers</label>
                <select
                  name="passengers"
                  value={formData.passengers}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="1">1 passenger</option>
                  <option value="2">2 passengers</option>
                  <option value="3">3 passengers</option>
                  <option value="4">4 passengers</option>
                </select>
              </div>
            </div>

            {/* Search Button */}
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <button
                className="bg-cyan-800 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 disabled:opacity-50"
                onClick={() => handleSearch()}
                disabled={loading}
              >
                {loading ? "Searching..." : "Search Rides"}
              </button>
            </div>
          </div>

          {/* Debug Info
          <div className="bg-yellow-100 p-4 rounded-lg mb-4">
            <h3 className="font-bold">Debug Info:</h3>
            <p>Loading: {loading ? "Yes" : "No"}</p>
            <p>Results count: {results.length}</p>
            <p>From: {formData.from}</p>
            <p>To: {formData.to}</p>
          </div> */}

          {/* Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800">
                {results.length} rides found
              </h3>
            </div>

            {loading && (
              <div className="text-center py-8">
                <p>Loading rides...</p>
              </div>
            )}

            {!loading && results.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600">No rides found. Try different search criteria.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Tip: Try searching for rides between cities that actually have data in your database.
                </p>
              </div>
            )}

            {results.map((ride, index) => (
              <div
                key={ride._id || index}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Driver Info */}
                  <div className="flex items-center gap-4 lg:w-64">
                    <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                      {ride.driver?.name?.charAt(0) || 'D'}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{ride.driver?.name || 'Unknown Driver'}</h4>
                      <p className="text-sm text-gray-600">⭐ {ride.driver?.rating || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Route Info */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">From: {ride.from}</p>
                      <p className="text-sm font-medium text-gray-700">To: {ride.to}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">
                        📅 {new Date(ride.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        🕐 {new Date(ride.date).toLocaleTimeString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">
                        👥 {ride.availableSeats} seats available
                      </p>
                      <p className="text-lg font-bold text-blue-600">
                        ₹ {ride.price}
                      </p>
                    </div>
                  </div>

                  {/* Book Button */}
                  <div className="flex items-center">
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                      Book Ride
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
};

export default SearchRides;