const mongoose = require("mongoose");

// Single-document store for the uploaded resume PDF.
// Render's disk is ephemeral, so the file lives in MongoDB instead.
const resumeSchema = new mongoose.Schema({
  filename: { type: String, default: "Agam_Tyagi_Resume.pdf" },
  contentType: { type: String, default: "application/pdf" },
  size: Number,
  data: { type: Buffer, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Resume", resumeSchema);
