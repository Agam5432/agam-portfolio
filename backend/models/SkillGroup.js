const mongoose = require("mongoose");

const skillGroupSchema = new mongoose.Schema({
  label: { type: String, required: true },
  chips: [String],
  isAI: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("SkillGroup", skillGroupSchema);
