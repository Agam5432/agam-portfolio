const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  // Hero section
  name: { type: String, default: "Agam Tyagi" },
  title: { type: String, default: "Full Stack Developer" },
  subtitle: { type: String, default: "AI Integration Engineer" },
  tagline: { type: String, default: "Building production-grade web apps with real AI — computer vision, LLMs, and everything in between." },
  badge: { type: String, default: "Open to Opportunities" },
  githubUrl: { type: String, default: "https://github.com" },
  linkedinUrl: { type: String, default: "https://linkedin.com" },
  resumeUrl: { type: String, default: "/Agam_Tyagi_Resume.pdf" },
  stats: [{
    num: String,
    label: String
  }],

  // About section
  aboutPara1: { type: String, default: "I'm a Full Stack Developer & AI Integration Engineer based in Chandigarh, currently building production apps at Backup Infotech." },
  aboutPara2: { type: String, default: "What sets me apart — I don't just build websites. I integrate real AI into products: face authentication systems, LLM-powered assistants, OCR pipelines, and computer vision that actually works in production." },
  aboutPara3: { type: String, default: "MCA from Chandigarh University, with hands-on experience across PHP, Node.js, React, Python, FastAPI and more. I've shipped 5+ production apps, built 10+ REST APIs, and integrated real payment systems." },
  aboutTags: [String],
  aboutCards: [{
    icon: String,
    title: String,
    desc: String
  }],

  location: { type: String, default: "Chandigarh, India" },
}, { timestamps: true });

module.exports = mongoose.model("Profile", profileSchema);
