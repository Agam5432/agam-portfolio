// Single source of truth for portfolio content, kept in sync with the latest resume.
// Used by seedDynamic.js (DB sync) and as the default when no Profile exists yet.

const profile = {
  name: "Agam Tyagi",
  title: "AI Engineer",
  subtitle: "Generative AI · RAG · Agentic Systems",
  tagline: "Building production LLM applications — RAG pipelines, agentic AI with tool calling, and real-time voice agents.",
  badge: "Open to Opportunities",
  githubUrl: "https://github.com/Agam5432",
  email: "agamtyagi2001@gmail.com",
  phone: "+91 82181 85432",
  linkedinUrl: "https://www.linkedin.com/in/agam-tyagi-6624a7204",
  resumeUrl: "/Agam_Tyagi_Resume.pdf",
  stats: [
    { num: "2.5 yrs", label: "Software Engineering" },
    { num: "2 yrs", label: "Generative AI" },
    { num: "6", label: "Projects Shipped" },
  ],
  aboutPara1: "I'm an AI Engineer based in Mohali, Punjab, with 2.5 years of software engineering experience and 2 years of hands-on Generative AI work at Backup Infotech.",
  aboutPara2: "I build production LLM applications: RAG chatbots on Qdrant vector search, agentic assistants with LangGraph tool calling, and real-time voice agents on the Gemini Live API.",
  aboutPara3: "MCA from Chandigarh University. Backend foundation in Node.js, Express.js, FastAPI, MongoDB and PostgreSQL, with React.js on the frontend.",
  aboutTags: ["LangGraph", "LangChain", "RAG", "Qdrant", "Groq", "Gemini Live API", "Node.js", "FastAPI", "React"],
  aboutCards: [
    { icon: "🤖", title: "Agentic AI", desc: "LangGraph tool-calling agents that search, recommend and act, with Gemini-to-Groq failover" },
    { icon: "📚", title: "RAG Systems", desc: "Crawling, chunking, local embeddings and Qdrant search powering grounded chatbots" },
    { icon: "🎙️", title: "Voice AI", desc: "Real-time voice agents over WebSockets with barge-in, English, Hindi and Hinglish" },
    { icon: "⚡", title: "Full Stack", desc: "React, Node.js, Express, MongoDB and REST APIs with JWT auth and RBAC" },
  ],
  location: "Mohali, Punjab, India",
};

const skillGroups = [
  { label: "Generative AI & LLMs", chips: ["LLM Integration", "Prompt Engineering", "RAG", "Agentic AI", "Tool Calling", "AI Workflow Orchestration", "Conversational AI"], isAI: true, order: 1 },
  { label: "AI Frameworks & Models", chips: ["LangChain", "LangGraph", "Gemini Live API", "Groq API", "Llama 3.3-70B", "Ollama", "Transformers.js", "all-MiniLM-L6-v2"], isAI: true, order: 2 },
  { label: "Vector Search", chips: ["Qdrant", "Vector Databases", "Embedding Models", "Semantic Search", "Similarity Search", "Document Chunking"], isAI: true, order: 3 },
  { label: "Voice AI", chips: ["Real-time Voice Agents", "Speech-to-Text", "WebSockets", "Barge-in Handling", "English / Hindi / Hinglish"], isAI: true, order: 4 },
  { label: "Computer Vision", chips: ["DeepFace", "MediaPipe", "Face Recognition", "Liveness Detection", "Anti-Spoofing"], isAI: true, order: 5 },
  { label: "Languages", chips: ["Python", "JavaScript (ES6+)", "PHP"], isAI: false, order: 6 },
  { label: "Backend", chips: ["Node.js", "Express.js", "FastAPI", "Laravel", "REST APIs", "WebSockets", "JWT", "RBAC", "MVC", "Shopify GraphQL API"], isAI: false, order: 7 },
  { label: "Frontend", chips: ["React.js", "Tailwind CSS", "HTML5", "CSS3", "Bootstrap", "jQuery", "AJAX"], isAI: false, order: 8 },
  { label: "Databases", chips: ["MongoDB", "PostgreSQL", "MySQL", "SQLite", "Mongoose", "Prisma ORM"], isAI: false, order: 9 },
  { label: "Tools & DevOps", chips: ["Git", "GitHub", "GitHub Actions (CI/CD)", "Vercel", "Postman", "VS Code", "Google Analytics 4", "Mouseflow"], isAI: false, order: 10 },
];

const experiences = [
  {
    role: "Generative AI & Full Stack Developer",
    company: "Backup Infotech",
    period: "Jul 2024 – Present",
    location: "Mohali, Punjab, India",
    points: [
      "Built an agentic AI shopping assistant with LangGraph tool calling, real-time voice (Gemini Live API) and Shopify integration for product search, recommendations and cart management.",
      "Developed a production RAG chatbot that automates website query handling, using Qdrant vector search, local embeddings and Groq Llama 3.3-70B for grounded, domain-specific answers.",
      "Designed AI-powered features for client products, including AI talent matching and recommendations for a hiring platform.",
      "Built RESTful APIs and WebSocket services that serve AI agents and web applications, with JWT authentication, RBAC and optimized database queries.",
      "Delivered full-stack applications with React.js, Node.js, Express.js and MongoDB across multiple industry domains.",
      "Used GitHub Actions CI/CD workflows to automate build and deployment steps.",
    ],
    tags: ["LangGraph", "Gemini Live API", "Qdrant", "Groq", "Node.js", "React", "MongoDB", "JWT", "RBAC"],
    order: 1,
  },
];

const education = [
  { degree: "Master of Computer Applications (MCA)", uni: "Chandigarh University", year: "Jul 2022 – Jun 2024", icon: "🎓", highlight: true, note: "", order: 1 },
  { degree: "Bachelor of Computer Applications (BCA)", uni: "Ch. Charan Singh University", year: "Jul 2019 – Jun 2022", icon: "📚", highlight: false, note: "", order: 2 },
];

const projects = [
  { title: "AI Commerce Voice Agent (Shopify)", period: "Oct 2026 – Present", description: "Real-time voice and chat shopping assistant: mic audio streams over WebSockets to Gemini Live, a LangGraph agent acts on it, with barge-in, OTP-secured checkout, Gemini-to-Groq failover and English/Hindi/Hinglish support.", icon: "🎙️", tags: ["AI", "Voice", "Agentic"], stack: ["Node.js", "Express.js", "WebSockets", "LangGraph", "Gemini Live API", "Groq", "MongoDB", "Shopify GraphQL"], featured: true, order: 1 },
  { title: "Enterprise AI Chatbot (RAG)", period: "Jun 2026 – Jul 2026", description: "Production RAG chatbot built by crawling and indexing 400+ website pages into Qdrant, with chunking, local embeddings, Groq Llama 3.3-70B, session history and lead intent detection.", icon: "🧠", tags: ["AI", "RAG"], stack: ["Node.js", "LangChain", "Groq", "Llama 3.3-70B", "Qdrant", "Transformers.js"], featured: true, order: 2 },
  { title: "Avencher: AI Hiring Platform", period: "Nov 2025 – Present", description: "Verified talent and hiring platform connecting professionals and companies, with identity verification and AI-driven talent matching and recommendations.", icon: "💼", tags: ["AI", "Hiring"], stack: ["React (Vite)", "Node.js", "Express.js", "MongoDB"], featured: true, order: 3 },
  { title: "Foto-Alpha: Photography Platform", period: "Apr 2025 – Dec 2025", description: "Full-stack platform where photographers manage portfolios, events and client galleries, with QR-based instant gallery delivery and secure cloud storage.", icon: "📷", tags: ["Full Stack"], stack: ["React (Vite)", "Node.js", "Express.js", "MongoDB"], featured: false, order: 4 },
  { title: "Radigone Web App", period: "Oct 2024 – Feb 2025", description: "Multi-role platform (viewers, sponsors, agents) with fine-grained RBAC, transaction handling, automated commission calculation and a Laravel admin panel.", icon: "🧩", tags: ["Full Stack"], stack: ["PHP", "Laravel", "MySQL", "JavaScript"], featured: false, order: 5 },
  { title: "Online Examination System", period: "Sep 2024", description: "Online exam platform with timed tests, automatic grading, result analytics and an admin panel for exam and question bank management with report export.", icon: "📝", tags: ["Full Stack"], stack: ["PHP", "Laravel", "MySQL", "jQuery", "Bootstrap"], featured: false, order: 6 },
];

module.exports = { profile, skillGroups, experiences, education, projects };
