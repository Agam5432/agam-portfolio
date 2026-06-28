const express = require("express");
const router = express.Router();
const Experience = require("../models/Experience");
const auth = require("../middleware/auth");

// GET all experiences (public)
router.get("/", async (req, res) => {
  try {
    const experiences = await Experience.find().sort({ order: 1 });
    res.json(experiences);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch experiences" });
  }
});

// POST create experience (admin)
router.post("/", auth, async (req, res) => {
  try {
    const exp = await Experience.create(req.body);
    res.json(exp);
  } catch (err) {
    res.status(500).json({ error: "Failed to create experience" });
  }
});

// PUT update experience (admin)
router.put("/:id", auth, async (req, res) => {
  try {
    const exp = await Experience.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(exp);
  } catch (err) {
    res.status(500).json({ error: "Failed to update experience" });
  }
});

// DELETE experience (admin)
router.delete("/:id", auth, async (req, res) => {
  try {
    await Experience.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete experience" });
  }
});

module.exports = router;
