const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const {
  createEmergency,
  getMyEmergencies,
} = require("../controllers/emergencyController");

const router = express.Router();

// Create an emergency alert
router.post("/", protect, createEmergency);

// Get the logged-in student's emergency alerts
router.get("/my", protect, getMyEmergencies);

module.exports = router;