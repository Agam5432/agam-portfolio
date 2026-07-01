const { v4: uuidv4 } = require("uuid");
const Visitor = require("../models/Visitors");

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Admin dashboard calls and analytics READ endpoints must be skipped.
// BUT /api/analytics/track-visit and /api/analytics/resume-download are
// real frontend calls — they MUST get cookies, so don't skip them.
const SKIP_PREFIXES = ["/api/admin", "/api/nexora"];
const ANALYTICS_ALLOWED = ["/api/analytics/track-visit", "/api/analytics/resume-download"];

const trackVisitor = async (req, res, next) => {
  try {
    const url = req.originalUrl;

    // Skip admin/nexora routes entirely
    if (SKIP_PREFIXES.some(prefix => url.startsWith(prefix))) {
      return next();
    }

    // For /api/analytics/* — only allow track-visit and resume-download through.
    // All other analytics routes (stats, all, etc.) are skipped.
    if (url.startsWith("/api/analytics") && !ANALYTICS_ALLOWED.some(p => url.startsWith(p))) {
      return next();
    }

    const now = new Date();

    let visitorId = req.cookies.visitorId;
    let sessionId = req.cookies.sessionId;

    let isNewVisitor = false;
    let isNewSession = false;

    // 🆕 CASE 1: NEW VISITOR
    if (!visitorId) {
      visitorId = uuidv4();
      isNewVisitor = true;

      res.cookie("visitorId", visitorId, {
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        httpOnly: true,
        sameSite: "none",
        secure: true
      });
    }

    // 🔄 FIND VISITOR IN DB
    let visitor = await Visitor.findOne({ visitorId });

    if (!visitor) {
      sessionId = uuidv4();

      visitor = new Visitor({
        visitorId,
        sessionId,
        lastVisit: now,
        visitCount: 0,    // track-visit controller will increment this
        sessionCount: 1,
      });

      isNewSession = true;
    } else {
      // ⏱ SESSION CHECK
      const timeDiff = now - new Date(visitor.lastVisit);

      if (!visitor.sessionCount) visitor.sessionCount = 1;

      if (!sessionId || timeDiff > SESSION_TIMEOUT) {
        sessionId = uuidv4();
        isNewSession = true;
        visitor.sessionCount = (visitor.sessionCount || 0) + 1;
      }
    }

    // 🍪 update session cookie
    res.cookie("sessionId", sessionId, {
      maxAge: SESSION_TIMEOUT,
      httpOnly: true,
      sameSite: "none",
      secure: true
    });

    // 📊 Only update identity fields here.
    // browser / referrer / currentPage / visitCount are handled SOLELY
    // by the track-visit controller — NOT here — so that /api/education,
    // /api/profile etc. don't overwrite the real page URL.
    visitor.sessionId = sessionId;
    visitor.lastVisit = now;

    await visitor.save();

    req.analytics = { isNewVisitor, isNewSession, visitorId, sessionId };

    next();
  } catch (err) {
    console.log("Visitor Tracking Error:", err);
    next();
  }
};

module.exports = trackVisitor;