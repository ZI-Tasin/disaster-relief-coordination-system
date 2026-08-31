const mongoose = require("mongoose");

const volunteerSchema = new mongoose.Schema(
  {
    // links this profile back to the account that owns it -- added this so
    // authMiddleware's req.user._id can find "my" profile without an :id param
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one volunteer profile per account, no duplicates
    },
    fullName: { type: String, required: true },
    idNumber: { type: String, required: true }, // from NID/Student ID
    phone: { type: String, required: true },
    district: { type: String, required: true },
    bloodType: { type: String },
    skills: [{ type: String }], // e.g. ["First Aid", "Search & Rescue"]
    status: {
      type: String,
      enum: ["available", "unavailable"],
      default: "available",
    },
    // -- Task Assignment Board --
    // kept separate from `status` above so the volunteer's own availability
    // toggle doesn't get tangled up with admin dispatch actions.
    assignedIncident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DisasterReport",
      default: null,
    },
    assignmentStage: {
      type: String,
      enum: ["none", "assigned", "deployed"], // "deployed" is the entry point into the finer stage tracker below (Dispatched -> ... -> Distributed)
      default: "none",
    },
    // -- Relief Distribution Stage Tracker --
    // fine-grained sub-stage inside "deployed"; null until the volunteer logs
    // their first update, cleared again once the mission completes/is released
    deliveryStage: {
      type: String,
      enum: ["Dispatched", "In Transit", "On Site", "Distributed"],
      default: null,
    },
    // mission history is served from the real StageUpdate model via
    // GET /api/stage-updates/history (no longer mocked on the frontend)
  },
  { timestamps: true },
);

module.exports = mongoose.model("Volunteer", volunteerSchema);
