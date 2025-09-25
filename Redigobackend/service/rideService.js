const Ride = require("../models/Ride");
const User = require("../models/User");


const addRide = async (rideData, user) => {
  try {
     
    const rideWithUser = {
      ...rideData,
      driver: {
        userId: user._id, // ✅ matches schema
        name: user.name,
        phone: user.phone || rideData.driver?.phone || "",
        email: user.email || rideData.driver?.email || "",
        rating: user.rating || 5,
      },
    };

    const newRide = new Ride(rideWithUser);
    await newRide.save();

    // ✅ push ride into user's rides array
    await User.findByIdAndUpdate(
      user._id,
      { $push: { rides: newRide._id } },
      { new: true }
    );

    return {
      success: true,
      message: "Ride added successfully",
      ride: newRide,
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
};


const searchRides = async (queryParams) => {
  try {
    const { from, to, date, passengers } = queryParams;
    const query = {};

    if (from) query.from = { $regex: from, $options: "i" };
    if (to) query.to = { $regex: to, $options: "i" };

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    if (passengers) {
      query.availableSeats = { $gte: Number(passengers) };
    }

    query.status = "active";

    const rides = await Ride.find(query)
                           .populate('driver.userId', 'name email')
                           .sort({ price: 1 });
    
    return { success: true, rides };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

// Get ride by ID (for booking/details)
const getRideById = async (rideId) => {
  try {
    const ride = await Ride.findById(rideId)
                          .populate('driver.userId', 'name email');
    
    if (!ride) {
      return {
        success: false,
        message: "Ride not found"
      };
    }

    return {
      success: true,
      ride
    };
  } catch (err) {
    return {
      success: false,
      message: err.message
    };
  }
};

const editRide = async (rideId, userId, updateData) => {
  try {
    console.log("🔧 EditRide called:", { rideId, userId, updateData });
    
    // ✅ First, get the existing ride to preserve driver info
    const existingRide = await Ride.findOne({ 
      _id: rideId, 
      'driver.userId': userId 
    });

    if (!existingRide) {
      return {
        success: false,
        message: "Ride not found or you are not authorized to edit it"
      };
    }

    // ✅ Prepare update data while preserving driver.userId
    const safeUpdateData = { ...updateData };
    
    // ✅ If driver info is being updated, preserve the userId
    if (updateData.driver) {
      safeUpdateData.driver = {
        ...existingRide.driver.toObject(), // Preserve existing driver data
        ...updateData.driver,              // Apply updates
        userId: existingRide.driver.userId // Ensure userId is preserved
      };
    }

    console.log("🔄 Safe update data:", safeUpdateData);

    // Find and update the ride
    const ride = await Ride.findOneAndUpdate(
      { 
        _id: rideId, 
        'driver.userId': userId   
      },
      { $set: safeUpdateData },
      { new: true, runValidators: true }
    );

    console.log("✅ Ride updated successfully:", ride);

    return {
      success: true,
      message: "Ride updated successfully",
      ride
    };
  } catch (err) {
    console.error("❌ EditRide error:", err);
    return {
      success: false,
      message: err.message
    };
  }
};

module.exports = { 
  addRide, 
  searchRides,
  getRideById,
  editRide
};