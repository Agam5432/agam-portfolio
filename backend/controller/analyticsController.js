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

    if (!visitorId) {
      return res.status(200).json({
        success: false,
        reason: "no visitorId cookie"
      });
    }

    // 🔥 PAGE VIEW TRACKING (ONE PAGE = ONE COUNT)
    await Visitor.findOneAndUpdate(
      { visitorId },
      {
        $set: {
          currentPage: page,
          lastVisit: new Date(),
          browser: req.headers["user-agent"] || "",
          referrer: req.headers["referer"] || ""
        },

        // 👇 page history (Contact, Skills, etc. all included)
        $addToSet: {
          pages: page
        },

        // 👇 TOTAL PAGE VIEWS (IMPORTANT)
        $inc: {
          visitCount: 1
        }
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false
    });
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