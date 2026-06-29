import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'

const DEFAULT_GROUPS = [
  { label: 'Frontend', chips: ['React.js', 'HTML5', 'CSS3', 'Tailwind CSS', 'Bootstrap', 'jQuery', 'AJAX'], isAI: false },
  { label: 'Backend', chips: ['Node.js', 'Express.js', 'PHP', 'Laravel', 'FastAPI', 'REST APIs', 'MVC'], isAI: false },
  { label: 'AI / ML', chips: ['DeepFace', 'MediaPipe', 'OpenCV', 'EasyOCR', 'PaddleOCR', 'LLM Integration', 'Groq', 'Ollama'], isAI: true },
  { label: 'Databases', chips: ['MySQL', 'PostgreSQL', 'MongoDB', 'Prisma ORM', 'Mongoose', 'SQLite'], isAI: false },
  { label: 'Languages', chips: ['JavaScript (ES6+)', 'Python', 'PHP'], isAI: false },
  { label: 'Auth & Security', chips: ['JWT', 'RBAC', 'Session Auth', 'Liveness Detection', 'Anti-Spoofing'], isAI: false },
  { label: 'Payments', chips: ['Razorpay', 'Stripe'], isAI: false },
  { label: 'Tools', chips: ['Git', 'GitHub', 'Postman', 'VS Code', 'Prisma Studio', 'Multer', 'Axios'], isAI: false },
]

export default function Skills() {
  const [skillGroups, setSkillGroups] = useState(DEFAULT_GROUPS)

  useEffect(() => {
    axios.get(`/api/skills`)
      .then(r => {
        if (r.data?.length > 0) setSkillGroups(r.data)
      })
      .catch(() => {})
  }, [])

  return (
    <section className="min-h-[calc(100vh-64px)] flex flex-col justify-center px-6 md:px-16 lg:px-24 py-16"
      style={{ background: '#0a0a0f' }}>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="text-xs font-semibold uppercase tracking-[3px] mb-3" style={{ color: '#6c63ff' }}>Technical Skills</p>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-3">What I Work With</h2>
        <p className="text-sm mb-10" style={{ color: '#888899' }}>
          Across the full stack — web, backend, databases, and real AI/ML systems.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {skillGroups.map((group, i) => (
          <motion.div key={group.label || i}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06, duration: 0.35 }}
            className="p-5 rounded-2xl"
            style={{ background: '#14141e', border: '1px solid #2a2a3a' }}>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4"
              style={{ color: group.isAI ? '#6c63ff' : '#00d4ff' }}>
              {group.label}
            </h4>
            <div className="flex flex-wrap gap-2">
              {(group.chips || []).map(chip => (
                <span key={chip}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-colors duration-150"
                  style={{
                    background: group.isAI ? 'rgba(108,99,255,0.1)' : 'rgba(255,255,255,0.05)',
                    border: group.isAI ? '1px solid rgba(108,99,255,0.3)' : '1px solid #2a2a3a',
                    color: group.isAI ? '#6c63ff' : '#f0f0f5',
                  }}>
                  {chip}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
