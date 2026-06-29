import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, Calendar } from 'lucide-react'
import axios from 'axios'

const DEFAULT_EXP = [
  {
    _id: 'default',
    role: 'Full Stack Developer',
    company: 'Backup Infotech',
    period: 'Jul 2024 – Present',
    location: 'Chandigarh, India',
    points: [
      'Designed and deployed 5+ production-grade full-stack web applications using PHP, Laravel, Node.js, Express.js & MySQL',
      'Built and documented 10+ RESTful APIs consumed by web and mobile clients with full authentication',
      'Integrated Razorpay & Stripe payment gateways with webhook handling across multiple platforms',
      'Implemented JWT-based authentication with RBAC and granular permission handling',
      'Optimised complex SQL queries, indexing strategies & maintained Git-based team workflows',
      'Covered diverse industry domains: e-commerce, examination systems, multi-role platforms',
    ],
    tags: ['PHP', 'Laravel', 'Node.js', 'Express.js', 'MySQL', 'JWT', 'RBAC', 'Razorpay', 'Stripe', 'REST APIs'],
  }
]

export default function Experience() {
  const [experiences, setExperiences] = useState(DEFAULT_EXP)

  useEffect(() => {
    axios.get(`/api/experience`)
      .then(r => {
        if (r.data?.length > 0) setExperiences(r.data)
      })
      .catch(() => {})
  }, [])

  return (
    <section className="min-h-[calc(100vh-64px)] flex flex-col justify-center px-6 md:px-16 lg:px-24 py-16"
      style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #111118 100%)' }}>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="text-xs font-semibold uppercase tracking-[3px] mb-3" style={{ color: '#6c63ff' }}>Work Experience</p>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-12">Where I've Worked</h2>
      </motion.div>

      <div className="space-y-6 max-w-3xl">
        {experiences.map((exp, idx) => (
          <motion.div key={exp._id || idx}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + idx * 0.1, duration: 0.4 }}
            className="rounded-2xl p-8 relative"
            style={{ background: '#14141e', border: '1px solid #2a2a3a', borderLeft: '3px solid #6c63ff' }}>

            {/* Glow */}
            <div className="absolute top-0 left-0 w-32 h-32 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(108,99,255,0.06) 0%, transparent 70%)' }} />

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase size={16} style={{ color: '#6c63ff' }} />
                  <h3 className="text-xl font-bold">{exp.role}</h3>
                </div>
                <p className="text-sm font-semibold" style={{ color: '#00d4ff' }}>{exp.company}</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium w-fit"
                style={{ background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)', color: '#888899' }}>
                <Calendar size={12} />
                {exp.period}
              </div>
            </div>

            <div className="space-y-4">
              {(exp.points || []).map((p, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.07 }}
                  className="flex items-start gap-3 text-sm leading-relaxed"
                  style={{ color: '#888899' }}>
                  <span className="mt-1 shrink-0 text-[#6c63ff]">▸</span>
                  <span>{p}</span>
                </motion.div>
              ))}
            </div>

            {exp.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8 pt-6" style={{ borderTop: '1px solid #2a2a3a' }}>
                {exp.tags.map(t => (
                  <span key={t} className="px-3 py-1 rounded-full text-xs"
                    style={{ background: '#1a1a24', border: '1px solid #2a2a3a', color: '#888899' }}>
                    {t}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {experiences[0]?.location && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-8 text-sm" style={{ color: '#888899' }}>
          📍 {experiences[0].location} &nbsp;·&nbsp; Building and shipping every day.
        </motion.p>
      )}
    </section>
  )
}
