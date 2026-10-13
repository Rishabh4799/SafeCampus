
const express = require("express");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const {
  createIncident,
  getMyIncidents,
  getAllIncidents,
  updateIncidentStatus,
  getIncidentStatistics,
} = require("../controllers/incidentController");

const router = express.Router();

// Student routes
router.post("/", protect, createIncident);
router.get("/my", protect, getMyIncidents);

// Admin routes
router.get("/", protect, adminOnly, getAllIncidents);
router.put("/:id/status", protect, adminOnly, updateIncidentStatus);
router.get(
  "/admin/statistics",
  protect,
  adminOnly,
  getIncidentStatistics
);
module.exports = router;
