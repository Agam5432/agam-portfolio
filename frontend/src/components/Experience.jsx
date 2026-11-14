import { motion } from 'framer-motion'
import { Briefcase, Calendar, MapPin, GraduationCap, Mail } from 'lucide-react'
import useApiList from '../lib/useApiList'
import StatusMessage from './StatusMessage'

export default function Experience() {
  const { data: experiences, loading, error, retry } = useApiList('/api/experience')
  const { data: profile } = useApiList('/api/profile', { object: true })
  const { data: skills } = useApiList('/api/skills')
  const { data: education } = useApiList('/api/education')
  const aiChips = skills.filter(g => g.isAI).flatMap(g => g.chips || []).slice(0, 12)

  return (
    <section className="min-h-[calc(100vh-64px)] flex flex-col justify-center px-6 md:px-16 lg:px-24 py-16"
      style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #111118 100%)' }}>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="text-xs font-semibold uppercase tracking-[3px] mb-3" style={{ color: '#6c63ff' }}>Work Experience</p>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-12">Where I've Worked</h2>
      </motion.div>

      <StatusMessage loading={loading} error={error} empty={!loading && !error && experiences.length === 0} label="experience" onRetry={retry} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="space-y-6 lg:col-span-2">
        {!loading && experiences.map((exp, idx) => (
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

      {/* Right column: all values come from the backend */}
      <aside className="space-y-5 lg:sticky lg:top-24">
        {profile && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.4 }}
            className="rounded-2xl p-6" style={{ background: '#14141e', border: '1px solid #2a2a3a' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#00d4ff' }}>At a glance</p>
            {profile.stats?.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                {profile.stats.map(st => (
                  <div key={st.label}>
                    <div className="text-2xl font-black" style={{ color: '#f0f0f5' }}>{st.num}</div>
                    <div className="text-xs" style={{ color: '#888899' }}>{st.label}</div>
                  </div>
                ))}
              </div>
            )}
            {(profile.location || experiences[0]?.location) && (
              <div className="flex items-center gap-2 text-sm pt-4" style={{ color: '#888899', borderTop: '1px solid #2a2a3a' }}>
                <MapPin size={14} /> {profile.location || experiences[0]?.location}
              </div>
            )}
          </motion.div>
        )}

        {aiChips.length > 0 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.4 }}
            className="rounded-2xl p-6" style={{ background: '#14141e', border: '1px solid #2a2a3a' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#6c63ff' }}>Core AI stack</p>
            <div className="flex flex-wrap gap-2">
              {aiChips.map(c => (
                <span key={c} className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.3)', color: '#6c63ff' }}>{c}</span>
              ))}
            </div>
          </motion.div>
        )}

        {education.length > 0 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 0.4 }}
            className="rounded-2xl p-6" style={{ background: '#14141e', border: '1px solid #2a2a3a' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#00d4ff' }}>
              <GraduationCap size={13} className="inline mr-1 -mt-0.5" /> Education
            </p>
            <div className="space-y-3">
              {education.map(e => (
                <div key={e._id || e.degree}>
                  <div className="text-sm font-semibold" style={{ color: '#f0f0f5' }}>{e.degree}</div>
                  <div className="text-xs" style={{ color: '#888899' }}>{e.uni} · {e.year}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {profile?.email && (
          <motion.a href={`mailto:${profile.email}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6, duration: 0.4 }}
            className="flex items-center justify-center gap-2 rounded-2xl p-4 text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #6c63ff, #00d4ff)', color: '#fff' }}>
            <Mail size={15} /> Let's talk
          </motion.a>
        )}
      </aside>
      </div>
    </section>
  )
}
