const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema({
  degree: { type: String, required: true },
  uni: { type: String, required: true },
  year: { type: String, required: true },
  icon: { type: String, default: "🎓" },
  highlight: { type: Boolean, default: false },
  note: { type: String, default: "" },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Education", educationSchema);
