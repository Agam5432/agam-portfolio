require("dotenv").config();
const mongoose = require("mongoose");
const SkillGroup = require("./models/SkillGroup");
const Experience = require("./models/Experience");
const Education = require("./models/Education");

const skillGroups = [
  { label: "Frontend", chips: ["React.js", "HTML5", "CSS3", "Tailwind CSS", "Bootstrap", "jQuery", "AJAX"], isAI: false, order: 1 },
  { label: "Backend", chips: ["Node.js", "Express.js", "PHP", "Laravel", "FastAPI", "REST APIs", "MVC"], isAI: false, order: 2 },
  { label: "AI / ML", chips: ["DeepFace", "MediaPipe", "OpenCV", "EasyOCR", "PaddleOCR", "LLM Integration", "Groq", "Ollama"], isAI: true, order: 3 },
  { label: "Databases", chips: ["MySQL", "PostgreSQL", "MongoDB", "Prisma ORM", "Mongoose", "SQLite"], isAI: false, order: 4 },
  { label: "Languages", chips: ["JavaScript (ES6+)", "Python", "PHP"], isAI: false, order: 5 },
  { label: "Auth & Security", chips: ["JWT", "RBAC", "Session Auth", "Liveness Detection", "Anti-Spoofing"], isAI: false, order: 6 },
  { label: "Payments", chips: ["Razorpay", "Stripe"], isAI: false, order: 7 },
  { label: "Tools", chips: ["Git", "GitHub", "Postman", "VS Code", "Prisma Studio", "Multer", "Axios"], isAI: false, order: 8 },
];

const experiences = [
  {
    role: "Full Stack Developer",
    company: "Backup Infotech",
    period: "Jul 2024 – Present",
    location: "Chandigarh, India",
    points: [
      "Designed and deployed 5+ production-grade full-stack web applications using PHP, Laravel, Node.js, Express.js & MySQL",
      "Built and documented 10+ RESTful APIs consumed by web and mobile clients with full authentication",
      "Integrated Razorpay & Stripe payment gateways with webhook handling across multiple platforms",
      "Implemented JWT-based authentication with RBAC and granular permission handling",
      "Optimised complex SQL queries, indexing strategies & maintained Git-based team workflows",
      "Covered diverse industry domains: e-commerce, examination systems, multi-role platforms",
    ],
    tags: ["PHP", "Laravel", "Node.js", "Express.js", "MySQL", "JWT", "RBAC", "Razorpay", "Stripe", "REST APIs"],
    order: 1,
  }
];

const education = [
  {
    degree: "Master of Computer Applications (MCA)",
    uni: "Chandigarh University",
    year: "Jul 2022 – Jun 2024",
    icon: "🎓",
    highlight: true,
    note: "Computer Applications background gave me a solid foundation in data structures, algorithms, OOP, and system design — which I've applied across every production project.",
    order: 1,
  },
  {
    degree: "Bachelor of Computer Applications (BCA)",
    uni: "Ch. Charan Singh University",
    year: "Jul 2019 – Jun 2022",
    icon: "📚",
    highlight: false,
    note: "",
    order: 2,
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);

  await SkillGroup.deleteMany({});
  await SkillGroup.insertMany(skillGroups);
  console.log("✅ Skills seeded");

  await Experience.deleteMany({});
  await Experience.insertMany(experiences);
  console.log("✅ Experience seeded");

  await Education.deleteMany({});
  await Education.insertMany(education);
  console.log("✅ Education seeded");

  mongoose.disconnect();
  console.log("✅ All dynamic content seeded!");
}

seed().catch(console.error);
