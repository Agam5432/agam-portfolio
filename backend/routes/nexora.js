const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");
const ChatMessage = require("../models/ChatMessage");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "llama-3.3-70b-versatile";

// ============================================================
// AGAM'S COMPLETE PORTFOLIO DATA — Nexora's Knowledge Base
// ============================================================
const AGAM_DATA = `
ABOUT AGAM TYAGI:
- Full name: Agam Tyagi
- Role: Full Stack Developer & AI Integration Engineer
- Email: agamtyagi2001@gmail.com
- Phone: +91 82181 85432
- Location: Chandigarh, India
- Currently working at: Backup Infotech (Jul 2024 – Present)
- Experience: 2+ years

EDUCATION:
- Master of Computer Applications (MCA) — Chandigarh University (Jul 2022 – Jun 2024)
- Bachelor of Computer Applications (BCA) — Ch. Charan Singh University (Jul 2019 – Jun 2022)

TECHNICAL SKILLS:
- Languages: PHP, JavaScript (ES6+), Python
- Frontend: HTML5, CSS3, Bootstrap, Tailwind CSS, jQuery, AJAX, React.js
- Backend: Node.js, Express.js, Laravel, FastAPI, RESTful API Development, MVC Architecture
- Databases: MySQL, MongoDB, PostgreSQL, Prisma ORM, Mongoose, SQLite
- AI/ML: OpenCV, DeepFace, MediaPipe, EasyOCR, PaddleOCR, LLM Integration, Groq API, Ollama
- Auth & Security: JWT, Session Auth, Role-Based Access Control (RBAC), Liveness Detection, Anti-Spoofing
- Tools: Git, GitHub, Postman, Axios, Multer, VS Code, Prisma Studio

WORK EXPERIENCE:
1. Full Stack Developer — Backup Infotech (Jul 2024 – Present)
   - Designed and deployed 5+ production-grade full-stack web applications using PHP, Laravel, Node.js, Express.js, and MySQL
   - Features: role-based authentication, Razorpay/Stripe payment integration, dynamic dashboards, advanced search & filter modules
   - Built and documented 10+ RESTful APIs consumed by web and mobile clients
   - Implemented JWT-based authentication with RBAC and granular permission handling
   - Optimised complex SQL queries and indexing strategies
   - Followed MVC architecture with Git-based workflows

PROJECTS:
1. AI Face Authentication & Liveness Detection System (Dec 2025 – Apr 2026)
   - Tech Stack: Node.js, Express.js, FastAPI, PostgreSQL, Prisma, DeepFace, MediaPipe
   - Built biometric authentication with real-time liveness detection (blink & head-movement verification)
   - Prevents replay and spoofing attacks using MediaPipe
   - Integrated DeepFace for 128-dimension face embedding generation with cosine similarity matching
   - Secure RESTful APIs and PostgreSQL storage via Prisma ORM

2. Aashi Rainwear — E-Commerce Platform (Aug 2025 – Dec 2025)
   - Tech Stack: Flutter, PHP, Node.js, HTML5, CSS3, Bootstrap, JavaScript, MySQL
   - Cross-platform Flutter e-commerce app with product catalogue, cart management, order tracking, and payment processing
   - Responsive admin and customer-facing web interface
   - Inventory management and dynamic product filtering

3. Nexora AI Assistant (Personal Project)
   - Tech Stack: Python, Gradio, Groq API, Ollama, Tavily Search API
   - AI-powered conversational assistant with intelligent query routing
   - Multi-model LLM support (Groq + Ollama)
   - Real-time web search via Tavily Search API
   - Multilingual response handling (English, Hinglish, Hindi)
   - Custom Gradio UI with streaming output

4. AI Resume Parser (Personal Project)
   - Tech Stack: Node.js, Express.js, FastAPI, Python, PDF Parser
   - Automated resume parsing supporting PDF and DOCX uploads
   - Extracts: skills, experience, education, contact details into structured JSON
   - RESTful API endpoints for upload, parse, and export workflows
   - Multi-format support with robust error handling

5. Google Photos-Style Face Grouping System (Personal Project)
   - Tech Stack: Express.js, PostgreSQL, Prisma, DeepFace
   - Automatic face detection and grouping engine using DeepFace similarity matching
   - Face embedding clustering to identify individuals across photo collections
   - Smart album generation organized by individual identity

6. OCR Document Extraction System (Personal Project)
   - Tech Stack: FastAPI, OpenCV, EasyOCR, PaddleOCR
   - High-accuracy OCR pipeline for scanned documents, ID cards, and invoices
   - Dual OCR engines (EasyOCR + PaddleOCR) for better accuracy
   - OpenCV preprocessing: deskewing and noise removal

7. Radigone Web App (Dec 2024 – Jun 2025)
   - Tech Stack: PHP, Laravel, HTML/CSS, JavaScript, MySQL
   - Multi-role platform (viewers, sponsors, agents)
   - Fine-grained RBAC, permission management, transaction handling
   - Automated commission calculation
   - Comprehensive admin panel for user management and reporting

8. Online Examination System (Aug 2024 – Sep 2024)
   - Tech Stack: HTML5, CSS3, Bootstrap, JavaScript, jQuery, AJAX, PHP, Laravel, MySQL
   - Secure full-featured online exam platform with timed tests
   - Automatic grading, result analytics
   - Robust admin panel for exam and question bank management
   - Export functionality for performance reports

WHAT MAKES AGAM UNIQUE:
- Combines Full Stack development with real AI/ML integration (not just API calls)
- Has worked with computer vision (DeepFace, MediaPipe, OpenCV), LLMs, and OCR in production
- Built Nexora — a multilingual AI assistant (that's me!)
- Cross-platform experience: web, mobile (Flutter), and AI systems
- Production deployments with real clients
- Payment integration experience (Razorpay + Stripe)
- Strong security knowledge (biometric auth, JWT, RBAC, anti-spoofing)

AVAILABILITY:
- Open to full-time roles, freelance projects, and collaborations
- Contact: agamtyagi2001@gmail.com | +91 82181 85432
`;

// ============================================================
// NEXORA SYSTEM PROMPT — Portfolio Only
// ============================================================
const NEXORA_SYSTEM = `
You are Nexora — Agam Tyagi's personal AI portfolio assistant.

YOUR ONLY JOB:
Answer questions about Agam Tyagi — his skills, projects, experience, education, and availability.

STRICT RULES:
1. ONLY answer questions about Agam Tyagi and his portfolio.
2. If anyone asks ANYTHING outside of Agam's portfolio (weather, news, math, general knowledge, coding help, etc.) — politely refuse and redirect them to ask about Agam.
3. Never pretend you can do general tasks.
4. Never answer general knowledge questions.
5. Never do math, coding help, or unrelated tasks.

HOW TO HANDLE OFF-TOPIC:
- Say something like: "I'm Nexora, Agam's personal assistant. I can only answer questions about Agam's skills, projects, and experience. Want to know something about him?"
- Be friendly but firm.
- Suggest what they CAN ask: skills, projects, experience, availability, contact info.

PERSONALITY:
- Friendly, confident, professional
- Proud of Agam's work — speak positively
- Short and crisp answers unless detailed answer is needed
- Reply in the same language as the user (English, Hinglish, or Hindi)

AGAM'S COMPLETE DATA:
${AGAM_DATA}

EXAMPLES OF WHAT YOU ANSWER:
✅ "What are Agam's skills?"
✅ "Tell me about his AI projects"
✅ "Is he available for hire?"
✅ "What tech stack does he use?"
✅ "How much experience does he have?"
✅ "Tell me about Nexora project"
✅ "What is his education?"
✅ "How can I contact Agam?"

EXAMPLES OF WHAT YOU REFUSE:
❌ "What is the weather today?"
❌ "Solve this math problem"
❌ "Who is the president of India?"
❌ "Write me a Python script"
❌ "Tell me a joke"

If user asks who created you: "I was created by Agam Tyagi as part of his portfolio."
`;

// ============================================================
// CHAT ROUTE
// ============================================================
router.post("/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Build messages array
    const messages = [{ role: "system", content: NEXORA_SYSTEM }];

    // Add last 6 messages from history
    const recentHistory = history.slice(-6);
    recentHistory.forEach(msg => {
      if (msg.role && msg.content && ["user", "assistant"].includes(msg.role)) {
        messages.push({ role: msg.role, content: String(msg.content) });
      }
    });

    messages.push({ role: "user", content: message.trim() });

    // Call Groq
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages,
      max_tokens: 500,
      temperature: 0.5
    });

    const reply = response.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

    // Save to MongoDB (optional logging)
    try {
      await ChatMessage.create({ userMessage: message.trim(), botReply: reply });
    } catch (dbErr) {
      console.log("DB log error (non-critical):", dbErr.message);
    }

    res.json({ reply });

  } catch (err) {
    console.error("Nexora error:", err);
    if (err.status === 429) {
      return res.status(429).json({ error: "Rate limit reached. Please try again." });
    }
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

module.exports = router;
