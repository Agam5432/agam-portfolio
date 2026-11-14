// Builds the chatbot's knowledge text from the database, so anything edited in the admin panel
// (profile, skills, experience, projects, education) is what Nexora knows. If the database is
// empty or unreachable it falls back to the static resume text in data/resume.js.
const Profile = require("../models/Profile");
const SkillGroup = require("../models/SkillGroup");
const Experience = require("../models/Experience");
const Project = require("../models/Project");
const Education = require("../models/Education");
const FALLBACK = require("../data/resume");

const TTL_MS = 60 * 1000;
let cache = { text: null, at: 0 };

function build({ profile, skills, experience, projects, education }) {
  const L = [];
  const p = profile || {};
  L.push(`${(p.name || "AGAM TYAGI").toUpperCase()} — ${p.title || "AI Engineer"}`);
  if (p.subtitle) L.push(p.subtitle);
  if (p.email) L.push(`Email: ${p.email}`);
  if (p.phone) L.push(`Phone: ${p.phone}`);
  if (p.linkedinUrl) L.push(`LinkedIn: ${p.linkedinUrl}`);
  if (p.githubUrl) L.push(`GitHub: ${p.githubUrl}`);
  if (p.location) L.push(`Location: ${p.location}`);
  if (p.badge) L.push(`Status: ${p.badge} (open to onsite, office-based and remote roles).`);
  const about = [p.tagline, p.aboutPara1, p.aboutPara2, p.aboutPara3].filter(Boolean);
  if (about.length) L.push("", "ABOUT / SUMMARY", ...about);
  if (p.stats?.length) L.push("", "KEY NUMBERS", ...p.stats.map(s => `- ${s.label}: ${s.num}`));
  if (skills.length) L.push("", "TECHNICAL SKILLS", ...skills.map(g => `- ${g.label}: ${(g.chips || []).join(", ")}`));
  if (experience.length) {
    L.push("", "WORK EXPERIENCE");
    experience.forEach(e => {
      L.push(`${e.role} | ${e.company} | ${e.period}${e.location ? " | " + e.location : ""}`);
      (e.points || []).forEach(pt => L.push(`- ${pt}`));
    });
  }
  if (projects.length) {
    L.push("", "PROJECTS (newest first)");
    projects.forEach((pr, i) => {
      L.push(`${i + 1}. ${pr.title}${pr.period ? " | " + pr.period : ""}`);
      if (pr.stack?.length) L.push(`   Tech: ${pr.stack.join(", ")}`);
      if (pr.description) L.push(`   ${pr.description}`);
      if (pr.liveUrl) L.push(`   Live: ${pr.liveUrl}`);
      if (pr.githubUrl) L.push(`   GitHub: ${pr.githubUrl}`);
    });
  }
  if (education.length) {
    L.push("", "EDUCATION", ...education.map(e => `- ${e.degree}, ${e.uni}, ${e.year}${e.note ? " — " + e.note : ""}`));
  }
  return L.join("\n");
}

async function getPortfolioContext() {
  if (cache.text && Date.now() - cache.at < TTL_MS) return cache.text;
  try {
    const [profile, skills, experience, projects, education] = await Promise.all([
      Profile.findOne().lean(),
      SkillGroup.find().sort({ order: 1 }).lean(),
      Experience.find().sort({ order: 1 }).lean(),
      Project.find({ visible: { $ne: false } }).sort({ order: 1 }).lean(),
      Education.find().sort({ order: 1 }).lean(),
    ]);
    if (!profile && !skills.length && !experience.length && !projects.length) throw new Error("empty DB");
    cache = { text: build({ profile, skills, experience, projects, education }), at: Date.now() };
    return cache.text;
  } catch (err) {
    console.warn("Portfolio context from DB unavailable, using resume fallback:", err.message);
    return FALLBACK;
  }
}

module.exports = { getPortfolioContext };
