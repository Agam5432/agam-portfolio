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

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  await replaceAll(SkillGroup, content.skillGroups, "Skills");
  await replaceAll(Experience, content.experiences, "Experience");
  await replaceAll(Education, content.education, "Education");
  await replaceAll(Project, content.projects, "Projects");

  const existing = await Profile.findOne();
  if (!existing) {
    await Profile.create(content.profile);
    console.log("✅ Profile created");
  } else if (process.argv.includes("--profile")) {
    await Profile.findByIdAndUpdate(existing._id, content.profile);
    console.log("✅ Profile overwritten");
  } else {
    console.log("ℹ️  Profile left untouched (use --profile to overwrite)");
  }
  await mongoose.disconnect();
  console.log("✅ Done.");
}

seed().catch(err => { console.error(err); process.exit(1); });
