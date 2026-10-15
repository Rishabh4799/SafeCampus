
const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const {
  createEmergency,
  getMyEmergencies,
  getAllEmergencies,
  updateEmergencyStatus,
} = require("../controllers/emergencyController");

const router = express.Router();

// Student routes
router.post("/", protect, createEmergency);
router.get("/my", protect, getMyEmergencies);

// Admin routes
router.get("/admin", protect, adminOnly, getAllEmergencies);
router.put("/:id/status", protect, adminOnly, updateEmergencyStatus);

module.exports = router;
