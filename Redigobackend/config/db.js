const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    console.log("⚠️ Server will continue without database connection. Some features may not work.");
    // process.exit(1); // Commented out to allow server to start
  }
};

module.exports = connectDB;
