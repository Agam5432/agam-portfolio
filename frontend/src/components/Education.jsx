import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap } from 'lucide-react'
import axios from 'axios'

const DEFAULT_EDU = [
  { degree: 'Master of Computer Applications (MCA)', uni: 'Chandigarh University', year: 'Jul 2022 – Jun 2024', icon: '🎓', highlight: true, note: 'Computer Applications background gave me a solid foundation in data structures, algorithms, OOP, and system design — which I\'ve applied across every production project.' },
  { degree: 'Bachelor of Computer Applications (BCA)', uni: 'Ch. Charan Singh University', year: 'Jul 2019 – Jun 2022', icon: '📚', highlight: false, note: '' },
]

export default function Education() {
  const [edu, setEdu] = useState(DEFAULT_EDU)

  useEffect(() => {
    axios.get('/api/education')
      .then(r => {
        if (r.data?.length > 0) setEdu(r.data)
      })
      .catch(() => {})
  }, [])

  const highlightNote = edu.find(e => e.highlight && e.note)?.note || DEFAULT_EDU[0].note

  return (
    <section id="education" className="scroll-mt-16 px-6 md:px-12 lg:px-16 py-14 md:py-20" style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #111118 100%)' }}>
      <div className="max-w-7xl mx-auto">

      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.4 }}>
        <p className="text-xs font-semibold uppercase tracking-[3px] mb-3" style={{ color: '#6c63ff' }}>Education</p>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-12">Academic Background</h2>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-5">
        {edu.map((e, i) => (
          <motion.div key={e._id || e.degree}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: 0.15 + i * 0.1, duration: 0.35 }}
            className="p-6 rounded-2xl card-hover"
            style={{
              background: '#14141e',
              border: e.highlight ? '1px solid rgba(108,99,255,0.3)' : '1px solid #2a2a3a',
              boxShadow: e.highlight ? '0 0 20px rgba(108,99,255,0.06)' : 'none'
            }}>
            <div className="text-3xl mb-4">{e.icon || '🎓'}</div>
            <h3 className="text-base font-bold leading-snug mb-2">{e.degree}</h3>
            <p className="text-sm font-semibold mb-2" style={{ color: '#00d4ff' }}>{e.uni}</p>
            <p className="text-xs" style={{ color: '#888899' }}>{e.year}</p>
          </motion.div>
        ))}
      </div>

      {highlightNote && (
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: "-40px" }} transition={{ delay: 0.4 }}
          className="mt-8 p-5 rounded-2xl"
          style={{ background: 'rgba(108,99,255,0.05)', border: '1px solid rgba(108,99,255,0.15)' }}>
          <div className="flex items-start gap-3">
            <GraduationCap size={18} style={{ color: '#6c63ff', marginTop: 2, flexShrink: 0 }} />
            <p className="text-sm leading-relaxed" style={{ color: '#888899' }}>{highlightNote}</p>
          </div>
        </motion.div>
      )}
    </div>
    </section>
  )
}
