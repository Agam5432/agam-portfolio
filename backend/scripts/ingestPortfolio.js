require("dotenv").config();

const mongoose = require("mongoose");

const Profile = require("../models/Profile");
const Experience = require("../models/Experience");
const Project = require("../models/Project");
const SkillGroup = require("../models/SkillGroup");
const Education = require("../models/Education");

const {
  getEmbedding,
} = require("../services/embeddings");

const {
  createCollection,
  insertChunks,
} = require("../services/vectorStore");

async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ MongoDB connected");
}

(async () => {
  try {
    await connectDB();

    console.log("Fetching portfolio data...");

    const profile = await Profile.findOne();
    const experiences = await Experience.find().sort({ order: 1 });
    const projects = await Project.find({ visible: true }).sort({ order: 1 });
    const skills = await SkillGroup.find().sort({ order: 1 });
    const education = await Education.find().sort({ order: 1 });

    const structuredChunks = [];

    // ===================
    // PROFILE
    // ===================
    if (profile) {
      const text = `
Profile Information

Name: ${profile.name}
Title: ${profile.title}
Subtitle: ${profile.subtitle}
Tagline: ${profile.tagline}

About:
${profile.aboutPara1}

${profile.aboutPara2}

${profile.aboutPara3}

Location: ${profile.location}
${profile.aboutTags?.length ? `\nAbout Tags: ${profile.aboutTags.join(", ")}` : ""}
Contact Information:
Email: ${profile.email || "Not provided"}
Phone: ${profile.phone || "Not provided"}
GitHub: ${profile.githubUrl || "Not provided"}
LinkedIn: ${profile.linkedinUrl || "Not provided"}
`.trim();

      structuredChunks.push({
        type: "profile",
        title: profile.name,
        text,
        order: 0,
        isCurrent: false,
      });
    }

    // ===================
    // EXPERIENCE
    // ===================
    experiences.forEach((exp) => {
      const text = `
Experience

Role: ${exp.role}
Company: ${exp.company}
Period: ${exp.period}
Location: ${exp.location}

Responsibilities:
${exp.points.join("\n")}

Technologies: ${exp.tags.join(", ")}
`.trim();

      // "Present" ya "Current" hone par isCurrent flag lagao — period string se derive
      const isCurrent = /present|current/i.test(exp.period || "");

      structuredChunks.push({
        type: "experience",
        title: `${exp.role} at ${exp.company}`,
        text,
        order: exp.order,
        period: exp.period,
        isCurrent,
      });
    });

    // ===================
    // PROJECTS
    // ===================
    projects.forEach((project) => {
      const text = `
Project

Title: ${project.title}
Description: ${project.description}
Tech Stack: ${project.stack.join(", ")}
Tags: ${project.tags.join(", ")}
`.trim();

      structuredChunks.push({
        type: "project",
        title: project.title,
        text,
        order: project.order,
        featured: project.featured,
        isCurrent: false,
      });
    });

    // ===================
    // SKILLS
    // ===================
    skills.forEach((skill) => {
      const text = `
Skill Category: ${skill.label}
Skills: ${skill.chips.join(", ")}
`.trim();

      structuredChunks.push({
        type: "skills",
        title: skill.label,
        text,
        order: skill.order,
        isCurrent: false,
      });
    });

    // ===================
    // EDUCATION
    // ===================
    education.forEach((edu) => {
      const text = `
Education

Degree: ${edu.degree}
University: ${edu.uni}
Year: ${edu.year}
Note: ${edu.note}
`.trim();

      structuredChunks.push({
        type: "education",
        title: edu.degree,
        text,
        order: edu.order,
        period: edu.year,
        isCurrent: false,
      });
    });

    // ===================
    // META — about Nexora (this chatbot) itself
    // ===================
    structuredChunks.push({
      type: "meta",
      title: "About Nexora (this chatbot)",
      text: `
About Nexora

Nexora is this AI portfolio assistant, built by Agam Tyagi himself as one of his personal/professional projects.

Architecture: Retrieval-Augmented Generation (RAG) pipeline.

Pipeline: MongoDB (stores portfolio data) → structured chunking → Gemini Embeddings (3072 dimensions) → Qdrant Cloud (vector database for similarity search) → Groq Llama 3.3 70B (generates the final response).

This project demonstrates Agam's hands-on experience with embeddings, vector search, RAG architecture, and LLM integration in a production setting.
`.trim(),
      order: 0,
      isCurrent: true,
    });

    console.log("Total structured chunks:", structuredChunks.length);

    await createCollection();

    const docs = [];

    for (let i = 0; i < structuredChunks.length; i++) {   
      const chunk = structuredChunks[i];

      console.log(`Embedding chunk ${i + 1}/${structuredChunks.length} [${chunk.type}] ${chunk.title}`);

      const embedding = await getEmbedding(chunk.text);

      docs.push({
        id: i + 1,
        vector: embedding,
        payload: {
          text: chunk.text,
          type: chunk.type,
          title: chunk.title,
          order: chunk.order ?? 0,
          period: chunk.period || null,
          featured: chunk.featured || false,
          isCurrent: chunk.isCurrent || false,
          source: "portfolio-db",
          chunkIndex: i,
        },
      });
    }

    await insertChunks(docs);

    console.log("\n✅ Portfolio indexed successfully with structured metadata!");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  }
})();