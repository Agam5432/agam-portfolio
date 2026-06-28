const express = require("express");
const router = express.Router();
const SkillGroup = require("../models/SkillGroup");
const auth = require("../middleware/auth");

// GET all skill groups (public)
router.get("/", async (req, res) => {
  try {
    const skills = await SkillGroup.find().sort({ order: 1 });
    res.json(skills);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch skills" });
  }
});

// POST create skill group (admin)
router.post("/", auth, async (req, res) => {
  try {
    const skill = await SkillGroup.create(req.body);
    res.json(skill);
  } catch (err) {
    res.status(500).json({ error: "Failed to create skill group" });
  }
});

// PUT update skill group (admin)
router.put("/:id", auth, async (req, res) => {
  try {
    const skill = await SkillGroup.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(skill);
  } catch (err) {
    res.status(500).json({ error: "Failed to update skill group" });
  }
});

// DELETE skill group (admin)
router.delete("/:id", auth, async (req, res) => {
  try {
    await SkillGroup.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete skill group" });
  }
});

module.exports = router;
