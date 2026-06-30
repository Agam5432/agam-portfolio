const { v4: uuidv4 } = require("uuid");
const Visitor = require("../models/Visitors");

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Routes that should NEVER count as a "visit" — these are admin/dashboard
// calls, not real portfolio visitors hitting the site.
const SKIP_PREFIXES = ["/api/analytics", "/api/admin", "/api/nexora"];

const trackVisitor = async (req, res, next) => {
  try {
    // 🚫 Skip tracking for admin/analytics API calls
    if (SKIP_PREFIXES.some(prefix => req.originalUrl.startsWith(prefix))) {
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
        visitCount: 1,
        sessionCount: 1,
      });

      isNewSession = true;
    } else {
      // ⏱ SESSION CHECK
      const timeDiff = now - new Date(visitor.lastVisit);

      if (!sessionId || timeDiff > SESSION_TIMEOUT) {
        sessionId = uuidv4();
        isNewSession = true;

        visitor.sessionCount += 1;
      }
      visitor.visitCount += 1;
  }
      // 🍪 update session cookie
      res.cookie("sessionId", sessionId, {
        maxAge: SESSION_TIMEOUT,
        httpOnly: true,
      });
    

    // 📊 UPDATE COMMON DATA
    visitor.sessionId = sessionId;
    visitor.lastVisit = now;

    // 🌐 optional tracking (if you pass from frontend)
    visitor.browser = req.headers["user-agent"] || "";
    visitor.referrer = req.headers["referer"] || "";
    visitor.currentPage = req.originalUrl;

    await visitor.save();

    // (optional debug)
    req.analytics = {
      isNewVisitor,
      isNewSession,
      visitorId,
      sessionId,
    };

    next();
  } catch (err) {
    console.log("Visitor Tracking Error:", err);
    next();
  }
};

module.exports = trackVisitor;