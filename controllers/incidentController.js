
const Incident = require("../models/Incident");

const createIncident = async (req, res) => {
  try {
    const { title, description, category, location } = req.body;

    if (
      !title?.trim() ||
      !description?.trim() ||
      !category ||
      !location?.trim()
    ) {
      return res.status(400).json({
        message: "Title, description, category, and location are required",
      });
    }

    const incident = await Incident.create({
      title: title.trim(),
      description: description.trim(),
      category,
      location: location.trim(),
      reportedBy: req.user._id,
    });

    return res.status(201).json({
      message: "Incident reported successfully",
      incident,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid incident data",
        errors: Object.values(error.errors).map((item) => item.message),
      });
    }

    console.error("Create incident error:", error);

    return res.status(500).json({
      message: "Server error while reporting incident",
    });
  }
};

const getMyIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find({
      reportedBy: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      count: incidents.length,
      incidents,
    });
  } catch (error) {
    console.error("Get incidents error:", error);

    return res.status(500).json({
      message: "Server error while fetching incidents",
    });
  }
};

module.exports = {
  createIncident,
  getMyIncidents,
};
