const express = require("express");
const router = express.Router();
const Education = require("../models/Education");
const auth = require("../middleware/auth");

// GET all education entries (public)
router.get("/", async (req, res) => {
  try {
    const edu = await Education.find().sort({ order: 1 });
    res.json(edu);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch education" });
  }
});

// POST create education (admin)
router.post("/", auth, async (req, res) => {
  try {
    const edu = await Education.create(req.body);
    res.json(edu);
  } catch (err) {
    res.status(500).json({ error: "Failed to create education entry" });
  }
});

// PUT update education (admin)
router.put("/:id", auth, async (req, res) => {
  try {
    const edu = await Education.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(edu);
  } catch (err) {
    res.status(500).json({ error: "Failed to update education entry" });
  }
});

// DELETE education (admin)
router.delete("/:id", auth, async (req, res) => {
  try {
    await Education.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete education entry" });
  }
});

module.exports = router;
