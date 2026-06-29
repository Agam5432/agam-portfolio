const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const requireAuth = require("../middleware/auth");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// POST /api/contact
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Save to MongoDB
    await Contact.create({ name, email, message });

    // Send email using Resend
    await resend.emails.send({
      from: "Portfolio <onboarding@resend.dev>",
      to: ["agamtyagi2001@gmail.com"], // 👈 change this
      subject: `Portfolio Contact: ${name}`,
      html: `
        <h3>New Contact from Portfolio</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    });

    return res.json({
      success: true,
      message: "Message sent successfully!",
    });

  } catch (err) {
    console.error("Contact error:", err);
    return res.status(500).json({ error: "Failed to send message." });
  }
});

// GET /api/contact (admin only)
router.get("/", requireAuth, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

module.exports = router;