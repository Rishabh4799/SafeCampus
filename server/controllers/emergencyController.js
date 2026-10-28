
const Emergency = require("../models/Emergency");

// Student: Create an emergency alert
const createEmergency = async (req, res) => {
  try {
    const { message, location } = req.body;

    const emergency = await Emergency.create({
      message: message || "Emergency assistance requested",
      location: location || "Location not provided",
      triggeredBy: req.user._id,
    });

    return res.status(201).json({
      message: "Emergency alert created successfully",
      emergency,
    });
  } catch (error) {
    console.error("Create emergency error:", error);
    return res.status(500).json({
      message: "Server error while creating emergency alert",
    });
  }
};

// Student: Get their own emergency alerts
const getMyEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.find({
      triggeredBy: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      count: emergencies.length,
      emergencies,
    });
  } catch (error) {
    console.error("Get my emergencies error:", error);
    return res.status(500).json({
      message: "Server error while fetching your emergency alerts",
    });
  }
};

// Admin: Get all emergency alerts
const getAllEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.find()
      .populate("triggeredBy", "fullName email studentId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: emergencies.length,
      emergencies,
    });
  } catch (error) {
    console.error("Get all emergencies error:", error);
    return res.status(500).json({
      message: "Server error while fetching emergency alerts",
    });
  }
};

// Admin: Update emergency alert status
const updateEmergencyStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["Active", "Acknowledged", "Resolved"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid emergency status",
      });
    }

    const emergency = await Emergency.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate("triggeredBy", "fullName email studentId");

    if (!emergency) {
      return res.status(404).json({
        message: "Emergency alert not found",
      });
    }

    return res.status(200).json({
      message: "Emergency status updated successfully",
      emergency,
    });
  } catch (error) {
    console.error("Update emergency status error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid emergency alert ID",
      });
    }

    return res.status(500).json({
      message: "Server error while updating emergency status",
    });
  }
};

module.exports = {
  createEmergency,
  getMyEmergencies,
  getAllEmergencies,
  updateEmergencyStatus,
};
