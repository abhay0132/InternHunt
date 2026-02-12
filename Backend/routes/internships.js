// routes/internships.js
const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const Internship = require("../models/internshipInfo");
const Application = require("../models/applicationInfo");
const Bookmark = require("../models/bookmarks");
const authenticate = require("../middleware/auth");

// @route   GET /api/internships
// @desc    Get all active internships (deadline not passed)
router.get("/", authenticate, async (req, res) => {
  try {
    const {
      search,
      type,
      location,
      skills,
      page = 1,
      limit = 20,
    } = req.query;

    const whereClause = {
      // Filter out internships with passed deadlines
      [Op.or]: [
        { deadline: null },
        { deadline: { [Op.gte]: new Date() } }
      ]
    };

    // Search filter
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { company: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Type filter
    if (type) {
      whereClause.type = type;
    }

    // Location filter
    if (location) {
      whereClause.location = { [Op.iLike]: `%${location}%` };
    }

    // Skills filter
    if (skills) {
      const skillsArray = skills.split(",").map((s) => s.trim());
      whereClause.skills = { [Op.overlap]: skillsArray };
    }

    const offset = (page - 1) * limit;

    const { count, rows: internships } = await Internship.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    // Get user's applications and bookmarks
    const internshipIds = internships.map((i) => i.id);
    
    const userApplications = await Application.findAll({
      where: {
        userId: req.user.id,
        internshipId: { [Op.in]: internshipIds },
      },
    });

    const userBookmarks = await Bookmark.findAll({
      where: {
        userId: req.user.id,
        internshipId: { [Op.in]: internshipIds },
      },
    });

    const applicationMap = new Map(
      userApplications.map((app) => [app.internshipId, app.status])
    );
    const bookmarkSet = new Set(
      userBookmarks.map((bm) => bm.internshipId)
    );

    // Attach user-specific data
    const internshipsWithStatus = internships.map((internship) => ({
      ...internship.toJSON(),
      isApplied: applicationMap.get(internship.id) === "applied",
      applicationStatus: applicationMap.get(internship.id) || null,
      isBookmarked: bookmarkSet.has(internship.id),
    }));

    res.json({
      success: true,
      data: {
        internships: internshipsWithStatus,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get internships error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching internships",
      error: error.message,
    });
  }
});

// @route   GET /api/internships/:id
// @desc    Get single internship
router.get("/:id", authenticate, async (req, res) => {
  try {
    const internship = await Internship.findByPk(req.params.id);

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
      });
    }

    // Check if deadline passed
    if (internship.deadline && new Date(internship.deadline) < new Date()) {
      return res.status(410).json({
        success: false,
        message: "This internship application deadline has passed",
      });
    }

    // Get user's application status
    const application = await Application.findOne({
      where: {
        userId: req.user.id,
        internshipId: internship.id,
      },
    });

    // Get bookmark status
    const bookmark = await Bookmark.findOne({
      where: {
        userId: req.user.id,
        internshipId: internship.id,
      },
    });

    res.json({
      success: true,
      data: {
        internship: {
          ...internship.toJSON(),
          isApplied: application?.status === "applied",
          applicationStatus: application?.status || null,
          isBookmarked: !!bookmark,
        },
      },
    });
  } catch (error) {
    console.error("Get internship error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching internship",
      error: error.message,
    });
  }
});

module.exports = router;