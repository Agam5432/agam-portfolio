const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const analyticsRoutes = require("./routes/analytics");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174", 
    "https://agam-portfolio-vert.vercel.app",
    /\.vercel\.app$/  // sare vercel domains allow
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
// Rate limiter for Nexora
const nexoraLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: "Too many requests, please try again later." }
});

// Routes
app.use("/api/nexora", nexoraLimiter, require("./routes/nexora"));
app.use("/api/contact", require("./routes/contact"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/analytics", analyticsRoutes);

// ── NEW DYNAMIC ROUTES ──────────────────────────────────────
app.use("/api/profile", require("./routes/profile"));
app.use("/api/skills", require("./routes/skills"));
app.use("/api/experience", require("./routes/experience"));
app.use("/api/education", require("./routes/education"));
// Temporary seed route — delete after use
// app.get("/api/seed-all", async (req, res) => {
//   try {
//     const mongoose2 = require("mongoose");
//     const Project = require("./models/Project");
//     const SkillGroup = require("./models/SkillGroup");
//     const Experience = require("./models/Experience");
//     const Education = require("./models/Education");
//     const Profile = require("./models/Profile");

//     // Profile
//     await Profile.deleteMany({});
//     await Profile.create({
//       name: "Agam Tyagi",
//       tagline: "Full Stack Developer & AI Integration Engineer",
//       heroDesc: "Building production-grade web apps with real AI — computer vision, LLMs, and everything in between.",
//       badge: "Open to Opportunities",
//       aboutP1: "I'm a Full Stack Developer & AI Integration Engineer based in Chandigarh, currently building production apps at Backup Infotech.",
//       aboutP2: "I integrate real AI into products: face authentication systems, LLM-powered assistants, OCR pipelines, and computer vision.",
//       aboutP3: "MCA from Chandigarh University, with hands-on experience across PHP, Node.js, React, Python, FastAPI and more.",
//       aboutTags: ["PHP", "Node.js", "React", "Python", "FastAPI", "DeepFace", "MediaPipe", "PostgreSQL"],
//       email: "agamtyagi2001@gmail.com",
//       phone: "+91 82181 85432",
//       github: "https://github.com/Agam5432",
//       linkedin: "https://www.linkedin.com/in/agam-tyagi-6624a7204",
//       resumeUrl: "/Agam_Tyagi_Resume.pdf",
//       stats: [
//         { num: "2+", label: "Years Experience" },
//         { num: "5+", label: "Production Apps" },
//         { num: "10+", label: "REST APIs Built" },
//         { num: "8+", label: "Projects" }
//       ]
//     });

//     // Skills
//     await SkillGroup.deleteMany({});
//     await SkillGroup.insertMany([
//       { label: "Frontend", chips: ["React.js", "HTML5", "CSS3", "Tailwind CSS", "Bootstrap", "jQuery", "AJAX"], highlight: false, order: 1 },
//       { label: "Backend", chips: ["Node.js", "Express.js", "PHP", "Laravel", "FastAPI", "REST APIs", "MVC"], highlight: false, order: 2 },
//       { label: "AI / ML", chips: ["DeepFace", "MediaPipe", "OpenCV", "EasyOCR", "PaddleOCR", "LLM Integration", "Groq", "Ollama"], highlight: true, order: 3 },
//       { label: "Databases", chips: ["MySQL", "PostgreSQL", "MongoDB", "Prisma ORM", "Mongoose", "SQLite"], highlight: false, order: 4 },
//       { label: "Languages", chips: ["JavaScript (ES6+)", "Python", "PHP"], highlight: false, order: 5 },
//       { label: "Auth & Security", chips: ["JWT", "RBAC", "Session Auth", "Liveness Detection", "Anti-Spoofing"], highlight: false, order: 6 },
//       { label: "Payments", chips: ["Razorpay", "Stripe"], highlight: false, order: 7 },
//       { label: "Tools", chips: ["Git", "GitHub", "Postman", "VS Code", "Prisma Studio", "Multer", "Axios"], highlight: false, order: 8 },
//     ]);

//     // Experience
//     await Experience.deleteMany({});
//     await Experience.create({
//       role: "Full Stack Developer",
//       company: "Backup Infotech",
//       period: "Jul 2024 – Present",
//       location: "Chandigarh, India",
//       points: [
//         "Designed and deployed 5+ production-grade full-stack web applications using PHP, Laravel, Node.js, Express.js & MySQL",
//         "Built and documented 10+ RESTful APIs consumed by web and mobile clients with full authentication",
//         "Integrated Razorpay & Stripe payment gateways with webhook handling across multiple platforms",
//         "Implemented JWT-based authentication with RBAC and granular permission handling",
//         "Optimised complex SQL queries, indexing strategies & maintained Git-based team workflows",
//         "Covered diverse industry domains: e-commerce, examination systems, multi-role platforms",
//       ],
//       tags: ["PHP", "Laravel", "Node.js", "Express.js", "MySQL", "JWT", "RBAC", "Razorpay", "Stripe"],
//       order: 1
//     });

//     // Education
//     await Education.deleteMany({});
//     await Education.insertMany([
//       { degree: "Master of Computer Applications (MCA)", uni: "Chandigarh University", year: "Jul 2022 – Jun 2024", icon: "🎓", highlight: true, order: 1 },
//       { degree: "Bachelor of Computer Applications (BCA)", uni: "Ch. Charan Singh University", year: "Jul 2019 – Jun 2022", icon: "📚", highlight: false, order: 2 },
//     ]);

//     // Projects
//     await Project.deleteMany({});
//     await Project.insertMany([
//       { title: "AI Face Authentication & Liveness Detection", description: "Biometric authentication with real-time liveness detection — blink & head-movement verification to prevent spoofing and replay attacks.", icon: "🤖", tags: ["AI", "Security"], stack: ["Node.js", "FastAPI", "DeepFace", "MediaPipe", "PostgreSQL", "Prisma"], featured: true, visible: true, order: 1 },
//       { title: "Nexora AI Assistant", description: "AI conversational assistant with multi-model LLM support (Groq + Ollama), real-time web search & multilingual responses.", icon: "🧠", tags: ["AI", "LLM"], stack: ["Python", "Groq API", "Ollama", "Gradio", "Tavily"], featured: true, visible: true, order: 2 },
//       { title: "Aashi Rainwear — E-Commerce", description: "Cross-platform Flutter e-commerce app with product catalogue, cart, order tracking & Razorpay payment processing.", icon: "🛒", tags: ["E-Commerce", "Flutter"], stack: ["Flutter", "Node.js", "PHP", "MySQL"], featured: true, visible: true, order: 3 },
//       { title: "AI Resume Parser", description: "Automated resume parsing for PDF & DOCX — extracts skills, experience, education into structured JSON.", icon: "📄", tags: ["AI", "Parser"], stack: ["Node.js", "FastAPI", "Python"], featured: true, visible: true, order: 4 },
//       { title: "Google Photos-Style Face Grouping", description: "Auto face detection & clustering using DeepFace similarity matching.", icon: "📷", tags: ["AI", "Vision"], stack: ["Express.js", "DeepFace", "PostgreSQL", "Prisma"], featured: false, visible: true, order: 5 },
//       { title: "OCR Document Extraction", description: "High-accuracy OCR pipeline for scanned docs, ID cards & invoices using dual OCR engines.", icon: "🔍", tags: ["AI", "OCR"], stack: ["FastAPI", "OpenCV", "EasyOCR", "PaddleOCR"], featured: false, visible: true, order: 6 },
//       { title: "Radigone Web App", description: "Multi-role platform with RBAC, permission management & automated commission calculation.", icon: "⚙️", tags: ["Web", "RBAC"], stack: ["PHP", "Laravel", "MySQL", "JavaScript"], featured: false, visible: true, order: 7 },
//       { title: "Online Examination System", description: "Secure exam platform with timed tests, auto grading & result analytics.", icon: "📝", tags: ["Web", "EdTech"], stack: ["Laravel", "PHP", "MySQL", "jQuery", "AJAX"], featured: false, visible: true, order: 8 },
//     ]);

//     res.json({ success: true, message: "✅ All data seeded successfully!" });
//   } catch(err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// MongoDB connect
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ MongoDB error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
