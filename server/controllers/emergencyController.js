const Emergency = require("../models/Emergency");

const createEmergency = async (req, res) => {
  try {
    const { message, location } = req.body;

    const emergency = await Emergency.create({
      message:
        typeof message === "string" && message.trim()
          ? message.trim()
          : "Emergency assistance requested",
      location:
        typeof location === "string" && location.trim()
          ? location.trim()
          : "Location not provided",
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
    console.error("Get emergencies error:", error);

    return res.status(500).json({
      message: "Server error while fetching emergency alerts",
    });
  }
};

module.exports = {
  createEmergency,
  getMyEmergencies,
};