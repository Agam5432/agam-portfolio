const mongoose = require("mongoose");

// Single admin account. Created automatically the first time the password is reset.
// Until then, login keeps using ADMIN_USERNAME / ADMIN_PASSWORD from the environment.
const adminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, default: null },
    passwordChangedAt: { type: Date, default: null },

    // Password reset (code is stored hashed, never in plain text)
    resetCodeHash: { type: String, default: null },
    resetCodeExpires: { type: Date, default: null },
    resetAttempts: { type: Number, default: 0 },
    resetRequestedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);
