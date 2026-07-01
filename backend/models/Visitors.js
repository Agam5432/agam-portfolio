const mongoose = require("mongoose");

const PageVisitSchema = new mongoose.Schema({
  page: { type: String, required: true },
  count: { type: Number, default: 1 },
  firstVisit: { type: Date, default: Date.now },
  lastVisit: { type: Date, default: Date.now }
}, { _id: false });

const VisitorSchema = new mongoose.Schema({

  visitorId: {
    type: String,
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
    default: 0
  },

  sessionCount: {
    type: Number,
    default: 0
  },

  lastVisit: {
    type: Date,
    default: Date.now
  },

  resumeDownloaded: {
    type: Boolean,
    default: false
  },

  // 🆕 Page history — har page ka count aur timestamps
  pages: {
    type: [PageVisitSchema],
    default: []
  },

  // 🆕 Pehli baar kab aaya
  firstVisit: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Visitors", VisitorSchema);