import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Header from "../components/Navbar";
import { Delete, Edit, Edit2, Edit2Icon } from "lucide-react";
import { useNavigate } from "react-router-dom";

function DashboardPage() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Not authorized. Please log in again.");
          setLoading(false);
          return;
        }

        const res = await axios.get(`${import.meta.env.BACKEND_URL}/api/user/profile`, {
          headers: {
            Authorization: `${token}`,
          },
        });
     //    console.log(res);
        

        setUserInfo(res.data.user);
        console.log(res.data.user);
        
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleDeleteRide = async (rideId) => {
    if (!window.confirm("Are you sure you want to delete this ride?")) return;

    setLoading(true);
    try {
      await axios.delete(`${import.meta.env.BACKEND_URL}/api/user/rides/${rideId}`, {
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
        },
      });
      setUserInfo((prev) => ({
      ...prev,
      rides: prev.rides.filter((ride) => ride._id !== rideId),
      totalRides: prev.totalRides - 1  
    }));

  
    alert("Ride deleted successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to delete ride.");
    } finally {
      setLoading(false);
    }
  };
  const handleEditRide = (ride) => {
    navigate(`/user/rides/edit-ride/${ride._id}`);
  }
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-semibold">
        Loading your dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-600 font-semibold">
        {error}
      </div>
    );
  }

  return (
     <>
      <Header />
    <div className="max-w-7xl mx-auto px-4 py-6 ">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">
          Welcome back, {userInfo?.name}!
        </h1>
        <p className="text-gray-600">
          Here's an overview of your ridesharing activity
        </p>
      </div>

     
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">Rides Offered</div>
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs">
              🚗
            </div>
          </div>
          <div className="text-2xl font-bold mt-3">{userInfo?.totalRides}</div>
          <div className="text-sm text-gray-500">Total rides you've posted</div>
        </div>

       
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">Rides Booked</div>
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs">
              👥
            </div>
          </div>
          <div className="text-2xl font-bold mt-3">{userInfo?.ridesBooked || "0"}</div>
          <div className="text-sm text-gray-500">Trips you've joined</div>
        </div>

   
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">Earnings</div>
            <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 text-xs">
              ₹
            </div>
          </div>
          <div className="text-2xl font-bold mt-3">
            ₹{userInfo?.earnings}
          </div>
          <div className="text-sm text-gray-500">Money earned from rides</div>
        </div>

     
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">Savings</div>
            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs">
              💰
            </div>
          </div>
          <div className="text-2xl font-bold mt-3">
            ₹{userInfo?.savings}
          </div>
          <div className="text-sm text-gray-500">Money spent on rides</div>
        </div>
      </div>

    
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Your Rides ({userInfo?.rides?.length || 0})
            </h2>
            <Link
              to="/add-ride"
              className="bg-cyan-800 hover:bg-cyan-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Post New Ride
            </Link>
          </div>
          {userInfo?.rides?.length > 0 ? (
  <ul className="space-y-3">
    {userInfo.rides.map((ride) => (
      <li key={ride._id} className="border p-3 rounded-md shadow-sm">
        <div>
          <Delete className="w-4 h-4 text-red-600 float-right ml-2 cursor-pointer" onClick={() => handleDeleteRide(ride._id)} />
          <Edit2 className="w-4 h-4 text-gray-700 float-right cursor-pointer" onClick={() => handleEditRide(ride)} />
        </div>
        <p className="font-medium">{ride.from} → {ride.to}</p>
        <p className="text-sm text-gray-600">
          {new Date(ride.date).toLocaleDateString()} at {ride.time}
        </p>
        <p className="text-sm text-gray-600">₹{ride.price}</p>
      </li>
    ))}
  </ul>
) : (
  <div className="text-center py-8">
    <div className="text-4xl text-gray-300 mb-4">🚗</div>
    <p className="mb-4">You haven't posted any rides yet</p>
     
  </div>
)}

        </div>

       
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Your Bookings ({userInfo?.ridesBooked || "0"})
            </h2>
            <Link
              to="/search-rides"
              className="bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
            >
              Find More Rides
            </Link>
          </div>
          {userInfo?.ridesBooked === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl text-gray-300 mb-4">👥</div>
              <p className="mb-4">You haven't booked any rides yet</p>
              <Link
                to="/search"
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md text-sm font-medium"
              >
                Find Your First Ride
              </Link>
            </div>
          ) : (
            <p className="text-gray-600">Your bookings will be listed here.</p>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

export default DashboardPage;
