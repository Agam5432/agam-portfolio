const express = require("express");
const router = express.Router();
const c = require("../controller/analyticsController");
const requireAuth = require("../middleware/auth");

// Public (called by the portfolio site). Always answer 204.
router.post("/track-visit", c.trackVisit);
router.post("/resume-download", c.trackResumeDownload);

// Admin only
router.get("/summary", requireAuth, c.getSummary);
router.get("/visitors", requireAuth, c.listVisitors);
router.get("/visitor/:visitorId", requireAuth, c.getVisitor);

module.exports = router;
