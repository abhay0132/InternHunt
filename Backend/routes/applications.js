// routes/applications.js
const express = require("express");
const router = express.Router();
const Application = require("../models/applicationInfo");
const Internship = require("../models/internshipInfo");
const authenticate = require("../middleware/auth");
const { Op } = require("sequelize");

// @route   POST /api/applications/:internshipId/initiate
// @desc    Mark internship as "clicked to apply"
router.post("/:internshipId/initiate", authenticate, async (req, res) => {
  try {
    const { internshipId } = req.params;

    // Check if internship exists and deadline hasn't passed
    const internship = await Internship.findByPk(internshipId);
    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
      });
    }

    if (internship.deadline && new Date(internship.deadline) < new Date()) {
      return res.status(410).json({
        success: false,
        message: "Application deadline has passed",
      });
    }

    // Check if application already exists
    let application = await Application.findOne({
      where: {
        userId: req.user.id,
        internshipId,
      },
    });

    if (application) {
      return res.json({
        success: true,
        message: "Application already initiated",
        data: { application },
      });
    }

    // Create application with "pending" status
    application = await Application.create({
      userId: req.user.id,
      internshipId,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Application initiated",
      data: { application, applyLink: internship.applyLink },
    });
  } catch (error) {
    console.error("Initiate application error:", error);
    res.status(500).json({
      success: false,
      message: "Error initiating application",
      error: error.message,
    });
  }
});

// @route   PUT /api/applications/:internshipId/status
// @desc    Update application status (applied/not_applied)
router.put("/:internshipId/status", authenticate, async (req, res) => {
  try {
    const { internshipId } = req.params;
    const { status } = req.body; // "applied" or "not_applied"

    if (!["applied", "not_applied"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'applied' or 'not_applied'",
      });
    }

    const application = await Application.findOne({
      where: {
        userId: req.user.id,
        internshipId,
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found. Please initiate first.",
      });
    }

    await application.update({
      status,
      appliedAt: status === "applied" ? new Date() : null,
    });

    res.json({
      success: true,
      message: `Application marked as ${status}`,
      data: { application },
    });
  } catch (error) {
    console.error("Update application status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating application status",
      error: error.message,
    });
  }
});

// @route   GET /api/applications
// @desc    Get all user applications
router.get("/", authenticate, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const whereClause = { userId: req.user.id };
    if (status) {
      whereClause.status = status;
    }

    const offset = (page - 1) * limit;

    const { count, rows: applications } = await Application.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Internship,
          attributes: [
            "id",
            "title",
            "company",
            "location",
            "type",
            "stipend",
            "applyLink",
            "deadline",
          ],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching applications",
      error: error.message,
    });
  }
});

// @route   DELETE /api/applications/:internshipId
// @desc    Delete an application
router.delete("/:internshipId", authenticate, async (req, res) => {
  try {
    const { internshipId } = req.params;

    const application = await Application.findOne({
      where: {
        userId: req.user.id,
        internshipId,
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    await application.destroy();

    res.json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    console.error("Delete application error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting application",
      error: error.message,
    });
  }
});

module.exports = router;