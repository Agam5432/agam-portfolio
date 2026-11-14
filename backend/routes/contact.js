const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const requireAuth = require("../middleware/auth");
const { Resend } = require("resend");

const esc = (v) => String(v).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const getResend = () => {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set on the server");
  return new Resend(process.env.RESEND_API_KEY);
};

// POST /api/contact
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body || {};

    if (![name, email, message].every(v => typeof v === "string" && v.trim())) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (name.length > 100 || email.length > 200 || message.length > 3000) {
      return res.status(400).json({ error: "Input too long" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    // Save to MongoDB
    await Contact.create({ name, email, message });

    // Send email using Resend
    const { error: sendError } = await getResend().emails.send({
      from: "Portfolio <onboarding@resend.dev>",
      to: ["agamtyagi2001@gmail.com"], // 👈 change this
      subject: `Portfolio Contact: ${name.replace(/[\r\n]/g, " ").slice(0, 80)}`,
      html: `
        <h3>New Contact from Portfolio</h3>
        <p><strong>Name:</strong> ${esc(name)}</p>
        <p><strong>Email:</strong> ${esc(email)}</p>
        <p><strong>Message:</strong> ${esc(message).replace(/\n/g, "<br>")}</p>
      `,
    });
    // Resend returns { error } instead of throwing. The message is already saved in MongoDB (visible in the admin panel),
    // so don't fail the visitor, but make the problem visible in the server logs.
    if (sendError) console.error("Contact notification email failed:", sendError.message || sendError);

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