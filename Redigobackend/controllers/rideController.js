const { addRide, searchRides } = require("../service/rideService");

const createRide = async (req, res) => {
  const result = await addRide(req.body);
  if (result.success) return res.status(201).json(result);
  return res.status(500).json(result);
};

const findRides = async (req, res) => {
  const result = await searchRides(req.query);
  if (result.success) return res.status(200).json(result);
  return res.status(500).json(result);
};

module.exports = { createRide, findRides };
