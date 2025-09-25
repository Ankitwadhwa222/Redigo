import { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // ✅ missing import
import {
  CalendarIcon,
  Car,
  MapPin,
  Clock,
  Users,
  IndianRupee,
} from "lucide-react";
import Header from "../components/Navbar";
import Footer from "../components/Footer";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const PublishRide = () => {
  const { rideId } = useParams(); // ✅ now works
  const [formData, setFormData] = useState({
    from: "",
    fromCoords: null,
    to: "",
    toCoords: null,
    date: "",
    time: "",
    availableSeats: "",
    price: "",
    driverName: "",
    phone: "",
    email: "",
    carModel: "",
    carColor: "",
    licensePlate: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [suggestions, setSuggestions] = useState({ from: [], to: [] });

  useEffect(() => {
    if (rideId) {
      fetch(`http://localhost:5000/api/rides/${rideId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            const ride = data.ride;
            console.log(ride);
            
            setFormData({
              from: ride.ride.from || "",
              to: ride.ride.to || "",
              date: ride.ride.date ? ride.ride.date.split("T")[0] : "",
              time: ride.ride.time || "",
              availableSeats: ride.ride.availableSeats || "",
              price: ride.ride.price || "",
              distance: ride.ride.distance || "",
              duration: ride.duration || "",
              driverName: ride.ride.driver && ride.ride.driver.name ? ride.ride.driver.name : "",
              phone: ride.ride.driver && ride.ride.driver.phone ? ride.ride.driver.phone : "",
              email: ride.ride.driver && ride.ride.driver.email ? ride.ride.driver.email : "",
              carModel: ride.ride.car && ride.ride.car.model ? ride.ride.car.model : "",
              carColor: ride.ride.car && ride.ride.car.color ? ride.ride.car.color : "",
              licensePlate: ride.ride.car && ride.ride.car.licensePlate ? ride.ride.car.licensePlate : "",
              notes: ride.ride.notes || ""
            });

          }
        })
        .catch((err) => console.error("Error fetching ride:", err));
    }
  }, [rideId]);

  const fetchPredictions = async (input, type) => {
    if (!input) {
      setSuggestions((prev) => ({ ...prev, [type]: [] }));
      return;
    }
    try {
      const response = await fetch(
        `https://places.googleapis.com/v1/places:autocomplete?key=${GOOGLE_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input,
            sessionToken: crypto.randomUUID(),
          }),
        }
      );
      const data = await response.json();
      if (data?.suggestions) {
        setSuggestions((prev) => ({ ...prev, [type]: data.suggestions }));
      }
    } catch (err) {
      console.error("Autocomplete error:", err);
    }
  };

  const fetchPlaceDetails = async (placeId, type) => {
    try {
      const response = await fetch(
        `https://places.googleapis.com/v1/places/${placeId}?key=${GOOGLE_API_KEY}&fields=location,formattedAddress`
      );
      const data = await response.json();
      if (data) {
        setFormData((prev) => ({
          ...prev,
          [type]: data.formattedAddress || "",
          [`${type}Coords`]: data.location
            ? {
                lat: data.location.latitude,
                lng: data.location.longitude,
              }
            : null,
        }));
      }
    } catch (err) {
      console.error("Place details error:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "from" || name === "to") {
      fetchPredictions(value, name);
    }
  };

  const handleSelect = (s, type) => {
    const description = s.placePrediction?.text?.text;
    const placeId = s.placePrediction?.placeId;

    setFormData({ ...formData, [type]: description });
    setSuggestions((prev) => ({ ...prev, [type]: [] }));

    if (placeId) {
      fetchPlaceDetails(placeId, type);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (
      !formData.from ||
      !formData.to ||
      !formData.date ||
      !formData.time ||
      !formData.availableSeats ||
      !formData.price ||
      !formData.driverName ||
      !formData.phone
    ) {
      setMessage("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`);

      const rideData = {
        from: formData.from,
        fromCoords: formData.fromCoords,
        to: formData.to,
        toCoords: formData.toCoords,
        date: dateTime.toISOString(),
        time: formData.time,
        availableSeats: parseInt(formData.availableSeats),
        price: parseFloat(formData.price),
        driver: {
          name: formData.driverName,
          rating: 5,
          phone: formData.phone,
          email: formData.email || undefined,
        },
        car: {
          model: formData.carModel || undefined,
          color: formData.carColor || undefined,
          licensePlate: formData.licensePlate || undefined,
        },
        notes: formData.notes || undefined,
      };

      const token = localStorage.getItem("token");

      // ✅ Switch between Create & Update
      const url = rideId
        ? `http://localhost:5000/api/rides/${rideId}`
        : "http://localhost:5000/api/rides/addRide";
      const method = rideId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify(rideData),
      });

      const result = await response.json();
      if (result.success) {
        setMessage(
          rideId
            ? "✅ Ride updated successfully!"
            : "✅ Ride published successfully!"
        );
        if (!rideId) {
          setFormData({
            from: "",
            fromCoords: null,
            to: "",
            toCoords: null,
            date: "",
            time: "",
            availableSeats: "",
            price: "",
            driverName: "",
            phone: "",
            email: "",
            carModel: "",
            carColor: "",
            licensePlate: "",
            notes: "",
          });
        }
      } else {
        setMessage(`❌ Error: ${result.message || "Failed to save ride"}`);
      }
    } catch (error) {
      console.error("Error publishing ride:", error);
      setMessage("❌ Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto bg-white shadow-md rounded-2xl p-8">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2 justify-center">
            <Car className="h-6 w-6 text-blue-600" />
            <span className="text-cyan-900">
              {rideId ? "Edit Your Ride" : "Publish Your Ride"}
            </span>
          </h2>

           {message && (
            <div
              className={`mb-6 p-4 rounded-lg text-center ${
                message.includes("✅")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* From & To with Autocomplete */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className=" text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" /> From *
                </label>
                <input
                  type="text"
                  name="from"
                  value={formData.from}
                  onChange={handleChange}
                  placeholder="Starting location"
                  required
                  className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {suggestions.from.length > 0 && (
                  <ul className="absolute z-10 bg-white border rounded-lg mt-1 w-full max-h-40 overflow-y-auto shadow">
                    {suggestions.from.map((s, i) => (
                      <li
                        key={i}
                        onClick={() => handleSelect(s, "from")}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {s.placePrediction?.text?.text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="relative">
                <label className=" text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" /> To *
                </label>
                <input
                  type="text"
                  name="to"
                  value={formData.to}
                  onChange={handleChange}
                  placeholder="Destination"
                  required
                  className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {suggestions.to.length > 0 && (
                  <ul className="absolute z-10 bg-white border rounded-lg mt-1 w-full max-h-40 overflow-y-auto shadow">
                    {suggestions.to.map((s, i) => (
                      <li
                        key={i}
                        onClick={() => handleSelect(s, "to")}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {s.placePrediction?.text?.text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Date & Time */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-blue-600" /> Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]} // Prevent past dates
                  className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className=" text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" /> Departure Time *
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Seats & Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" /> Available Seats *
                </label>
                <select
                  name="availableSeats"
                  value={formData.availableSeats}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select seats</option>
                  <option value="1">1 seat</option>
                  <option value="2">2 seats</option>
                  <option value="3">3 seats</option>
                  <option value="4">4 seats</option>
                  <option value="5">5 seats</option>
                  <option value="6">6 seats</option>
                </select>
              </div>
              <div>
                <label className=" text-sm font-medium text-gray-700 flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-blue-600" /> Price per Seat *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  required
                  className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Driver Information */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Driver Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Driver Name *
                  </label>
                  <input
                    type="text"
                    name="driverName"
                    value={formData.driverName}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                    className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    required
                    className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Car Details */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Car Information (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Car Model
                  </label>
                  <input
                    type="text"
                    name="carModel"
                    value={formData.carModel}
                    onChange={handleChange}
                    placeholder="e.g., Toyota Camry"
                    className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Car Color
                  </label>
                  <input
                    type="text"
                    name="carColor"
                    value={formData.carColor}
                    onChange={handleChange}
                    placeholder="e.g., White"
                    className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  License Plate
                </label>
                <input
                  type="text"
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleChange}
                  placeholder="MH 01 AB 1234"
                  className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Additional Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional info (pickup points, preferences, etc.)"
                className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              ></textarea>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-800 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? rideId
                    ? "Updating Ride..."
                    : "Publishing Ride..."
                  : rideId
                  ? "Update Ride"
                  : "Publish Ride"}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PublishRide;
