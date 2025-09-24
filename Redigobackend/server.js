const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const rideRoutes = require("./Routes/Rideroutes");
const authRoutes = require("./Routes/Authroutes");
const otpRoutes = require("./Routes/otpRoutes");

const app = express();

app.use(cors());
app.use(express.json());


app.use("/api/rides", rideRoutes);
app.use("/auth" , authRoutes);
app.use("/auth", otpRoutes);

connectDB();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
