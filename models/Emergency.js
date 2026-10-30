const mongoose = require("mongoose");

const emergencySchema = new mongoose.Schema(
  {
    message: {
      type: String,
      trim: true,
      default: "Emergency assistance requested",
    },
    location: {
      type: String,
      trim: true,
      default: "Location not provided",
    },
    status: {
      type: String,
      enum: ["Active", "Acknowledged", "Resolved"],
      default: "Active",
    },
    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Emergency", emergencySchema);