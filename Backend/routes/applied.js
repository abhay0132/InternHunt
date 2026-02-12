const express = require("express");
const router = express.Router();
const Applied = require("../models/appliedInfo");

router.post("/:internshipId", async (req, res) => {
  try {
    const { userId } = req.body;
    const { internshipId } = req.params;

    await Applied.create({ UserId: userId, InternshipId: internshipId });

    res.json({ message: "Application saved!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch all applied jobs
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const applied = await Applied.findAll({
      where: { UserId: userId },
      include: ["Internship"]
    });
    res.json(applied);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
