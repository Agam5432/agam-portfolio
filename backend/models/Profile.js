const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  // Hero section
  name: { type: String, default: "Agam Tyagi" },
  title: { type: String, default: "AI Engineer" },
  subtitle: { type: String, default: "AI Integration Engineer" },
  tagline: { type: String, default: "Building production-grade web apps with real AI — computer vision, LLMs, and everything in between." },
  badge: { type: String, default: "Open to Opportunities" },
  githubUrl: { type: String, default: "https://github.com/Agam5432" },
  email: { type: String, default: "agamtyagi2001@gmail.com"},
  phone: { type: String, default: "+91 82181 85432" },
  linkedinUrl: { type: String, default: "https://www.linkedin.com/in/agam-tyagi-6624a7204" },
  resumeUrl: { type: String, default: "/Agam_Tyagi_Resume.pdf" },
  stats: [{
    num: String,
    label: String
  }],

  // About section
  aboutPara1: { type: String, default: "I'm an AI Engineer based in Mohali, Punjab, at Backup Infotech." },
  aboutPara2: { type: String, default: "What sets me apart — I don't just build websites. I integrate real AI into products: face authentication systems, LLM-powered assistants, OCR pipelines, and computer vision that actually works in production." },
  aboutPara3: { type: String, default: "MCA from Chandigarh University, with hands-on experience across PHP, Node.js, React, Python, FastAPI and more. " },
  aboutTags: [String],
  aboutCards: [{
    icon: String,
    title: String,
    desc: String
  }],

  location: { type: String, default: "Mohali, Punjab, India" },
}, { timestamps: true });

module.exports = mongoose.model("Profile", profileSchema);
