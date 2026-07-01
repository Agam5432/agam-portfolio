const express = require("express");
const router = express.Router();

const {
  getUniqueVisitors,
  getTodayVisitors,
  getTotalSessions,
  getPageViews,
  getResumeDownloads,
  getAllVisitors,
  markResumeDownload,
  trackVisitorpage,
  getVisitorDetail,
} = require("../controller/analyticsController");
const trackVisitor = require("../middleware/trackVisitor");

router.get("/unique-visitors", getUniqueVisitors); // total users
router.get("/today-visitors", getTodayVisitors); // today active users
router.get("/total-sessions", getTotalSessions); // total sessions
router.get("/page-views", getPageViews); // total activity
router.get("/resume-downloads", getResumeDownloads); // resume clicks
router.get("/all", getAllVisitors); // all visitors
router.get("/visitor/:visitorId", getVisitorDetail); 
// BAAD MEIN:

router.post("/track-visit", trackVisitor, trackVisitorpage);
router.post("/resume-download", trackVisitor, markResumeDownload); // marks current visitor as having downloaded resume


module.exports = router;