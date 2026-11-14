// Syncs resume-aligned content into MongoDB. Safe to re-run.
//   node seedDynamic.js            -> replaces skills, experience, education, projects (admin edits to those are overwritten)
//   node seedDynamic.js --profile  -> also overwrites the Profile document (hero/about)
require("dotenv").config();
const mongoose = require("mongoose");
const SkillGroup = require("./models/SkillGroup");
const Experience = require("./models/Experience");
const Education = require("./models/Education");
const Project = require("./models/Project");
const Profile = require("./models/Profile");
const content = require("./data/portfolioContent");

async function replaceAll(Model, docs, label) {
  await Model.deleteMany({});
  await Model.insertMany(docs);
  console.log(`✅ ${label} synced (${docs.length})`);
}

async function syncContent({ overwriteProfile = false } = {}) {
  await replaceAll(SkillGroup, content.skillGroups, "Skills");
  await replaceAll(Experience, content.experiences, "Experience");
  await replaceAll(Education, content.education, "Education");
  await replaceAll(Project, content.projects, "Projects");

  const existing = await Profile.findOne();
  if (!existing) {
    await Profile.create(content.profile);
    console.log("✅ Profile created");
  } else if (overwriteProfile) {
    await Profile.findByIdAndUpdate(existing._id, content.profile);
    console.log("✅ Profile overwritten");
  } else {
    console.log("ℹ️  Profile left untouched (use --profile to overwrite)");
  }
  console.log("✅ Content sync done.");
}

module.exports = { syncContent };

// CLI: node seedDynamic.js [--profile]
if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => syncContent({ overwriteProfile: process.argv.includes("--profile") }))
    .then(() => mongoose.disconnect())
    .catch(err => { console.error(err); process.exit(1); });
}
