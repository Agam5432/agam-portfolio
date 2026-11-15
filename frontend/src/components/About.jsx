import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'

const DEFAULT_CARDS = [
  { icon: '🤖', title: 'Agentic AI', desc: 'LangGraph tool-calling agents that search, recommend and act, with Gemini-to-Groq failover' },
  { icon: '📚', title: 'RAG Systems', desc: 'Crawling, chunking, local embeddings and Qdrant search powering grounded chatbots' },
  { icon: '🎙️', title: 'Voice AI', desc: 'Real-time voice agents over WebSockets with barge-in, English, Hindi and Hinglish' },
  { icon: '⚡', title: 'Full Stack', desc: 'React, Node.js, Express, MongoDB and REST APIs with JWT auth and RBAC' },
]

const DEFAULT_TAGS = ['LangGraph', 'LangChain', 'RAG', 'Qdrant', 'Groq', 'Gemini Live API', 'Node.js', 'FastAPI', 'React']

const DEFAULTS = {
  aboutPara1: "I'm an AI Engineer based in Mohali, Punjab, with 2+ years of professional experience at Backup Infotech. I started as a developer and, after my internship, began working on AI integration and gradually moved into Generative AI.",
  aboutPara2: "I build production LLM applications: RAG chatbots on Qdrant vector search, agentic assistants with LangGraph tool calling, and real-time voice agents on the Gemini Live API.",
  aboutPara3: "MCA from Chandigarh University. Backend foundation in Node.js, Express.js, FastAPI, MongoDB and PostgreSQL, with React.js on the frontend.",
  aboutTags: DEFAULT_TAGS,
  aboutCards: DEFAULT_CARDS,
}

export default function About() {
  const [data, setData] = useState(DEFAULTS)

  useEffect(() => {
    axios.get(`/api/profile`)
      .then(r => setData({ ...DEFAULTS, ...r.data }))
      .catch(() => {})
  }, [])

  const cards = (data.aboutCards?.length > 0) ? data.aboutCards : DEFAULT_CARDS
  const tags = (data.aboutTags?.length > 0) ? data.aboutTags : DEFAULT_TAGS

  return (
    <section className="min-h-[calc(100vh-64px)] flex flex-col justify-center px-6 md:px-16 lg:px-24 py-16"
      style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #111118 100%)' }}>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="text-xs font-semibold uppercase tracking-[3px] mb-3" style={{ color: '#6c63ff' }}>About Me</p>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-12">Who I Am</h2>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Text */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15, duration: 0.4 }}
          className="space-y-5">
          {data.aboutPara1 && (
            <p className="text-base leading-relaxed" style={{ color: '#888899' }}
              dangerouslySetInnerHTML={{ __html: data.aboutPara1.replace(/\*\*(.*?)\*\*/g, '<span class="text-[#f0f0f5] font-semibold">$1</span>') }} />
          )}
          {data.aboutPara2 && (
            <p className="text-base leading-relaxed" style={{ color: '#888899' }}
              dangerouslySetInnerHTML={{ __html: data.aboutPara2.replace(/\*\*(.*?)\*\*/g, '<span class="text-[#f0f0f5] font-semibold">$1</span>') }} />
          )}
          {data.aboutPara3 && (
            <p className="text-base leading-relaxed" style={{ color: '#888899' }}
              dangerouslySetInnerHTML={{ __html: data.aboutPara3.replace(/\*\*(.*?)\*\*/g, '<span class="text-[#f0f0f5] font-semibold">$1</span>') }} />
          )}
          <div className="pt-4 flex flex-wrap gap-3">
            {tags.map(t => (
              <span key={t} className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)', color: '#6c63ff' }}>
                {t}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map((c, i) => (
            <motion.div key={c.title || i}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08, duration: 0.35 }}
              className="p-5 rounded-2xl card-hover"
              style={{ background: '#14141e', border: '1px solid #2a2a3a' }}>
              <div className="text-2xl mb-3">{c.icon}</div>
              <h4 className="text-sm font-semibold mb-2" style={{ color: '#00d4ff' }}>{c.title}</h4>
              <p className="text-xs leading-relaxed" style={{ color: '#888899' }}>{c.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
