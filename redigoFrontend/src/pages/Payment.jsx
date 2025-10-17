import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { 
  CreditCard, 
  Shield, 
  Clock, 
  MapPin, 
  User, 
  Car, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader
} from "lucide-react";

const PaymentPage = () => {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('razorpay');
  const [rideDetails, setRideDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // ✅ Get current user from localStorage/token
  useEffect(() => {
    const getUserData = () => {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");
        
        if (userData) {
          setCurrentUser(JSON.parse(userData));
        } else if (token) {
          // Decode token or fetch user data
          // For now, create a default user object
          setCurrentUser({ 
            _id: "user-from-token",
            name: "User",
            email: "user@example.com"
          });
        } else {
          // Guest user
          setCurrentUser({ 
            _id: "guest-user",
            name: "Guest User",
            email: ""
          });
        }
      } catch (error) {
        console.error("Error getting user data:", error);
        setCurrentUser({ 
          _id: "default-user",
          name: "User",
          email: ""
        });
      }
    };

    getUserData();
  }, []);

  // ✅ Fetch ride details using rideId from URL
  useEffect(() => {
    const fetchRideDetails = async () => {
      try {
        setLoading(true);
        console.log("Fetching ride details for ID:", rideId);

        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/rides/${rideId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        
        console.log("Ride details fetched:", response.data);
        const rideData = response.data.ride.ride || response.data;
        setRideDetails(rideData);
        
      } catch (error) {
        console.error("Error fetching ride details:", error);
        
        // ✅ Fallback data
        setRideDetails({
          from: "Your Current Location",
          to: "Destination",
          date: new Date().toISOString(),
          price: 150,
          time: "15 minutes",
          passengerName: "User",
          passengerEmail: "",
          passengerPhone: ""
        });
      } finally {
        setLoading(false);
      }
    };

    if (rideId) {
      fetchRideDetails();
    } else {
      console.error("No rideId found in URL");
      setLoading(false);
    }
  }, [rideId]);

  // ✅ Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // ✅ Calculate total amount
  const calculateTotalAmount = () => {
    if (!rideDetails?.price) return 0;
    const basePrice = Number(rideDetails.price);
    const platformFee = 10;
    const gst = Math.round(basePrice * 0.1);
    return basePrice + platformFee + gst;
  };

const handleRazorpayPayment = async () => {
  try {
    setIsProcessing(true);
    setPaymentStatus(null);

    const totalAmount = calculateTotalAmount();
    const userId = currentUser?._id;

    const requestData = {
      amount: Number(totalAmount),
      rideId: String(rideId),
      userId: String(userId)
    };

    console.log("📤 Making payment request...");

    // 1️⃣ Create Razorpay Order
    const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/payments/create-order`, requestData, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    console.log("✅ Order created successfully:", data);

    // ✅ Check if we have valid order data
    if (!data.order || !data.order.id) {
      console.error("❌ Invalid order data:", data);
      throw new Error("Invalid order response from server");
    }

    const { id: order_id, amount: orderAmount, currency } = data.order;
    
    console.log("🔍 Order details:", { 
      order_id, 
      orderAmount, 
      currency,
      razorpay_key: import.meta.env.VITE_RAZORPAY_KEY_ID 
    });

    // ✅ Check if Razorpay key exists
    if (!import.meta.env.VITE_RAZORPAY_KEY_ID) {
      console.error("❌ Razorpay key not found in environment");
      throw new Error("Razorpay key not configured");
    }

    // ✅ Check if Razorpay script is loaded
    console.log("🔍 Checking Razorpay script:", typeof window.Razorpay);
    
    if (!window.Razorpay) {
      console.error("❌ Razorpay script not loaded");
      throw new Error("Razorpay script not loaded. Please refresh the page.");
    }

    // 2️⃣ Razorpay Checkout Options
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: orderAmount,
      currency: currency,
      name: "Redigo - Ride Share",
      description: `Payment for ride from ${rideDetails?.from || 'Unknown'} to ${rideDetails?.to || 'Unknown'}`,
      image: "/logo.png", // Make sure this image exists or remove this line
      order_id: order_id,
      handler: async function (response) {
        try {
          console.log("💳 Payment successful:", response);
          
          // Verify payment
          const verifyRes = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/payments/verify-payment`, 
            {
              ...response,
              rideId,
              userId
            },
            {
              headers: {
                "Content-Type": "application/json"
              }
            }
          );

          if (verifyRes.data.success) {
            setPaymentStatus('success');
            setTimeout(() => {
              navigate(`/ride/${rideId}/tracking`);
            }, 2000);
          } else {
            setPaymentStatus('failed');
          }
        } catch (error) {
          console.error('❌ Payment verification error:', error);
          setPaymentStatus('failed');
        }
      },
      modal: {
        ondismiss: function() {
          console.log("💔 Payment cancelled by user");
          setIsProcessing(false);
          setPaymentStatus('cancelled');
        }
      },
      theme: {
        color: "#000000",
      },
      prefill: {
        name: rideDetails?.passengerName || currentUser?.name || "User",
        email: rideDetails?.passengerEmail || currentUser?.email || "",
        contact: rideDetails?.passengerPhone || ""
      }
    };

    console.log("🚀 Razorpay options:", options);

    // 3️⃣ Open Razorpay Checkout
    console.log("🎯 Creating Razorpay instance...");
    const razor = new window.Razorpay(options);
    
    console.log("🎯 Opening Razorpay checkout...");
    razor.open();
    
  } catch (error) {
    console.error('❌ Payment initiation error:', error);
    console.error('❌ Error details:', error.response?.data);
    setPaymentStatus('failed');
    alert(`Payment failed: ${error.message}`); // Show user-friendly error
  } finally {
    setIsProcessing(false);
  }
};
// ✅ Better Razorpay script loading
useEffect(() => {
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      // Check if script is already loaded
      if (window.Razorpay) {
        console.log("✅ Razorpay script already loaded");
        resolve(true);
        return;
      }

      // Check if script tag already exists
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        existingScript.onload = () => {
          console.log("✅ Razorpay script loaded from existing tag");
          resolve(true);
        };
        return;
      }

      // Create new script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      
      script.onload = () => {
        console.log("✅ Razorpay script loaded successfully");
        resolve(true);
      };
      
      script.onerror = () => {
        console.error("❌ Failed to load Razorpay script");
        resolve(false);
      };
      
      document.body.appendChild(script);
    });
  };

  loadRazorpayScript();
}, []);

  // ✅ Handle back navigation
  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  // ✅ Show error if no rideId
  if (!rideId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Ride</h2>
          <p className="text-gray-600 mb-6">No ride ID found in the URL</p>
          <button
            onClick={handleBack}
            className="w-full bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ✅ Loading State
  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading payment details...</p>
          <p className="text-sm text-gray-500 mt-2">Ride ID: {rideId}</p>
        </div>
      </div>
    );
  }

  // ✅ Payment Success Animation
  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600">Your ride has been booked successfully</p>
          </div>
          
          <div className="bg-gray-50 rounded-2xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Amount Paid</span>
              <span className="text-2xl font-bold text-green-600">₹{calculateTotalAmount()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ride ID</span>
              <span className="text-sm font-mono text-gray-800">#{rideId?.slice(-8)}</span>
            </div>
          </div>

          <div className="animate-pulse">
            <p className="text-sm text-gray-500">Redirecting to ride tracking...</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Payment Failed State
  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-600">Something went wrong with your payment</p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => setPaymentStatus(null)}
              className="w-full bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleBack}
              className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Main Payment Page
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-full mr-3"
          >
            <ArrowLeft className="h-6 w-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Payment</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* ✅ DEBUG SECTION - Remove in production */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <h3 className="font-bold text-blue-800 mb-2">🔍 Debug Info:</h3>
          <div className="text-sm space-y-1">
            <p><strong>RideId:</strong> {rideId}</p>
            <p><strong>UserId:</strong> {currentUser?._id}</p>
            <p><strong>Amount:</strong> ₹{calculateTotalAmount()}</p>
            <p><strong>Base Price:</strong> ₹{rideDetails?.price}</p>
          </div>
        </div>

        {/* Ride Summary Card */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Ride Summary</h2>
          
          {/* Route */}
          <div className="flex items-start space-x-3 mb-4">
            <div className="flex flex-col items-center mt-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="w-0.5 h-8 bg-gray-300 my-1"></div>
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-sm text-gray-500">From</p>
                <p className="font-medium text-gray-900">{rideDetails?.from || 'Loading...'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">To</p>
                <p className="font-medium text-gray-900">{rideDetails?.to || 'Loading...'}</p>
              </div>
            </div>
          </div>

          {/* Trip Details */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Date & Time</span>
              <span className="font-medium">
                {rideDetails?.date ? new Date(rideDetails.date).toLocaleDateString() : 'Today'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Duration</span>
              <span className="font-medium">{rideDetails?.time || 'Calculating...'}</span>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h2>
          
          <div className="space-y-3">
            {/* Razorpay Option */}
            <label className="flex items-center p-4 border-2 border-gray-200 rounded-2xl cursor-pointer hover:border-blue-300 transition-colors">
              <input
                type="radio"
                name="paymentMethod"
                value="razorpay"
                checked={selectedPaymentMethod === 'razorpay'}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                className="hidden"
              />
              <div className={`w-5 h-5 rounded-full mr-3 border-2 flex items-center justify-center ${
                selectedPaymentMethod === 'razorpay' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
              }`}>
                {selectedPaymentMethod === 'razorpay' && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <div className="flex items-center flex-1">
                <CreditCard className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Cards, UPI, Wallet</p>
                  <p className="text-sm text-gray-500">Powered by Razorpay</p>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Price Breakdown</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Base Fare</span>
              <span className="font-medium">₹{rideDetails?.price || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Platform Fee</span>
              <span className="font-medium">₹10</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">GST (10%)</span>
              <span className="font-medium">₹{Math.round((rideDetails?.price || 0) * 0.1)}</span>
            </div>
            <hr className="my-3" />
            <div className="flex justify-between items-center text-lg">
              <span className="font-bold text-gray-900">Total Amount</span>
              <span className="font-bold text-green-600">₹{calculateTotalAmount()}</span>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="bg-blue-50 rounded-2xl p-4 flex items-center space-x-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <p className="font-medium text-blue-900">Secure Payment</p>
            <p className="text-sm text-blue-600">Your payment is protected by 256-bit SSL encryption</p>
          </div>
        </div>

        {/* Payment Button */}
        <button
          onClick={handleRazorpayPayment}
          disabled={isProcessing || !rideDetails?.price}
          className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isProcessing ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <CreditCard className="h-5 w-5" />
              <span>Pay ₹{calculateTotalAmount()}</span>
            </>
          )}
        </button>

        {/* Payment Status */}
        {paymentStatus === 'cancelled' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-center">
            <p className="text-yellow-800 font-medium">Payment was cancelled</p>
            <p className="text-yellow-600 text-sm">You can try again when ready</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;