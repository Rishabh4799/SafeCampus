
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


const getAllIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find()
      .populate("reportedBy", "fullName email studentId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: incidents.length,
      incidents,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve incidents",
    });
  }
};

const updateIncidentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Under Review",
      "Resolved",
      "Rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid incident status",
        allowedStatuses,
      });
    }

    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!incident) {
      return res.status(404).json({
        message: "Incident not found",
      });
    }

    return res.status(200).json({
      message: "Incident status updated successfully",
      incident,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid incident ID",
      });
    }

    console.error("Update incident error:", error.message);

    return res.status(500).json({
      message: "Server error while updating incident",
    });
  }
};


const getIncidentStatistics = async (req, res) => {
  try {
    const total = await Incident.countDocuments();

    const pending = await Incident.countDocuments({
      status: "Pending",
    });

    const underReview = await Incident.countDocuments({
      status: "Under Review",
    });

    const resolved = await Incident.countDocuments({
      status: "Resolved",
    });

    const rejected = await Incident.countDocuments({
      status: "Rejected",
    });

    return res.status(200).json({
      total,
      pending,
      underReview,
      resolved,
      rejected,
    });
  } catch (error) {
    console.error("Incident statistics error:", error.message);

    return res.status(500).json({
      message: "Failed to retrieve incident statistics",
    });
  }
};
module.exports = {
  createIncident,
  getMyIncidents,
  getAllIncidents,
  updateIncidentStatus,
  getIncidentStatistics,
};