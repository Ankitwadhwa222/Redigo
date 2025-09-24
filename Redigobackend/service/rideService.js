const Ride = require("../models/Ride");

const addRide = async (rideData) => {
  try {
    const newRide = new Ride(rideData);
    await newRide.save();
    return { success: true, message: "Ride added successfully", ride: newRide };
  } catch (err) {
    return { success: false, message: err.message };
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

    const rides = await Ride.find(query).sort({ price: 1 });
    return { success: true, rides };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

module.exports = { addRide, searchRides };
