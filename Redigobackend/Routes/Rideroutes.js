const express = require("express");
const { createRide, findRides } = require("../controllers/rideController");
const { protect } = require("../middlewares/protect");

const router = express.Router();

router.post("/addRide", protect, createRide);
router.get("/search", findRides);

module.exports = router;
