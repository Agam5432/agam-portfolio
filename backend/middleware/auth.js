const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }

  try {
    // After a password reset, older sessions stop working.
    const admin = await Admin.findOne({}, "passwordChangedAt").lean();
    if (
      admin?.passwordChangedAt &&
      decoded.iat < Math.floor(admin.passwordChangedAt.getTime() / 1000)
    ) {
      return res.status(401).json({ error: "Session expired. Please log in again." });
    }
  } catch (err) {
    console.error("Auth check error:", err.message);
    return res.status(500).json({ error: "Authentication check failed" });
  }

  req.admin = decoded;
  next();
};
