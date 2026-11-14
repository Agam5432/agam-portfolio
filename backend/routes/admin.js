const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const Contact = require("../models/Contact");
const Project = require("../models/Project");
const ChatMessage = require("../models/ChatMessage");
const Admin = require("../models/Admin");
const auth = require("../middleware/auth");
const { sendResetCodeEmail } = require("../services/emailService");

const RESET_CODE_MINUTES = 10;
const RESET_MAX_ATTEMPTS = 5;
const RESET_COOLDOWN_MS = 60 * 1000;
const MIN_PASSWORD_LENGTH = 10;

const sha = (v) => crypto.createHash("sha256").update(String(v)).digest();
const safeEqual = (a, b) => crypto.timingSafeEqual(sha(a), sha(b));
const hashCode = (code) =>
  crypto.createHmac("sha256", process.env.JWT_SECRET).update(String(code)).digest("hex");

const forgotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { error: "Too many reset requests. Try again later." },
});
const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many attempts. Try again later." },
});

// POST /api/admin/login
// Uses the password saved in the database after a reset. Until a reset happens,
// it falls back to ADMIN_USERNAME / ADMIN_PASSWORD from the environment.
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (typeof username !== "string" || typeof password !== "string") {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const admin = await Admin.findOne({ username: process.env.ADMIN_USERNAME });
    let ok = false;

    if (admin && admin.passwordHash) {
      ok =
        safeEqual(username, admin.username) &&
        (await bcrypt.compare(password, admin.passwordHash));
    } else {
      ok =
        !!process.env.ADMIN_USERNAME &&
        !!process.env.ADMIN_PASSWORD &&
        safeEqual(username, process.env.ADMIN_USERNAME) &&
        safeEqual(password, process.env.ADMIN_PASSWORD);
    }

    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ admin: true }, process.env.JWT_SECRET, { expiresIn: "7d" });
    return res.json({ token });
  } catch (err) {
    console.error("Admin login error:", err.message);
    return res.status(500).json({ error: "Login failed" });
  }
});

// POST /api/admin/forgot-password
// Emails a 6-digit code to ADMIN_RESET_EMAIL (falls back to OWNER_EMAIL).
// The address is never taken from the request, so nobody can redirect the code.
router.post("/forgot-password", forgotLimiter, async (req, res) => {
  try {
    const username = process.env.ADMIN_USERNAME;
    const to = process.env.ADMIN_RESET_EMAIL || process.env.OWNER_EMAIL || "agamtyagi2001@gmail.com";
    if (!username || !to || !process.env.JWT_SECRET) {
      console.error("Password reset not configured (ADMIN_USERNAME, JWT_SECRET)");
      return res.status(500).json({ error: "Password reset is not configured." });
    }

    const existing = await Admin.findOne({ username });
    if (
      existing?.resetRequestedAt &&
      Date.now() - existing.resetRequestedAt.getTime() < RESET_COOLDOWN_MS
    ) {
      return res.status(429).json({ error: "Please wait a minute before requesting another code." });
    }

    const code = String(crypto.randomInt(0, 1000000)).padStart(6, "0");
    await Admin.findOneAndUpdate(
      { username },
      {
        $set: {
          resetCodeHash: hashCode(code),
          resetCodeExpires: new Date(Date.now() + RESET_CODE_MINUTES * 60 * 1000),
          resetAttempts: 0,
          resetRequestedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    try {
      await sendResetCodeEmail({ to, code, minutes: RESET_CODE_MINUTES });
    } catch (mailErr) {
      console.error("Reset email failed:", mailErr.message);
      await Admin.updateOne(
        { username },
        { $set: { resetCodeHash: null, resetCodeExpires: null, resetRequestedAt: null } }
      );
      return res.status(500).json({ error: "Could not send the code email. Check email settings." });
    }

    return res.json({ message: "A reset code has been sent to the admin email." });
  } catch (err) {
    console.error("Forgot password error:", err.message);
    return res.status(500).json({ error: "Something went wrong." });
  }
});

// POST /api/admin/reset-password   { code, newPassword }
router.post("/reset-password", resetLimiter, async (req, res) => {
  try {
    const { code, newPassword } = req.body || {};
    if (typeof code !== "string" || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: "Enter the 6-digit code." });
    }
    if (
      typeof newPassword !== "string" ||
      newPassword.length < MIN_PASSWORD_LENGTH ||
      newPassword.length > 128
    ) {
      return res
        .status(400)
        .json({ error: `Password must be ${MIN_PASSWORD_LENGTH}-128 characters.` });
    }

    const username = process.env.ADMIN_USERNAME;
    const passwordHash = await bcrypt.hash(newPassword, 12);
    const now = new Date();

    // Atomic: the code can be used once, only before expiry, only within the attempt limit.
    const consumed = await Admin.findOneAndUpdate(
      {
        username,
        resetCodeHash: hashCode(code),
        resetCodeExpires: { $gt: now },
        resetAttempts: { $lt: RESET_MAX_ATTEMPTS },
      },
      {
        $set: {
          passwordHash,
          passwordChangedAt: now,
          resetCodeHash: null,
          resetCodeExpires: null,
          resetAttempts: 0,
        },
      }
    );

    if (!consumed) {
      await Admin.updateOne(
        { username, resetCodeHash: { $ne: null } },
        { $inc: { resetAttempts: 1 } }
      );
      return res.status(400).json({ error: "Invalid or expired code." });
    }

    return res.json({ success: true, message: "Password updated. You can log in now." });
  } catch (err) {
    console.error("Reset password error:", err.message);
    return res.status(500).json({ error: "Something went wrong." });
  }
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
