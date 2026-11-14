const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const analyticsRoutes = require("./routes/analytics");
const chatbot = require("./routes/chat");
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
const chatLimiter = mk(60 * 1000, 10, "Too many chat requests, please try again later.");
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
app.use("/api/chat", chatLimiter, chatbot);

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
    app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
  })
  .catch(err => {
    console.error("❌ MongoDB error:", err);
    process.exit(1);
  });
