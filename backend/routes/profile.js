const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile");
const auth = require("../middleware/auth");

const DEFAULT_PROFILE = {
  name: "Agam Tyagi",
  title: "Full Stack Developer",
  subtitle: "AI Integration Engineer",
  tagline: "Building production-grade web apps with real AI — computer vision, LLMs, and everything in between.",
  badge: "Open to Opportunities",
  githubUrl: "https://github.com",
  linkedinUrl: "https://linkedin.com",
  resumeUrl: "/Agam_Tyagi_Resume.pdf",
  stats: [
    { num: "2+", label: "Years Experience" },
    { num: "5+", label: "Production Apps" },
    { num: "10+", label: "REST APIs Built" },
    { num: "8+", label: "Projects" },
  ],
  aboutPara1: "I'm a Full Stack Developer & AI Integration Engineer based in Chandigarh, currently building production apps at Backup Infotech.",
  aboutPara2: "What sets me apart — I don't just build websites. I integrate real AI into products: face authentication systems, LLM-powered assistants, OCR pipelines, and computer vision that actually works in production.",
  aboutPara3: "MCA from Chandigarh University, with hands-on experience across PHP, Node.js, React, Python, FastAPI and more. I've shipped 5+ production apps, built 10+ REST APIs, and integrated real payment systems.",
  aboutTags: ["PHP", "Node.js", "React", "Python", "FastAPI", "DeepFace", "MediaPipe", "PostgreSQL"],
  aboutCards: [
    { icon: "🤖", title: "AI/ML Integration", desc: "DeepFace, MediaPipe, OpenCV, LLMs — actual AI engineering, not just API calls" },
    { icon: "⚡", title: "Full Stack", desc: "React, Node.js, PHP, Laravel, FastAPI — end to end delivery across the stack" },
    { icon: "🔒", title: "Auth & Security", desc: "JWT, RBAC, biometric auth, liveness detection, anti-spoofing systems" },
    { icon: "🚀", title: "Production Ready", desc: "5+ deployed apps with real clients, payment integration & thousands of requests" },
  ],
  location: "Chandigarh, India",
};

// GET /api/profile (public)
router.get("/", async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create(DEFAULT_PROFILE);
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// PUT /api/profile (admin)
router.put("/", auth, async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create(req.body);
    } else {
      profile = await Profile.findByIdAndUpdate(profile._id, req.body, { new: true });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

module.exports = router;
