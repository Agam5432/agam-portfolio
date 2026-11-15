const express = require("express");
const router = express.Router();
const Resume = require("../models/Resume");
const auth = require("../middleware/auth");

const MAX_BYTES = 5 * 1024 * 1024;

// GET /api/resume/info (public) – lets the site know whether an uploaded resume exists
router.get("/info", async (req, res) => {
  try {
    const r = await Resume.findOne({}, "filename size updatedAt").lean();
    res.json(r ? { exists: true, filename: r.filename, size: r.size, updatedAt: r.updatedAt } : { exists: false });
  } catch {
    res.json({ exists: false });
  }
});

// GET /api/resume (public) – the PDF itself
router.get("/", async (req, res) => {
  try {
    // not .lean(): lean returns a BSON Binary, a hydrated doc gives a real Buffer
    const r = await Resume.findOne();
    if (!r) return res.status(404).json({ error: "Resume not uploaded yet" });
    const buf = Buffer.from(r.data);
    res.set({
      "Content-Type": r.contentType || "application/pdf",
      "Content-Length": buf.length,
      "Content-Disposition": `${req.query.view ? "inline" : "attachment"}; filename="${r.filename}"`,
      "Cache-Control": "public, max-age=300",
      // The frontend lives on another origin; allow it to fetch/embed the file.
      "Cross-Origin-Resource-Policy": "cross-origin",
    });
    res.send(buf);
  } catch {
    res.status(500).json({ error: "Failed to fetch resume" });
  }
});

// POST /api/resume (admin) – raw PDF bytes in the body, Content-Type: application/pdf
router.post(
  "/",
  auth,
  express.raw({ type: ["application/pdf", "application/octet-stream"], limit: MAX_BYTES }),
  async (req, res) => {
    try {
      const body = req.body;
      if (!Buffer.isBuffer(body) || body.length === 0) {
        return res.status(400).json({ error: "Send the PDF file as the request body" });
      }
      if (body.slice(0, 5).toString("latin1") !== "%PDF-") {
        return res.status(400).json({ error: "Only PDF files are allowed" });
      }
      const safeName = String(req.query.filename || "Agam_Tyagi_Resume.pdf")
        .replace(/[^\w.\- ]/g, "_").slice(0, 80);
      const filename = /\.pdf$/i.test(safeName) ? safeName : `${safeName}.pdf`;
      await Resume.deleteMany({});
      const r = await Resume.create({ filename, size: body.length, data: body });
      res.json({ exists: true, filename: r.filename, size: r.size, updatedAt: r.updatedAt });
    } catch (err) {
      console.error("Resume upload failed:", err.message);
      res.status(500).json({ error: "Failed to save resume" });
    }
  }
);

// DELETE /api/resume (admin) – falls back to the bundled static resume
router.delete("/", auth, async (req, res) => {
  try {
    await Resume.deleteMany({});
    res.json({ exists: false });
  } catch {
    res.status(500).json({ error: "Failed to delete resume" });
  }
});

// Body-too-large from express.raw
router.use((err, req, res, next) => {
  if (err && err.type === "entity.too.large") return res.status(413).json({ error: "File too large (max 5 MB)" });
  next(err);
});

module.exports = router;
