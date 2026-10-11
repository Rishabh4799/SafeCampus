const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const {
  createIncident,
  getMyIncidents,
} = require("../controllers/incidentController");

const router = express.Router();

router.post("/", protect, createIncident);
router.get("/my", protect, getMyIncidents);

module.exports = router;
