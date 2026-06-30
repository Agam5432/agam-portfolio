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

        const visitors = await Visitor.find({
        lastVisit: { $gte: start }
        });

        res.json({
        todayVisitors: visitors.length
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getTotalSessions = async (req, res) => {
try {
    const data = await Visitor.aggregate([
      {
        $group: {
          _id: null,
          totalSessions: { $sum: "$sessionCount" }
        }
      }
    ]);

    res.json({
      totalSessions: data[0]?.totalSessions || 0
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPageViews = async (req, res) => {
    try {
        const data = await Visitor.aggregate([
        {
            $group: {
            _id: null,
            totalViews: { $sum: "$visitCount" }
            }
        }
        ]);

        res.json({
        totalPageViews: data[0]?.totalViews || 0
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getResumeDownloads = async (req, res) => {
    try {
        const count = await Visitor.countDocuments({
        resumeDownloaded: true
        });

        res.json({
        resumeDownloads: count
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getAllVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find()
      .sort({ lastVisit: -1 })   // most recent first
      .limit(200);               // adjust/remove limit as needed
 
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
 
    await Visitor.findOneAndUpdate(
      { visitorId },
      { resumeDownloaded: true }
    );
 
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const trackVisitorpage = async (req, res) => {
  try {
    const { page } = req.body;
    const visitorId = req.cookies.visitorId;
 
    // If there's no visitorId cookie yet, the trackVisitor middleware hasn't
    // run/assigned one for some reason — bail out instead of creating a
    // phantom "visitorId: undefined" document.
    if (!visitorId) {
      return res.status(200).json({ success: false, reason: "no visitorId cookie" });
    }
 
    await Visitor.findOneAndUpdate(
      { visitorId },
      {
        $set: {
          currentPage: page,
          lastVisit: new Date(),
          browser: req.headers["user-agent"] || "",
          referrer: req.headers["referer"] || "",
        },
        $addToSet: {
          pages: page
        }
      },
      { upsert: false, new: true }
      // upsert is now FALSE — the visitor document should already exist,
      // created by trackVisitor middleware on this same request cycle.
    );
 
    res.status(200).json({
      success: true
    });
 
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
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
  markResumeDownload
};