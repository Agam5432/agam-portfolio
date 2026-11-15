const mongoose = require("mongoose");

// Append-only event log used for trends (daily chart, top pages, referrers).
const eventSchema = new mongoose.Schema({
  type: { type: String, enum: ["view", "resume"], required: true },
  visitorId: { type: String, required: true },
  sessionId: String,
  page: String,
  referrer: String,
  device: String,
  browser: String,
  os: String,
  at: { type: Date, default: Date.now },
});
eventSchema.index({ type: 1, at: -1 });
// Keep ~13 months of events; aggregates on Visitor stay forever.
eventSchema.index({ at: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 400 });

module.exports = mongoose.model("AnalyticsEvent", eventSchema);
