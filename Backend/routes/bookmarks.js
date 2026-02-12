// routes/bookmarks.js
const express = require("express");
const router = express.Router();
const Bookmark = require("../models/bookmarks");
const Internship = require("../models/internshipInfo");
const authenticate = require("../middleware/auth");
const { Op } = require("sequelize");

// @route   POST /api/bookmarks/:internshipId
// @desc    Add bookmark
router.post("/:internshipId", authenticate, async (req, res) => {
  try {
    const { internshipId } = req.params;

    // Check if internship exists
    const internship = await Internship.findByPk(internshipId);
    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
      });
    }

    // Check if already bookmarked
    const existing = await Bookmark.findOne({
      where: {
        userId: req.user.id,
        internshipId,
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Already bookmarked",
      });
    }

    const bookmark = await Bookmark.create({
      userId: req.user.id,
      internshipId,
    });

    res.status(201).json({
      success: true,
      message: "Bookmark added",
      data: { bookmark },
    });
  } catch (error) {
    console.error("Add bookmark error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding bookmark",
      error: error.message,
    });
  }
});

// @route   DELETE /api/bookmarks/:internshipId
// @desc    Remove bookmark
router.delete("/:internshipId", authenticate, async (req, res) => {
  try {
    const { internshipId } = req.params;

    const bookmark = await Bookmark.findOne({
      where: {
        userId: req.user.id,
        internshipId,
      },
    });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: "Bookmark not found",
      });
    }

    await bookmark.destroy();

    res.json({
      success: true,
      message: "Bookmark removed",
    });
  } catch (error) {
    console.error("Remove bookmark error:", error);
    res.status(500).json({
      success: false,
      message: "Error removing bookmark",
      error: error.message,
    });
  }
});

// @route   GET /api/bookmarks
// @desc    Get all user bookmarks
router.get("/", authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: bookmarks } = await Bookmark.findAndCountAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Internship,
          where: {
            [Op.or]: [
              { deadline: null },
              { deadline: { [Op.gte]: new Date() } }
            ]
          },
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: {
        bookmarks,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get bookmarks error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching bookmarks",
      error: error.message,
    });
  }
});

module.exports = router;