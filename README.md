# 🚀 Agam Tyagi — Portfolio (MERN Stack + Nexora AI)

Full portfolio website with:
- React frontend with Framer Motion animations
- Node.js + Express backend
- MongoDB database
- Nexora AI chatbot (Groq powered)
- Admin panel to manage everything

---

## 📁 Folder Structure

```
agam-portfolio/
├── frontend/     ← React portfolio website (port 5173)
├── backend/      ← Node.js + Express API (port 5000)
└── admin/        ← React admin panel (port 5174)
```

---

## ⚙️ Setup Instructions

### Step 1 — Install MongoDB
Make sure MongoDB is running locally.
Download: https://www.mongodb.com/try/download/community

### Step 2 — Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Now open `.env` and fill in:
```
GROQ_API_KEY=your_groq_api_key_here     ← Get from console.groq.com (free)
ADMIN_USERNAME=agam
ADMIN_PASSWORD=your_password_here
JWT_SECRET=any_random_long_string_here
```

Start backend:
```bash
npm run dev
```

### Step 3 — Seed Projects (First time only)

```bash
cd backend
node seed.js
```

This adds all 8 projects to MongoDB automatically.

### Step 4 — Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open: http://localhost:5173

### Step 5 — Admin Panel

```bash
cd admin
npm install
npm run dev
```

Open: http://localhost:5174

Login with the username/password you set in `.env`

---

## 🧠 Nexora AI Setup

1. Go to https://console.groq.com
2. Create a free account
3. Generate an API key
4. Paste it in `backend/.env` as `GROQ_API_KEY`

Nexora will only answer questions about Agam.
If someone asks anything else, it will politely redirect them.

---

## 🎨 Customize

- **Your links** → `frontend/src/components/Hero.jsx` (GitHub, LinkedIn URLs)
- **Resume download** → Put `Agam_Tyagi_Resume.pdf` in `frontend/public/`
- **Projects** → Update via Admin Panel at http://localhost:5174
- **Contact email** → `backend/.env` EMAIL_USER and EMAIL_PASS

---

## 🚀 Run Everything

Open 3 terminals:

Terminal 1 (Backend):
```bash
cd backend && npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend && npm run dev
```

Terminal 3 (Admin):
```bash
cd admin && npm run dev
```

---

## 📦 Deploy

- **Frontend** → Vercel (free): `vercel deploy`
- **Backend** → Railway or Render (free tier)
- **Admin** → Vercel as separate project
- **MongoDB** → MongoDB Atlas (free tier): https://cloud.mongodb.com

---

Built with ❤️ by Agam Tyagi
