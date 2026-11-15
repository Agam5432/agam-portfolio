const Visitor = require("../models/Visitors");
const Event = require("../models/AnalyticsEvent");

const TZ = "Asia/Kolkata";
const BOT_RE = /bot|crawl|spider|slurp|headless|lighthouse|pingdom|uptime|monitor|facebookexternalhit|preview|curl|wget|python-requests|axios|node-fetch|go-http/i;
const ID_RE = /^[A-Za-z0-9_-]{8,64}$/;

// ── helpers ────────────────────────────────────────────────────────────
function parseUA(ua = "") {
  let browser = "Other";
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/OPR\/|Opera/.test(ua)) browser = "Opera";
  else if (/SamsungBrowser/.test(ua)) browser = "Samsung Internet";
  else if (/Firefox\/|FxiOS/.test(ua)) browser = "Firefox";
  else if (/Chrome\/|CriOS/.test(ua)) browser = "Chrome";
  else if (/Safari\//.test(ua)) browser = "Safari";

  let os = "Other";
  if (/Windows/.test(ua)) os = "Windows";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
  else if (/Mac OS X|Macintosh/.test(ua)) os = "macOS";
  else if (/CrOS/.test(ua)) os = "ChromeOS";
  else if (/Linux/.test(ua)) os = "Linux";

  let device = "desktop";
  if (/iPad|Tablet/.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua))) device = "tablet";
  else if (/Mobi|iPhone|Android/.test(ua)) device = "mobile";
  return { browser, os, device };
}

// Only keep the hostname of the referrer; own-site referrers count as direct.
function cleanReferrer(ref, selfHosts) {
  if (!ref || typeof ref !== "string") return "";
  try {
    const host = new URL(ref).hostname.replace(/^www\./, "");
    return selfHosts.some(h => host === h || host.endsWith(`.${h}`)) ? "" : host.slice(0, 80);
  } catch {
    return "";
  }
}

function cleanPage(p) {
  if (typeof p !== "string" || !p.startsWith("/")) return null;
  return p.split(/[?#]/)[0].slice(0, 100) || "/";
}

const SELF_HOSTS = () => [
  "agam-portfolio-vert.vercel.app",
  "agam-portfolio-admin.vercel.app",
  "localhost",
  ...(process.env.ANALYTICS_SELF_HOSTS ? process.env.ANALYTICS_SELF_HOSTS.split(",").map(s => s.trim()) : []),
];

// ── public write endpoints ─────────────────────────────────────────────
exports.trackVisit = async (req, res) => {
  // Always answer 204: tracking must never surface errors to visitors.
  try {
    const ua = req.get("user-agent") || "";
    const { visitorId, sessionId } = req.body || {};
    const page = cleanPage(req.body?.page);
    if (!ID_RE.test(visitorId || "") || !ID_RE.test(sessionId || "") || !page) return res.sendStatus(204);
    if (ua.length < 20 || BOT_RE.test(ua)) return res.sendStatus(204);

    const now = new Date();
    const referrer = cleanReferrer(req.body.referrer, SELF_HOSTS());
    const { browser, os, device } = parseUA(ua);

    const before = await Visitor.findOneAndUpdate(
      { visitorId },
      {
        $set: { lastVisit: now, currentPage: page, browser, os, device },
        $inc: { visitCount: 1 },
        $setOnInsert: { firstVisit: now, referrer },
      },
      { upsert: true, new: false }
    ).lean();

    const bump = await Visitor.updateOne(
      { visitorId, "pages.page": page },
      { $inc: { "pages.$.count": 1 }, $set: { "pages.$.lastVisit": now } }
    );
    if (bump.matchedCount === 0) {
      await Visitor.updateOne(
        { visitorId, "pages.page": { $ne: page } },
        { $push: { pages: { page, count: 1, firstVisit: now, lastVisit: now } } }
      );
    }

    if (!before || before.lastSessionId !== sessionId) {
      await Visitor.updateOne({ visitorId }, { $inc: { sessionCount: 1 }, $set: { lastSessionId: sessionId } });
    }

    await Event.create({
      type: "view", visitorId, sessionId, page,
      referrer: before ? "" : referrer, // referrer only matters for the first touch
      device, browser, os, at: now,
    });
    res.sendStatus(204);
  } catch (err) {
    console.error("trackVisit error:", err.message);
    res.sendStatus(204);
  }
};

exports.trackResumeDownload = async (req, res) => {
  try {
    const ua = req.get("user-agent") || "";
    const { visitorId } = req.body || {};
    if (!ID_RE.test(visitorId || "") || BOT_RE.test(ua)) return res.sendStatus(204);
    await Visitor.updateOne({ visitorId }, { $inc: { resumeDownloads: 1 } });
    await Event.create({ type: "resume", visitorId, sessionId: String(req.body.sessionId || "").slice(0, 64) });
    res.sendStatus(204);
  } catch (err) {
    console.error("trackResumeDownload error:", err.message);
    res.sendStatus(204);
  }
};

// ── admin read endpoints ───────────────────────────────────────────────
const istDayStart = (d = new Date()) => {
  const OFFSET = 5.5 * 60 * 60 * 1000;
  return new Date(Math.floor((d.getTime() + OFFSET) / 86400000) * 86400000 - OFFSET);
};

exports.getSummary = async (req, res) => {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 30, 1), 365);
    const todayStart = istDayStart();
    const since = new Date(todayStart.getTime() - (days - 1) * 86400000);

    const inRange = { at: { $gte: since } };
    const views = { type: "view", ...inRange };

    const [
      totalsAgg, uniqueRange, todayUniq, sessionsRange, resumeRange, daily, topPages, topRefs, devices, browsers, osList, allTime,
    ] = await Promise.all([
      Event.countDocuments(views),
      Event.distinct("visitorId", views).then(a => a.length),
      Event.distinct("visitorId", { type: "view", at: { $gte: todayStart } }).then(a => a.length),
      Event.distinct("sessionId", views).then(a => a.length),
      Event.countDocuments({ type: "resume", ...inRange }),
      Event.aggregate([
        { $match: { ...inRange } },
        { $group: {
            _id: { d: { $dateToString: { format: "%Y-%m-%d", date: "$at", timezone: TZ } }, t: "$type" },
            n: { $sum: 1 }, v: { $addToSet: "$visitorId" } } },
      ]),
      Event.aggregate([{ $match: views }, { $group: { _id: "$page", n: { $sum: 1 } } }, { $sort: { n: -1 } }, { $limit: 8 }]),
      Event.aggregate([
        { $match: { ...views, referrer: { $nin: ["", null] } } },
        { $group: { _id: "$referrer", n: { $sum: 1 } } }, { $sort: { n: -1 } }, { $limit: 8 }]),
      Visitor.aggregate([{ $match: { lastVisit: { $gte: since } } }, { $group: { _id: "$device", n: { $sum: 1 } } }, { $sort: { n: -1 } }]),
      Visitor.aggregate([{ $match: { lastVisit: { $gte: since } } }, { $group: { _id: "$browser", n: { $sum: 1 } } }, { $sort: { n: -1 } }, { $limit: 6 }]),
      Visitor.aggregate([{ $match: { lastVisit: { $gte: since } } }, { $group: { _id: "$os", n: { $sum: 1 } } }, { $sort: { n: -1 } }, { $limit: 6 }]),
      Promise.all([
        Visitor.countDocuments(),
        Event.countDocuments({ type: "resume" }),
        Visitor.countDocuments({ firstVisit: { $gte: since } }),
        Visitor.countDocuments({ sessionCount: { $gt: 1 } }),
      ]),
    ]);

    // zero-filled daily series in IST
    const byDay = {};
    for (const row of daily) {
      const day = (byDay[row._id.d] ||= { views: 0, visitors: 0, resume: 0 });
      if (row._id.t === "view") { day.views = row.n; day.visitors = row.v.length; }
      else day.resume = row.n;
    }
    const series = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(since.getTime() + i * 86400000 + 12 * 3600000); // noon-safe
      const key = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);
      series.push({ date: key, ...(byDay[key] || { views: 0, visitors: 0, resume: 0 }) });
    }

    const [allVisitors, allResume, newVisitors, returning] = allTime;
    res.json({
      days,
      range: { views: totalsAgg, visitors: uniqueRange, sessions: sessionsRange, resumeDownloads: resumeRange, newVisitors },
      today: { visitors: todayUniq },
      allTime: { visitors: allVisitors, resumeDownloads: allResume, returning },
      daily: series,
      topPages: topPages.map(x => ({ page: x._id, views: x.n })),
      topReferrers: topRefs.map(x => ({ source: x._id, views: x.n })),
      devices: devices.map(x => ({ name: x._id || "unknown", count: x.n })),
      browsers: browsers.map(x => ({ name: x._id || "unknown", count: x.n })),
      os: osList.map(x => ({ name: x._id || "unknown", count: x.n })),
    });
  } catch (err) {
    console.error("getSummary error:", err.message);
    res.status(500).json({ error: "Failed to load analytics" });
  }
};

exports.listVisitors = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);
    const filter = {};
    let sort = { lastVisit: -1 };
    switch (req.query.filter) {
      case "today": filter.lastVisit = { $gte: istDayStart() }; break;
      case "resume": filter.resumeDownloads = { $gt: 0 }; break;
      case "sessions": sort = { sessionCount: -1, lastVisit: -1 }; break;
      case "pageviews": sort = { visitCount: -1, lastVisit: -1 }; break;
      case "returning": filter.sessionCount = { $gt: 1 }; break;
      default: break;
    }
    const [items, total] = await Promise.all([
      Visitor.find(filter, "-pages -lastSessionId -__v").sort(sort).skip((page - 1) * limit).limit(limit).lean(),
      Visitor.countDocuments(filter),
    ]);
    res.json({ items, total, page, pages: Math.max(Math.ceil(total / limit), 1) });
  } catch (err) {
    console.error("listVisitors error:", err.message);
    res.status(500).json({ error: "Failed to load visitors" });
  }
};

exports.getVisitor = async (req, res) => {
  try {
    if (!ID_RE.test(req.params.visitorId)) return res.status(404).json({ error: "Visitor not found" });
    const v = await Visitor.findOne({ visitorId: req.params.visitorId }, "-lastSessionId -__v").lean();
    if (!v) return res.status(404).json({ error: "Visitor not found" });
    res.json(v);
  } catch (err) {
    console.error("getVisitor error:", err.message);
    res.status(500).json({ error: "Failed to load visitor" });
  }
};

// Per-metric detail lists, so every dashboard card opens a genuinely different view.
//  type=pageviews → every page view event
//  type=sessions  → one row per session (entry page, pages viewed, duration)
//  type=resume    → every resume download event
exports.getDetails = async (req, res) => {
  try {
    const type = req.query.type;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 30, 1), 365);
    const since = new Date(istDayStart().getTime() - (days - 1) * 86400000);
    const coll = Visitor.collection.collectionName;
    const join = [
      { $lookup: { from: coll, localField: "visitorId", foreignField: "visitorId", as: "v" } },
      { $addFields: { v: { $arrayElemAt: ["$v", 0] } } },
    ];
    const skipLimit = [{ $skip: (page - 1) * limit }, { $limit: limit }];
    let items, total;

    if (type === "pageviews" || type === "resume") {
      const match = { type: type === "resume" ? "resume" : "view", at: { $gte: since } };
      [items, total] = await Promise.all([
        Event.aggregate([{ $match: match }, { $sort: { at: -1 } }, ...skipLimit, ...join, {
          $project: { _id: 0, at: 1, page: 1, visitorId: 1, device: { $ifNull: ["$device", "$v.device"] },
            browser: { $ifNull: ["$browser", "$v.browser"] }, os: { $ifNull: ["$os", "$v.os"] }, referrer: "$v.referrer" } }]),
        Event.countDocuments(match),
      ]);
    } else if (type === "sessions") {
      const base = [{ $match: { type: "view", at: { $gte: since }, sessionId: { $ne: null } } },
        { $sort: { at: 1 } },
        { $group: { _id: "$sessionId", visitorId: { $first: "$visitorId" }, start: { $first: "$at" }, end: { $last: "$at" },
            entry: { $first: "$page" }, exit: { $last: "$page" }, views: { $sum: 1 },
            device: { $first: "$device" }, browser: { $first: "$browser" }, os: { $first: "$os" } } }];
      const [rows, cnt] = await Promise.all([
        Event.aggregate([...base, { $sort: { start: -1 } }, ...skipLimit]),
        Event.aggregate([...base, { $count: "n" }]),
      ]);
      items = rows.map(r => ({ sessionId: r._id, visitorId: r.visitorId, start: r.start, durationSec: Math.round((r.end - r.start) / 1000),
        entry: r.entry, exit: r.exit, views: r.views, device: r.device, browser: r.browser, os: r.os }));
      total = cnt[0]?.n || 0;
    } else {
      return res.status(400).json({ error: "Unknown type" });
    }
    res.json({ items, total, page, pages: Math.max(Math.ceil(total / limit), 1) });
  } catch (err) {
    console.error("getDetails error:", err.message);
    res.status(500).json({ error: "Failed to load details" });
  }
};

exports._internals = { parseUA, cleanReferrer, cleanPage, istDayStart };
