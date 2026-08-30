const DisasterReport = require("../models/disasterReport");
const ThresholdConfig = require("../models/thresholdConfig");

// =========================================================
// CREATE REPORT
// =========================================================

// @desc    Create a new disaster report & auto-calculate severity
// @route   POST /api/reports
exports.createReport = async (req, res) => {
  try {
    const {
      crisisType,
      description,
      division,
      district,
      subdistrict,
      manualAddress,
      latitude,
      longitude,
    } = req.body;

    // -------------------------------------------------------
    // Validate crisis type
    // -------------------------------------------------------

    if (!crisisType || !String(crisisType).trim()) {
      return res.status(400).json({
        success: false,
        message: "Crisis type is required.",
      });
    }

    // -------------------------------------------------------
    // Validate description
    // -------------------------------------------------------

    if (!description || !String(description).trim()) {
      return res.status(400).json({
        success: false,
        message: "Description is required.",
      });
    }

    // -------------------------------------------------------
    // Validate district
    // -------------------------------------------------------

    if (!district || !String(district).trim()) {
      return res.status(400).json({
        success: false,
        message: "District is required.",
      });
    }

    // -------------------------------------------------------
    // Validate subdistrict
    // -------------------------------------------------------

    if (!subdistrict || !String(subdistrict).trim()) {
      return res.status(400).json({
        success: false,
        message: "District and Sub-district are required.",
      });
    }

    // -------------------------------------------------------
    // Normalize coordinates
    // -------------------------------------------------------

    const parsedLatitude =
      latitude !== null && latitude !== undefined && latitude !== ""
        ? Number(latitude)
        : null;

    const parsedLongitude =
      longitude !== null && longitude !== undefined && longitude !== ""
        ? Number(longitude)
        : null;

    // -------------------------------------------------------
    // Validate coordinates when supplied
    // -------------------------------------------------------

    if (parsedLatitude !== null && !Number.isFinite(parsedLatitude)) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude.",
      });
    }

    if (parsedLongitude !== null && !Number.isFinite(parsedLongitude)) {
      return res.status(400).json({
        success: false,
        message: "Invalid longitude.",
      });
    }

    // -------------------------------------------------------
    // Create report
    // -------------------------------------------------------

    const report = await DisasterReport.create({
      crisisType: String(crisisType).trim(),

      description: String(description).trim(),

      division: division ? String(division).trim() : "",

      district: String(district).trim(),

      subdistrict: String(subdistrict).trim(),

      manualAddress: manualAddress ? String(manualAddress).trim() : "",

      latitude: parsedLatitude,

      longitude: parsedLongitude,
    });

    // =======================================================
    // LOAD THRESHOLD CONFIGURATION
    // =======================================================

    /*
     * IMPORTANT:
     *
     * The old code imported ThresholdConfig but called:
     *
     *     Threshold.findOne()
     *
     * which causes:
     *
     *     ReferenceError: Threshold is not defined
     *
     * We use ThresholdConfig consistently.
     */

    let config = null;

    try {
      config = await ThresholdConfig.findOne();
    } catch (configError) {
      console.error("Threshold configuration lookup failed:", configError);
    }

    config = config || {
      windowHours: 1,
      mediumThreshold: 5,
      criticalThreshold: 10,
    };

    // -------------------------------------------------------
    // Safely normalize threshold values
    // -------------------------------------------------------

    const windowHours =
      Number(config.windowHours) > 0 ? Number(config.windowHours) : 1;

    const mediumThreshold =
      Number(config.mediumThreshold) > 0 ? Number(config.mediumThreshold) : 5;

    const criticalThreshold =
      Number(config.criticalThreshold) > 0
        ? Number(config.criticalThreshold)
        : 10;

    // =======================================================
    // ROLLING TIME WINDOW
    // =======================================================

    const windowStart = new Date(Date.now() - windowHours * 60 * 60 * 1000);

    // -------------------------------------------------------
    // Match reports in same district/subdistrict
    // -------------------------------------------------------

    const windowQuery = {
      createdAt: {
        $gte: windowStart,
      },

      district: report.district,

      subdistrict: report.subdistrict,
    };

    // =======================================================
    // COUNT REPORTS
    // =======================================================

    const totalReportsInWindow =
      await DisasterReport.countDocuments(windowQuery);

    // =======================================================
    // CALCULATE SEVERITY
    // =======================================================

    let calculatedSeverity = "Low";

    if (totalReportsInWindow >= criticalThreshold) {
      calculatedSeverity = "Critical";
    } else if (totalReportsInWindow >= mediumThreshold) {
      calculatedSeverity = "Medium";
    }

    // =======================================================
    // UPDATE REPORTS IN SAME WINDOW
    // =======================================================

    await DisasterReport.updateMany(windowQuery, {
      $set: {
        severity: calculatedSeverity,
      },
    });

    // -------------------------------------------------------
    // Update current report object
    // -------------------------------------------------------

    report.severity = calculatedSeverity;

    // =======================================================
    // RESPONSE
    // =======================================================

    return res.status(201).json({
      success: true,

      message: "Emergency report submitted successfully.",

      data: report,

      windowStats: {
        totalReportsInWindow,

        calculatedSeverity,

        windowHours,

        mediumThreshold,

        criticalThreshold,
      },
    });
  } catch (error) {
    console.error("CREATE REPORT ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Server error while creating disaster report.",

      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

// =========================================================
// GET ALL REPORTS
// =========================================================

// @desc    Get all disaster reports
// @route   GET /api/reports
exports.getAllReports = async (req, res) => {
  try {
    const reports = await DisasterReport.find({}).sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error("GET REPORTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

// =========================================================
// GET ACTIVE INCIDENTS
// =========================================================

// @route GET /api/reports/active
exports.getActiveIncidents = async (req, res) => {
  try {
    const incidents = await DisasterReport.find({
      status: {
        $regex: /^verified$/i,
      },
    }).sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      data: incidents,
    });
  } catch (error) {
    console.error("GET ACTIVE INCIDENTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch active incidents",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

// =========================================================
// GET REPORT BY ID
// =========================================================

// @route GET /api/reports/:id
exports.getReportById = async (req, res) => {
  try {
    const report = await DisasterReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    return res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("GET REPORT BY ID ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching report",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

// =========================================================
// VERIFY REPORT
// =========================================================

// @route PUT /api/reports/:id/verify
exports.verifyReport = async (req, res) => {
  try {
    const report = await DisasterReport.findByIdAndUpdate(
      req.params.id,
      {
        status: "verified",
      },
      {
        returnDocument: "after",
      },
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    return res.json({
      success: true,
      message: "Report verified successfully",
      data: report,
    });
  } catch (error) {
    console.error("VERIFY REPORT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify report",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

// =========================================================
// REJECT REPORT
// =========================================================

// @route PUT /api/reports/:id/reject
exports.rejectReport = async (req, res) => {
  try {
    const report = await DisasterReport.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
      },
      {
        returnDocument: "after",
      },
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    return res.json({
      success: true,
      message: "Report rejected",
      data: report,
    });
  } catch (error) {
    console.error("REJECT REPORT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reject report",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

// =========================================================
// UPDATE SEVERITY
// =========================================================

// @route PUT /api/reports/:id/severity
exports.updateSeverity = async (req, res) => {
  try {
    const { severity } = req.body;

    if (!["Low", "Medium", "Critical"].includes(severity)) {
      return res.status(400).json({
        success: false,
        message: "Severity must be Low, Medium, or Critical.",
      });
    }

    const report = await DisasterReport.findByIdAndUpdate(
      req.params.id,
      {
        severity,
      },
      {
        returnDocument: "after",
      },
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    return res.json({
      success: true,
      message: "Severity updated",
      data: report,
    });
  } catch (error) {
    console.error("UPDATE SEVERITY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update severity",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

// =========================================================
// RESOLVE REPORT
// =========================================================

// @route PUT /api/reports/:id/resolve
exports.resolveReport = async (req, res) => {
  try {
    const report = await DisasterReport.findByIdAndUpdate(
      req.params.id,
      {
        status: "resolved",
      },
      {
        returnDocument: "after",
      },
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    return res.json({
      success: true,
      message: "Report resolved successfully",
      data: report,
    });
  } catch (error) {
    console.error("RESOLVE REPORT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to resolve report",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

// =========================================================
// MAP CLUSTERS
// =========================================================

// @route GET /api/reports/map-clusters
exports.getMapClusters = async (req, res) => {
  try {
    let config = null;

    try {
      config = await ThresholdConfig.findOne();
    } catch (configError) {
      console.error("Threshold config lookup failed:", configError);
    }

    config = config || {
      windowHours: 1,
    };

    const windowHours =
      Number(config.windowHours) > 0 ? Number(config.windowHours) : 1;

    const windowStart = new Date(Date.now() - windowHours * 60 * 60 * 1000);

    const clusters = await DisasterReport.aggregate([
      {
        $match: {
          createdAt: {
            $gte: windowStart,
          },

          status: {
            $regex: /^verified$/i,
          },
        },
      },

      {
        $group: {
          _id: {
            district: "$district",
            subdistrict: "$subdistrict",
            crisisType: "$crisisType",
          },

          reportCount: {
            $sum: 1,
          },

          reportIds: {
            $push: "$_id",
          },

          severity: {
            $first: "$severity",
          },

          latestReportTime: {
            $max: "$createdAt",
          },

          latitude: {
            $first: "$latitude",
          },

          longitude: {
            $first: "$longitude",
          },

          reports: {
            $push: {
              _id: "$_id",
              description: "$description",
              manualAddress: "$manualAddress",
              createdAt: "$createdAt",
            },
          },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      count: clusters.length,
      data: clusters,
    });
  } catch (error) {
    console.error("MAP CLUSTERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

// =========================================================
// BATCH RESOLVE
// =========================================================

// @route PUT /api/reports/batch-resolve
exports.batchResolve = async (req, res) => {
  try {
    const { reportIds } = req.body;

    if (!reportIds || !Array.isArray(reportIds) || reportIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No report IDs provided.",
      });
    }

    const result = await DisasterReport.updateMany(
      {
        _id: {
          $in: reportIds,
        },
      },
      {
        $set: {
          status: "Resolved",
          resolvedAt: new Date(),
        },
      },
    );

    return res.status(200).json({
      success: true,
      message: `Successfully resolved ${result.modifiedCount} reports.`,
    });
  } catch (error) {
    console.error("BATCH RESOLVE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};
