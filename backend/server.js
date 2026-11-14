const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const analyticsRoutes = require("./routes/analytics");
require("dotenv").config();

const app = express();
// Render sits behind a proxy; needed so express-rate-limit sees real client IPs.
app.set("trust proxy", 1);

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174", 
    "https://agam-portfolio-vert.vercel.app",
    "https://agam-portfolio-admin.vercel.app",
    ...(process.env.EXTRA_CORS_ORIGINS ? process.env.EXTRA_CORS_ORIGINS.split(",").map(o => o.trim()) : []),
  ],
  credentials: true
}));
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
// Rate limiter for Nexora
const nexoraLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: "Too many requests, please try again later." }
});

const mk = (windowMs, max, error) => rateLimit({
  windowMs, max, standardHeaders: true, legacyHeaders: false, message: { error },
});
// Generous global cap for public reads; stricter caps on expensive/abusable routes.
const globalLimiter = mk(60 * 1000, 300, "Too many requests, please slow down.");
const contactLimiter = mk(60 * 60 * 1000, 5, "Too many messages, please try again later.");
const loginLimiter = mk(15 * 60 * 1000, 10, "Too many login attempts, please try again later.");

app.use("/api", globalLimiter);
app.get("/api/health", (req, res) => res.json({ ok: true, db: mongoose.connection.readyState === 1 }));

// Routes
app.use("/api/nexora", nexoraLimiter, require("./routes/nexora"));
app.use("/api/contact", (req, res, next) => (req.method === "POST" ? contactLimiter(req, res, next) : next()), require("./routes/contact"));
app.use("/api/admin/login", loginLimiter);
app.use("/api/projects", require("./routes/projects"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/analytics", analyticsRoutes);

// ── NEW DYNAMIC ROUTES ──────────────────────────────────────
app.use("/api/profile", require("./routes/profile"));
app.use("/api/skills", require("./routes/skills"));
app.use("/api/experience", require("./routes/experience"));
app.use("/api/education", require("./routes/education"));

// Start listening only after MongoDB is connected so early requests don't hit a dead DB.
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    // One-time content sync without a shell (Render free plan has none).
    // Set SEED_ON_START=true (and SEED_PROFILE=true to also overwrite hero/about), deploy once, then REMOVE the variables,
    // otherwise every deploy would overwrite content edited in the admin panel.
    if (process.env.SEED_ON_START === "true") {
      console.warn("⚠️ SEED_ON_START is set: syncing portfolio content from data/portfolioContent.js. Remove this variable after the first run.");
      return require("./seedDynamic").syncContent({ overwriteProfile: process.env.SEED_PROFILE === "true" })
        .then(() => app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`)));
    }
    app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
  })
  .catch(err => {
    console.error("❌ MongoDB error:", err);
    process.exit(1);
  });
