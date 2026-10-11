
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const incidentRoutes = require("./routes/incidentRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/emergency", emergencyRoutes);
console.log("Emergency router loaded:", typeof emergencyRoutes);
console.log(
  "Emergency router stack:",
  emergencyRoutes.stack.map((layer) => ({
    path: layer.route?.path,
    methods: layer.route
      ? Object.keys(layer.route.methods)
      : [],
  }))
);
// Temporary emergency diagnostic route
app.get("/api/emergency/test", (req, res) => {
  res.status(200).json({
    message: "Emergency route is reachable",
  });
});

// Home route
app.get("/", (req, res) => {
  res.status(200).send("SafeCampus Backend is running!");
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Connect to MongoDB and start the server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });

