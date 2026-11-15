// Agam Tyagi's resume, as plain text. This is the ONLY knowledge source for the Nexora chatbot.
// Keep it in sync with the resume PDF (frontend/public/Agam_Tyagi_Resume.pdf).
module.exports = `
AGAM TYAGI — AI Engineer
Email: agamtyagi2001@gmail.com | Phone: +91 82181 85432
LinkedIn: https://www.linkedin.com/in/agam-tyagi-6624a7204
GitHub: https://github.com/Agam5432
Location: Mohali, Punjab, India
Availability: open to new opportunities (onsite, office-based and remote).

PROFESSIONAL SUMMARY
AI Engineer with 2+ years of professional experience. Joined Backup Infotech in Jul 2024 as a developer, began working on AI integration after the internship period and gradually moved into Generative AI. Builds production LLM applications: RAG pipelines, agentic AI systems with LangGraph tool calling, and real-time voice agents. Strong backend foundation in Node.js, Express.js, FastAPI, MongoDB, PostgreSQL and Qdrant vector search, plus React.js for the frontend. Delivered AI chatbots, voice shopping assistants and AI-driven hiring features that solve real business problems end to end.

TECHNICAL SKILLS
- Generative AI and LLMs: LLM Integration, Prompt Engineering, Retrieval-Augmented Generation (RAG), Agentic AI, Tool Calling, AI Workflow Orchestration, Conversational AI
- AI Frameworks and Models: LangChain, LangGraph, Gemini Live API, Groq API, Llama 3.3-70B, Ollama, Transformers.js, all-MiniLM-L6-v2
- Vector Search and Retrieval: Qdrant, Vector Databases, Embedding Models, Semantic Search, Similarity Search, Document Chunking
- Voice AI: Real-time Voice Agents, Speech-to-Text, WebSockets, Barge-in Handling, Multilingual Support (English, Hindi, Hinglish)
- Computer Vision: DeepFace, MediaPipe, Face Recognition, Liveness Detection, Anti-Spoofing
- Languages: Python, JavaScript (ES6+), PHP
- Backend: Node.js, Express.js, FastAPI, Laravel, RESTful APIs, WebSockets, JWT, Session Authentication, RBAC, MVC Architecture, Shopify GraphQL API
- Frontend: React.js, Tailwind CSS, HTML5, CSS3, Bootstrap, jQuery, AJAX
- Databases: MongoDB, PostgreSQL, MySQL, SQLite, Mongoose, Prisma ORM, Database Optimization
- Tools and DevOps: Git, GitHub, GitHub Actions (CI/CD), Vercel, Postman, VS Code, Google Analytics 4, Mouseflow
- Fundamentals: Data Structures and Algorithms, Object-Oriented Programming

WORK EXPERIENCE
Generative AI and Full Stack Developer | Backup Infotech | Jul 2024 – Present
- Built an agentic AI shopping assistant with LangGraph tool calling, real-time voice (Gemini Live API) and Shopify integration for product search, recommendations and cart management.
- Developed a production RAG chatbot that automates website query handling, using Qdrant vector search, local embeddings and Groq Llama 3.3-70B for grounded, domain-specific answers.
- Designed AI-powered features for client products, including AI talent matching and recommendations for a hiring platform.
- Built RESTful APIs and WebSocket services that serve AI agents and web applications, with JWT authentication, RBAC and optimized database queries.
- Delivered full-stack applications with React.js, Node.js, Express.js and MongoDB, including dashboards, search and filtering, and scalable backend architecture across multiple industry domains.
- Used GitHub Actions CI/CD workflows to automate build and deployment steps.

PROJECTS
1. AI Commerce Voice Agent (Shopify) | Oct 2026 – Present
   Tech: Node.js, Express.js, WebSockets, LangGraph, Gemini Live API, Groq, MongoDB, Shopify GraphQL API, Theme App Extension
   - Real-time voice and chat shopping assistant: mic audio streams over WebSockets to Gemini Live for speech-to-text, a LangGraph agent acts on it, and replies are spoken back with barge-in support.
   - Secured checkout with OTP verification inside the agent flow, so the assistant can place orders without exposing payment or account details in the chat.
   - Gemini-to-Groq failover for reliability, English, Hindi and Hinglish support, and a Shopify Theme App Extension widget for storefronts.
2. Enterprise AI Chatbot (RAG) | Jun 2026 – Jul 2026
   Tech: Node.js, Express.js, LangChain, Groq API, Llama 3.3-70B, Qdrant, Transformers.js, all-MiniLM-L6-v2, REST APIs
   - Production RAG chatbot built by crawling and indexing 400+ website pages into a Qdrant vector database for domain-specific knowledge retrieval.
   - Custom retrieval pipeline with document chunking, local embedding generation and vector similarity search, later migrated to LangChain for better maintainability.
   - Integrated Groq Llama 3.3-70B with session-based conversation history and contextual response generation.
   - Lead intent detection and contact extraction in the chatbot APIs, converting conversations into qualified business leads.
   - Designed REST APIs for chat, session management and frontend integration.
3. Avencher: AI Hiring Platform | Nov 2025 – Present
   Tech: React.js (Vite), Node.js, Express.js, MongoDB, AI Integration, REST APIs
   - Verified talent and hiring platform that connects professionals and companies, with secure authentication and identity verification.
   - AI-driven talent matching and recommendation features to improve hiring efficiency.
   - Designed REST APIs for user and hiring workflows.
4. Foto-Alpha: Photography Management Platform | Apr 2025 – Dec 2025
   Tech: React.js (Vite), Node.js, Express.js, MongoDB, Mongoose, REST APIs
   - Full-stack platform where photographers manage portfolios, events and client galleries.
   - QR-based instant gallery delivery and fast photo sharing, with secure cloud storage integration.
5. Radigone Web App | Oct 2024 – Feb 2025
   Tech: PHP, Laravel, JavaScript, MySQL
   - Multi-role platform (viewers, sponsors, agents) with fine-grained RBAC, transaction handling and automated commission calculation.
   - Admin panel for user management, reporting and platform oversight using Laravel MVC.
6. Online Examination System | Sep 2024
   Tech: PHP, Laravel, MySQL, JavaScript, jQuery, AJAX, Bootstrap
   - Online exam platform with timed tests, automatic grading, result analytics and an admin panel for exam and question bank management, with report export.

EDUCATION
- Master of Computer Applications (MCA), Chandigarh University, Jul 2022 – Jun 2024
- Bachelor of Computer Applications (BCA), Ch. Charan Singh University, Jul 2019 – Jun 2022

ABOUT THIS CHATBOT
Nexora is the assistant on Agam's portfolio website. It answers questions about Agam from his resume and can pass a visitor's message to him by email.
`.trim();
