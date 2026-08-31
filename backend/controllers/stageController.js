const Volunteer = require("../models/Volunteer");
const DisasterReport = require("../models/disasterReport");
const StageUpdate = require("../models/StageUpdate");
const { generateCertificate } = require("../services/pdfService");

const STAGE_ORDER = ["Dispatched", "In Transit", "On Site", "Distributed"];

// GET /api/stage-updates/mine -- volunteer's active mission + its update history
exports.getMyMission = async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ user: req.user._id }).populate(
      "assignedIncident",
      "crisisType district subdistrict severity status",
    );
    if (!volunteer)
      return res.status(404).json({ message: "No volunteer profile yet." });

    const updates = volunteer.assignedIncident
      ? await StageUpdate.find({
          volunteer: volunteer._id,
          incident: volunteer.assignedIncident._id,
        }).sort({ createdAt: -1 })
      : [];

    res.json({ success: true, data: { volunteer, updates } });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to load mission", error: err.message });
  }
};

// POST /api/stage-updates  { note, photoUrl? } -- logs the NEXT sequential stage
exports.submitStage = async (req, res) => {
  try {
    const { note, photoUrl } = req.body;
    if (!note || !note.trim()) {
      return res
        .status(400)
        .json({ message: "A short status note is required." });
    }

    const volunteer = await Volunteer.findOne({ user: req.user._id });
    if (!volunteer)
      return res.status(404).json({ message: "No volunteer profile yet." });

    if (
      volunteer.assignmentStage !== "deployed" ||
      !volunteer.assignedIncident
    ) {
      return res.status(409).json({
        message:
          "You need an active deployed mission before logging stage updates.",
      });
    }

    const currentIndex = volunteer.deliveryStage
      ? STAGE_ORDER.indexOf(volunteer.deliveryStage)
      : -1;
    const nextStage = STAGE_ORDER[currentIndex + 1];
    if (!nextStage) {
      return res
        .status(409)
        .json({ message: "This mission is already fully distributed." });
    }

    const update = await StageUpdate.create({
      volunteer: volunteer._id,
      incident: volunteer.assignedIncident,
      stage: nextStage,
      note: note.trim(),
      photoUrl: photoUrl || undefined,
    });

    volunteer.deliveryStage = nextStage;

    // final stage -- mission complete: free the volunteer + generate the M4 certificate
    if (nextStage === "Distributed") {
      const incident = await DisasterReport.findById(
        volunteer.assignedIncident,
      );
      const firstUpdate = await StageUpdate.findOne({
        volunteer: volunteer._id,
        incident: volunteer.assignedIncident,
        stage: "Dispatched",
      }).sort({ createdAt: 1 });

      // Generate PDF using pdfService
      const serialNumber = `DRRCS-${Date.now().toString(36).toUpperCase()}`;
      let pdfBuffer;
      try {
        pdfBuffer = await generateCertificate({
          fullName: volunteer.fullName,
          disasterZone: incident
            ? `${incident.crisisType} - ${incident.district}`
            : "Relief Mission",
          startDate: firstUpdate?.createdAt || update.createdAt,
          endDate: update.createdAt,
          serialNumber: serialNumber,
        });
        console.log(`✅ PDF generated: ${pdfBuffer.length} bytes`);
      } catch (pdfError) {
        console.error("❌ PDF generation failed:", pdfError);
        // Still free the volunteer but return error
        volunteer.status = "available";
        volunteer.assignedIncident = null;
        volunteer.assignmentStage = "none";
        volunteer.deliveryStage = null;
        await volunteer.save();

        // Resolve the incident once no volunteer is still working it -- this
        // is what removes it from the Live Incident Map and from the Task
        // Board's "Active Disasters" list (both only show status: "verified").
        if (incident) {
          const stillActive = await Volunteer.exists({
            assignedIncident: incident._id,
            assignmentStage: { $in: ["assigned", "deployed"] },
          });
          if (!stillActive) {
            incident.status = "resolved";
            await incident.save();
          }
        }

        return res.status(500).json({
          success: false,
          message: "Mission complete but certificate generation failed.",
          error: pdfError.message,
        });
      }

      // Free the volunteer
      volunteer.status = "available";
      volunteer.assignedIncident = null;
      volunteer.assignmentStage = "none";
      volunteer.deliveryStage = null;
      await volunteer.save();

      // Resolve the incident once no volunteer is still working it -- this
      // is what removes it from the Live Incident Map and from the Task
      // Board's "Active Disasters" list (both only show status: "verified").
      if (incident) {
        const stillActive = await Volunteer.exists({
          assignedIncident: incident._id,
          assignmentStage: { $in: ["assigned", "deployed"] },
        });
        if (!stillActive) {
          incident.status = "resolved";
          await incident.save();
        }
      }

      // Check if PDF buffer is valid before sending
      if (!pdfBuffer || pdfBuffer.length === 0) {
        console.error("❌ PDF buffer is empty!");
        return res.status(500).json({
          success: false,
          message: "Certificate generation produced an empty file.",
        });
      }

      console.log(`📄 Sending PDF: ${pdfBuffer.length} bytes`);

      // Return PDF directly
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=certificate-${serialNumber}.pdf`,
      );
      return res.send(pdfBuffer);
    }

    await volunteer.save();
    res.status(201).json({ success: true, data: { update, volunteer } });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to submit stage update", error: err.message });
  }
};

// GET /api/stage-updates/feed -- admin, all volunteers, reverse-chronological
exports.getFeed = async (req, res) => {
  try {
    const updates = await StageUpdate.find({})
      .populate("volunteer", "fullName district phone")
      .populate("incident", "crisisType district subdistrict severity")
      .sort({ createdAt: -1 })
      .limit(200); // feed, not an export -- keep it snappy
    res.json({ success: true, data: updates });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to load feed", error: err.message });
  }
};

// GET /api/stage-updates/history -- volunteer's completed missions
exports.getHistory = async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ user: req.user._id });
    if (!volunteer) {
      return res.status(404).json({ message: "No volunteer profile yet." });
    }

    // Find all Distributed stage updates for this volunteer
    const distributedUpdates = await StageUpdate.find({
      volunteer: volunteer._id,
      stage: "Distributed",
    }).populate("incident", "crisisType district subdistrict severity");

    // Group by incident to avoid duplicates
    const missionMap = new Map();
    for (const update of distributedUpdates) {
      const incidentId = update.incident?._id?.toString();
      if (!incidentId) continue;
      if (!missionMap.has(incidentId)) {
        // Get the first Dispatched update for this incident
        const firstUpdate = await StageUpdate.findOne({
          volunteer: volunteer._id,
          incident: incidentId,
          stage: "Dispatched",
        }).sort({ createdAt: 1 });

        missionMap.set(incidentId, {
          id: incidentId,
          incident: update.incident,
          startDate: firstUpdate?.createdAt || update.createdAt,
          endDate: update.createdAt,
          status: "Completed",
        });
      }
    }

    const history = Array.from(missionMap.values()).sort(
      (a, b) => new Date(b.endDate) - new Date(a.endDate),
    );

    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({
      message: "Failed to load mission history",
      error: err.message,
    });
  }
};
