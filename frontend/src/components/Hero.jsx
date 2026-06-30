import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Download, ArrowRight, Github, Linkedin } from "lucide-react";
import axios from "axios";
import { useNavigate, useLocation } from 'react-router-dom';

const DEFAULTS = {
  name: "Agam Tyagi",
  title: "Full Stack Developer",
  subtitle: "AI Integration Engineer",
  tagline: "Building production-grade web apps with real AI — computer vision, LLMs, and everything in between.",
  badge: "Open to Opportunities",
  badge2: "Open to On-site / Office-based",
  githubUrl: "https://github.com/Agam5432",
  linkedinUrl: "https://www.linkedin.com/in/agam-tyagi-6624a7204",
  resumeUrl: "/Agam_Tyagi_Resume.pdf",
  stats: [
    { num: "2+", label: "Years Experience" },
    { num: "5+", label: "Production Apps" },
    { num: "10+", label: "REST APIs Built" },
    { num: "8+", label: "Projects" },
  ],
};

const CODE_LINES = [
  { tokens: [{ t: "const", c: "#6c63ff" }, { t: " developer", c: "#00d4ff" }, { t: " = {", c: "#f0f0f5" }] },
  { tokens: [{ t: "  name", c: "#10b981" }, { t: ": ", c: "#f0f0f5" }, { t: '"Agam Tyagi"', c: "#fbbf24" }, { t: ",", c: "#f0f0f5" }] },
  { tokens: [{ t: "  role", c: "#10b981" }, { t: ": ", c: "#f0f0f5" }, { t: '"Full Stack Dev"', c: "#fbbf24" }, { t: ",", c: "#f0f0f5" }] },
  { tokens: [{ t: "  ai", c: "#10b981" }, { t: ": ", c: "#f0f0f5" }, { t: '"Integration Engineer"', c: "#fbbf24" }, { t: ",", c: "#f0f0f5" }] },
  { tokens: [{ t: "  skills", c: "#10b981" }, { t: ": [", c: "#f0f0f5" }] },
  { tokens: [{ t: '    "React"', c: "#fbbf24" }, { t: ", ", c: "#f0f0f5" }, { t: '"Node.js"', c: "#fbbf24" }, { t: ",", c: "#f0f0f5" }] },
  { tokens: [{ t: '    "Python"', c: "#fbbf24" }, { t: ", ", c: "#f0f0f5" }, { t: '"DeepFace"', c: "#fbbf24" }, { t: ",", c: "#f0f0f5" }] },
  { tokens: [{ t: '    "FastAPI"', c: "#fbbf24" }, { t: ", ", c: "#f0f0f5" }, { t: '"Groq AI"', c: "#fbbf24" }] },
  { tokens: [{ t: "  ]", c: "#f0f0f5" }, { t: ",", c: "#f0f0f5" }] },
  { tokens: [{ t: "  status", c: "#10b981" }, { t: ": ", c: "#f0f0f5" }, { t: '"available ✅"', c: "#fbbf24" }] },
  { tokens: [{ t: "}", c: "#f0f0f5" }] },
];

function CodeEditor() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (visibleLines < CODE_LINES.length) {
      const timer = setTimeout(() => setVisibleLines(v => v + 1), 150);
      return () => clearTimeout(timer);
    }
  }, [visibleLines]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="w-full max-w-md rounded-2xl overflow-hidden"
      style={{
        background: '#0d0d14',
        border: '1px solid #2a2a3a',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(108,99,255,0.08)'
      }}
    >
      {/* Editor titlebar */}
      <div className="flex items-center gap-2 px-4 py-3"
        style={{ background: '#1a1a24', borderBottom: '1px solid #2a2a3a' }}>
        <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
        <div className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
        <div className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
        <span className="ml-3 text-xs" style={{ color: '#555577', fontFamily: 'monospace' }}>agam.js</span>
        <div className="ml-auto flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#6c63ff' }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#00d4ff' }} />
        </div>
      </div>

      {/* Code body */}
      <div className="p-5"
        style={{ fontFamily: "'JetBrains Mono','Fira Code',monospace", fontSize: '13px', lineHeight: '1.9', minHeight: '260px' }}>
        <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
        {CODE_LINES.slice(0, visibleLines).map((line, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.12 }}
            className="flex gap-4">
            <span style={{ color: '#333355', userSelect: 'none', minWidth: '18px', textAlign: 'right', fontSize: '11px' }}>{i + 1}</span>
            <span>
              {line.tokens.map((tok, j) => (
                <span key={j} style={{ color: tok.c }}>{tok.t}</span>
              ))}
            </span>
          </motion.div>
        ))}
        {/* Blinking cursor */}
        <div className="flex gap-5">
          <span style={{ color: '#333355', minWidth: '18px', textAlign: 'right', fontSize: '11px' }}>
            {visibleLines >= CODE_LINES.length ? CODE_LINES.length + 1 : visibleLines + 1}
          </span>
          <span style={{
            display: 'inline-block', width: '2px', height: '16px',
            background: '#6c63ff', verticalAlign: 'middle',
            animation: 'blink 1s infinite'
          }} />
        </div>
      </div>

      {/* Status bar */}
      <div className="px-4 py-2 flex items-center justify-between"
        style={{ background: '#1a1a24', borderTop: '1px solid #2a2a3a' }}>
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: '#6c63ff' }}>⬡ JavaScript</span>
          <span className="text-xs" style={{ color: '#888899' }}>UTF-8</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full"
            style={{ background: '#10b981', boxShadow: '0 0 6px rgba(16,185,129,0.8)' }} />
          <span className="text-xs" style={{ color: '#10b981' }}>Ready</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function Hero({ goTo }) {
  const [data, setData] = useState(DEFAULTS);
  const navigate = useNavigate();

  // 🛡 Guard against React StrictMode double-firing useEffect in dev mode,
  // which was causing 2 visitor documents to be created on a single page load.
  const hasFetchedProfile = useRef(false);

  useEffect(() => {
    if (hasFetchedProfile.current) return;
    hasFetchedProfile.current = true;

    axios.get(`/api/profile`, { withCredentials: true })
      .then((r) => setData({ ...DEFAULTS, ...r.data }))
      .catch(() => {});
  }, []);

  // 📥 Track resume downloads in the backend, then let the browser proceed
  // with the actual file download via the <a download> tag.
  const handleResumeDownload = () => {
    axios.post(`/api/analytics/resume-download`, {}, { withCredentials: true })
      .catch(() => {}); // never block the download if tracking fails
  };

  const nameParts = data.name.split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");

  return (
    <section className="min-h-[calc(100vh-64px)] flex flex-col justify-center px-6 md:px-16 lg:px-16 py-16 relative overflow-hidden">

      {/* Background glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(108,99,255,0.10) 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(0,212,255,0.06) 0%, transparent 70%)', transform: 'translate(-20%, 20%)' }} />

      {/* 2 Column — Left content + Right editor */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-8 w-full">

        {/* ── LEFT SIDE ── */}
        <div className="flex-1 flex flex-col">

          {/* Badges */}
          <div className="flex flex-wrap gap-3 mb-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              style={{ background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.25)', color: '#6c63ff' }}>
              <span className="w-2 h-2 rounded-full bg-[#6c63ff] pulse-dot" />
              {data.badge}
            </motion.div>
            {data.badge2 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)', color: '#00d4ff' }}>
                <span className="w-2 h-2 rounded-full pulse-dot" style={{ background: '#00d4ff' }} />
                {data.badge2}
              </motion.div>
            )}
          </div>

          {/* Name */}
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none mb-4">
            {firstName} <span className="gradient-text">{lastName}</span>
          </motion.h1>

          {/* Title */}
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="text-xl md:text-2xl font-light mb-4" style={{ color: '#888899' }}>
            <span className="text-[#f0f0f5] font-semibold">{data.title}</span>
            {data.subtitle ? ` & ${data.subtitle}` : ""}
          </motion.p>

          {/* Tagline */}
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
            className="text-base md:text-lg max-w-xl mb-10 leading-relaxed" style={{ color: '#888899' }}>
            {data.tagline}
          </motion.p>

          {/* Buttons */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.39 }}
            className="flex flex-wrap gap-3 mb-16">
            <button onClick={() => navigate("/projects")}
              className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold">
              View Projects <ArrowRight size={16} />
            </button>
            <button onClick={() => navigate("/contact")}
              className="btn-outline flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold">
              Let's Talk
            </button>
            <a href={data.resumeUrl} download onClick={handleResumeDownload}
              className="btn-outline flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold">
              <Download size={15} /> Resume
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-8 md:gap-14">
            {(data.stats || []).map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.07 }}>
                <div className="text-3xl md:text-4xl font-black text-[#f0f0f5]">{s.num}</div>
                <div className="text-xs md:text-sm mt-1" style={{ color: '#888899' }}>{s.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Social */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="flex gap-3 mt-10">
            {data.githubUrl && (
              <a href={data.githubUrl} target="_blank" rel="noreferrer"
                className="p-3 rounded-xl btn-outline flex items-center justify-center">
                <Github size={17} />
              </a>
            )}
            {data.linkedinUrl && (
              <a href={data.linkedinUrl} target="_blank" rel="noreferrer"
                className="p-3 rounded-xl btn-outline flex items-center justify-center">
                <Linkedin size={17} />
              </a>
            )}
          </motion.div>
        </div>

        {/* ── RIGHT SIDE — Code Editor (desktop only) ── */}
        <div className="hidden lg:flex w-[460px] shrink-0 items-center justify-center">
          <CodeEditor />
        </div>

      </div>
    </section>
  );
}