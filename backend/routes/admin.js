const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Contact = require("../models/Contact");
const Project = require("../models/Project");
const ChatMessage = require("../models/ChatMessage");
const auth = require("../middleware/auth");

// POST /api/admin/login
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = jwt.sign({ admin: true }, process.env.JWT_SECRET, { expiresIn: "7d" });
    return res.json({ token });
  }

  res.status(401).json({ error: "Invalid credentials" });
});

// GET /api/admin/stats
router.get("/stats", auth, async (req, res) => {
  try {
    const [contacts, projects, chats] = await Promise.all([
      Contact.countDocuments(),
      Project.countDocuments(),
      ChatMessage.countDocuments()
    ]);
    res.json({ contacts, projects, chats });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// GET /api/admin/contacts
router.get("/contacts", auth, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

// DELETE /api/admin/contacts/:id
router.delete("/contacts/:id", auth, async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete contact" });
  }
});

// GET /api/admin/chats
router.get("/chats", auth, async (req, res) => {
  try {
    const chats = await ChatMessage.find().sort({ createdAt: -1 }).limit(100);
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch chats" });
  }
});

module.exports = router;
