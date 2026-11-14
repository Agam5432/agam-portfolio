import { useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Github } from 'lucide-react'
import useApiList from '../lib/useApiList'
import StatusMessage from './StatusMessage'


const tagColors = {
  AI: { bg: 'rgba(108,99,255,0.12)', border: 'rgba(108,99,255,0.3)', color: '#6c63ff' },
  LLM: { bg: 'rgba(108,99,255,0.12)', border: 'rgba(108,99,255,0.3)', color: '#6c63ff' },
  Vision: { bg: 'rgba(108,99,255,0.12)', border: 'rgba(108,99,255,0.3)', color: '#6c63ff' },
  OCR: { bg: 'rgba(108,99,255,0.12)', border: 'rgba(108,99,255,0.3)', color: '#6c63ff' },
  Parser: { bg: 'rgba(108,99,255,0.12)', border: 'rgba(108,99,255,0.3)', color: '#6c63ff' },
  default: { bg: 'rgba(0,212,255,0.08)', border: 'rgba(0,212,255,0.2)', color: '#00d4ff' },
}

function getTagStyle(tag) {
  return tagColors[tag] || tagColors.default
}

function ProjectCard({ project, i }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + i * 0.06, duration: 0.35 }}
      className="p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden card-hover"
      style={{ background: '#14141e', border: '1px solid #2a2a3a' }}>

      {/* Subtle top glow for featured */}
      {project.featured && (
        <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(108,99,255,0.08) 0%, transparent 70%)' }} />
      )}

      <div className="flex items-start justify-between gap-2">
        <span className="text-3xl">{project.icon}</span>
        <div className="flex flex-wrap gap-1 justify-end">
          {project.tags?.map(tag => {
            const s = getTagStyle(tag)
            return (
              <span key={tag} className="px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
                {tag}
              </span>
            )
          })}
        </div>
      </div>

      <div>
        <h3 className="text-base font-bold leading-snug mb-1">{project.title}</h3>
        {project.period && <p className="text-xs mb-2" style={{ color: '#6c63ff' }}>{project.period}</p>}
        <p className="text-xs leading-relaxed" style={{ color: '#888899' }}>{project.description}</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {project.stack?.map(s => (
          <span key={s} className="px-2 py-0.5 rounded text-xs"
            style={{ background: '#1a1a24', border: '1px solid #2a2a3a', color: '#888899' }}>
            {s}
          </span>
        ))}
      </div>

      <div className="flex gap-2 mt-auto pt-2">
        {project.liveUrl ? (
          <a href={project.liveUrl} target="_blank" rel="noreferrer"
            className="btn-primary flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold">
            <ExternalLink size={12} /> Live Demo
          </a>
        ) : (
          <span className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold"
            style={{ background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)', color: '#6c63ff' }}>
            <ExternalLink size={12} /> Demo Coming
          </span>
        )}
        {project.githubUrl && (
          <a href={project.githubUrl} target="_blank" rel="noreferrer"
            className="btn-outline flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold">
            <Github size={12} /> GitHub
          </a>
        )}
      </div>
    </motion.div>
  )
}

export default function Projects() {
  const { data: projects, loading, error, retry } = useApiList('/api/projects')
  const [showAll, setShowAll] = useState(false)

  const featured = projects.filter(p => p.featured)
  const rest = projects.filter(p => !p.featured)
  const visible = showAll ? projects : featured

  return (
    <section className="min-h-[calc(100vh-64px)] flex flex-col justify-center px-6 md:px-16 lg:px-24 py-16"
      style={{ background: '#0a0a0f' }}>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="text-xs font-semibold uppercase tracking-[3px] mb-3" style={{ color: '#6c63ff' }}>Projects</p>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-3">What I've Built</h2>
        <p className="text-sm mb-10" style={{ color: '#888899' }}>
          Production-grade apps, real AI systems, and full-stack platforms.
        </p>
      </motion.div>

      {loading || error || projects.length === 0 ? (
        <StatusMessage loading={loading} error={error} empty={!loading && !error} label="projects" onRetry={retry} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {visible.map((p, i) => <ProjectCard key={p._id} project={p} i={i} />)}
          </div>

          {rest.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="mt-8 flex justify-center">
              <button onClick={() => setShowAll(!showAll)}
                className="btn-outline px-6 py-3 rounded-xl text-sm font-semibold">
                {showAll ? 'Show Less ↑' : `Show All Projects (${projects.length}) ↓`}
              </button>
            </motion.div>
          )}
        </>
      )}
    </section>
  )
}
