const mongoose = require("mongoose");

const VisitorSchema = new mongoose.Schema({

  visitorId: {
    type: String,   // 🔥 ADD THIS (VERY IMPORTANT)
    index: true
  },

  sessionId: String,

  browser: String,
  os: String,
  device: String,

  referrer: String,
  currentPage: String,

  visitCount: {
    type: Number,
    default: 1
  },

  sessionCount: {          // 🔥 ADD THIS
    type: Number,
    default: 1
  },

  lastVisit: {
    type: Date,
    default: Date.now
  },

  resumeDownloaded: {
    type: Boolean,
    default: false
  }

});

module.exports = mongoose.model("Visitors", VisitorSchema);