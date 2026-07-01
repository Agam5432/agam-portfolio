const Visitor = require("../models/Visitors");

const getUniqueVisitors = async (req, res) => {
  try {
    const count = await Visitor.countDocuments();
    res.json({ uniqueVisitors: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getTodayVisitors = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const visitors = await Visitor.find({ lastVisit: { $gte: start } });
    res.json({ todayVisitors: visitors.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getTotalSessions = async (req, res) => {
  try {
    const data = await Visitor.aggregate([
      { $group: { _id: null, totalSessions: { $sum: "$sessionCount" } } }
    ]);
    res.json({ totalSessions: data[0]?.totalSessions || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPageViews = async (req, res) => {
  try {
    const data = await Visitor.aggregate([
      { $group: { _id: null, totalViews: { $sum: "$visitCount" } } }
    ]);
    res.json({ totalPageViews: data[0]?.totalViews || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getResumeDownloads = async (req, res) => {
  try {
    const count = await Visitor.countDocuments({ resumeDownloaded: true });
    res.json({ resumeDownloads: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find()
      .sort({ lastVisit: -1 })
      .limit(200);
    res.json(visitors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const markResumeDownload = async (req, res) => {
  try {
    const visitorId = req.cookies.visitorId;
    if (!visitorId) {
      return res.status(200).json({ ok: false, reason: "no visitorId cookie" });
    }
    await Visitor.findOneAndUpdate({ visitorId }, { resumeDownloaded: true });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🆕 Get single visitor's full detail (for detail page)
const getVisitorDetail = async (req, res) => {
  try {
    const { visitorId } = req.params;
    const visitor = await Visitor.findOne({ visitorId });
    if (!visitor) return res.status(404).json({ error: "Visitor not found" });
    res.json(visitor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const trackVisitorpage = async (req, res) => {
  try {
    const { page } = req.body;
    const visitorId = req.analytics?.visitorId;

    if (!visitorId) {
      return res.status(200).json({ success: false, reason: "no visitorId" });
    }

    const now = new Date();

    // Check if this page already exists in history
    const visitor = await Visitor.findOne({ visitorId });

    if (!visitor) {
      return res.status(200).json({ success: false, reason: "visitor not found" });
    }

    const existingPage = visitor.pages?.find(p => p.page === page);

    if (existingPage) {
      // Page already visited before — increment count + update lastVisit
      await Visitor.findOneAndUpdate(
        { visitorId, "pages.page": page },
        {
          $set: {
            currentPage: page,
            lastVisit: now,
            browser: req.headers["user-agent"] || "",
            referrer: req.headers["referer"] || "",
            "pages.$.count": existingPage.count + 1,
            "pages.$.lastVisit": now,
          },
          $inc: { visitCount: 1 }
        },
        { new: true }
      );
    } else {
      // First time visiting this page — add new entry to pages array
      await Visitor.findOneAndUpdate(
        { visitorId },
        {
          $set: {
            currentPage: page,
            lastVisit: now,
            browser: req.headers["user-agent"] || "",
            referrer: req.headers["referer"] || "",
          },
          $inc: { visitCount: 1 },
          $push: {
            pages: {
              page,
              count: 1,
              firstVisit: now,
              lastVisit: now,
            }
          }
        },
        { new: true }
      );
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false });
  }
};

module.exports = {
  trackVisitorpage,
  getAllVisitors,
  getUniqueVisitors,
  getTodayVisitors,
  getTotalSessions,
  getPageViews,
  getResumeDownloads,
  markResumeDownload,
  getVisitorDetail,  // 🆕
};