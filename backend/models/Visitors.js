const mongoose = require("mongoose");

// One document per browser (visitorId lives in the visitor's localStorage).
const visitorSchema = new mongoose.Schema({
  visitorId: { type: String, required: true, unique: true, index: true },
  lastSessionId: String,
  browser: String,
  os: String,
  device: { type: String, enum: ["desktop", "mobile", "tablet"], default: "desktop" },
  referrer: String,          // first-touch source (hostname) – "" means direct
  currentPage: String,
  visitCount: { type: Number, default: 0 },   // page views
  sessionCount: { type: Number, default: 0 },
  resumeDownloads: { type: Number, default: 0 },
  firstVisit: Date,
  lastVisit: { type: Date, index: true },
  pages: [{ page: String, count: Number, firstVisit: Date, lastVisit: Date, _id: false }],
});

module.exports = mongoose.model("VisitorProfile", visitorSchema);
