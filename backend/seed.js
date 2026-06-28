require("dotenv").config();
const mongoose = require("mongoose");
const Project = require("./models/Project");

const projects = [
  {
    title: "AI Face Authentication & Liveness Detection",
    description: "Biometric authentication with real-time liveness detection — blink & head-movement verification to prevent spoofing and replay attacks.",
    icon: "🤖",
    tags: ["AI", "Security"],
    stack: ["Node.js", "FastAPI", "DeepFace", "MediaPipe", "PostgreSQL", "Prisma"],
    liveUrl: "",
    githubUrl: "",
    featured: true,
    order: 1
  },
  {
    title: "Nexora AI Assistant",
    description: "AI conversational assistant with multi-model LLM support (Groq + Ollama), real-time web search & multilingual responses.",
    icon: "🧠",
    tags: ["AI", "LLM"],
    stack: ["Python", "Groq API", "Ollama", "Gradio", "Tavily"],
    liveUrl: "",
    githubUrl: "",
    featured: true,
    order: 2
  },
  {
    title: "Aashi Rainwear — E-Commerce",
    description: "Cross-platform Flutter e-commerce app with product catalogue, cart, order tracking & Razorpay payment processing.",
    icon: "🛒",
    tags: ["E-Commerce", "Flutter"],
    stack: ["Flutter", "Node.js", "PHP", "MySQL", "Bootstrap"],
    liveUrl: "",
    githubUrl: "",
    featured: true,
    order: 3
  },
  {
    title: "AI Resume Parser",
    description: "Automated resume parsing for PDF & DOCX — extracts skills, experience, education into structured JSON for ATS ingestion.",
    icon: "📄",
    tags: ["AI", "Parser"],
    stack: ["Node.js", "FastAPI", "Python"],
    liveUrl: "",
    githubUrl: "",
    featured: true,
    order: 4
  },
  {
    title: "Google Photos-Style Face Grouping",
    description: "Auto face detection & clustering using DeepFace similarity matching to group individuals across photo collections.",
    icon: "📷",
    tags: ["AI", "Vision"],
    stack: ["Express.js", "DeepFace", "PostgreSQL", "Prisma"],
    liveUrl: "",
    githubUrl: "",
    featured: false,
    order: 5
  },
  {
    title: "OCR Document Extraction",
    description: "High-accuracy OCR pipeline for scanned docs, ID cards & invoices using dual OCR engines with OpenCV preprocessing.",
    icon: "🔍",
    tags: ["AI", "OCR"],
    stack: ["FastAPI", "OpenCV", "EasyOCR", "PaddleOCR"],
    liveUrl: "",
    githubUrl: "",
    featured: false,
    order: 6
  },
  {
    title: "Radigone Web App",
    description: "Multi-role platform with fine-grained RBAC, permission management, transaction handling & automated commission calculation.",
    icon: "⚙️",
    tags: ["Web", "RBAC"],
    stack: ["PHP", "Laravel", "MySQL", "JavaScript"],
    liveUrl: "",
    githubUrl: "",
    featured: false,
    order: 7
  },
  {
    title: "Online Examination System",
    description: "Secure full-featured exam platform with timed tests, auto grading, result analytics & admin panel for question bank management.",
    icon: "📝",
    tags: ["Web", "EdTech"],
    stack: ["Laravel", "PHP", "MySQL", "jQuery", "AJAX"],
    liveUrl: "",
    githubUrl: "",
    featured: false,
    order: 8
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  await Project.deleteMany({});
  await Project.insertMany(projects);
  console.log("✅ Projects seeded successfully!");
  mongoose.disconnect();
}

seed().catch(console.error);
