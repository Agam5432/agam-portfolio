import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Download, ArrowRight, Github, Linkedin } from 'lucide-react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const DEFAULTS = {
  name: 'Agam Tyagi',
  title: 'Full Stack Developer',
  subtitle: 'AI Integration Engineer',
  tagline: 'Building production-grade web apps with real AI — computer vision, LLMs, and everything in between.',
  badge: 'Open to Opportunities',
  githubUrl: 'https://github.com/Agam5432',
  linkedinUrl: 'https://www.linkedin.com/in/agam-tyagi-6624a7204',
  resumeUrl: '/Agam_Tyagi_Resume.pdf',
  stats: [
    { num: '2+', label: 'Years Experience' },
    { num: '5+', label: 'Production Apps' },
    { num: '10+', label: 'REST APIs Built' },
    { num: '8+', label: 'Projects' },
  ],
}

export default function Hero({ goTo }) {
  const [data, setData] = useState(DEFAULTS)

  useEffect(() => {
    axios.get(`${API}/api/profile`)
      .then(r => setData({ ...DEFAULTS, ...r.data }))
      .catch(() => {}) // silently use defaults
  }, [])

  const nameParts = data.name.split(' ')
  const firstName = nameParts[0]
  const lastName = nameParts.slice(1).join(' ')

  return (
    <section className="min-h-[calc(100vh-64px)] flex flex-col justify-center px-6 md:px-16 lg:px-24 py-16 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(108,99,255,0.10) 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(0,212,255,0.06) 0%, transparent 70%)', transform: 'translate(-20%, 20%)' }} />

      {/* Badge */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium w-fit mb-6"
        style={{ background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.25)', color: '#6c63ff' }}>
        <span className="w-2 h-2 rounded-full bg-[#6c63ff] pulse-dot" />
        {data.badge}
      </motion.div>

      {/* Name */}
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
        className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none mb-4">
        {firstName} <span className="gradient-text">{lastName}</span>
      </motion.h1>

      {/* Title */}
      <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="text-xl md:text-2xl font-light mb-4" style={{ color: '#888899' }}>
        <span className="text-[#f0f0f5] font-semibold">{data.title}</span>{data.subtitle ? ` & ${data.subtitle}` : ''}
      </motion.p>

      {/* Description */}
      <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
        className="text-base md:text-lg max-w-xl mb-10 leading-relaxed" style={{ color: '#888899' }}>
        {data.tagline}
      </motion.p>

      {/* Buttons */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.39 }}
        className="flex flex-wrap gap-3 mb-16">
        <button onClick={() => goTo('projects')}
          className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold">
          View Projects <ArrowRight size={16} />
        </button>
        <button onClick={() => goTo('contact')}
          className="btn-outline flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold">
          Let's Talk
        </button>
        <a href={data.resumeUrl} download
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

      {/* Social links */}
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
    </section>
  )
}
