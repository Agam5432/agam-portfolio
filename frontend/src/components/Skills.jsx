import { motion } from 'framer-motion'
import useApiList from '../lib/useApiList'
import StatusMessage from './StatusMessage'

export default function Skills() {
  const { data: skillGroups, loading, error, retry } = useApiList('/api/skills')

  return (
    <section id="skills" className="scroll-mt-16 px-6 md:px-12 lg:px-16 py-14 md:py-20" style={{ background: '#0a0a0f' }}>
      <div className="max-w-7xl mx-auto">

      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.4 }}>
        <p className="text-xs font-semibold uppercase tracking-[3px] mb-3" style={{ color: '#6c63ff' }}>Technical Skills</p>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">What I Work With</h2>
        <p className="text-sm mb-10" style={{ color: '#888899' }}>
          Generative AI, RAG, agentic systems and the full-stack foundation behind them.
        </p>
      </motion.div>

      <StatusMessage loading={loading} error={error} empty={!loading && !error && skillGroups.length === 0} label="skills" onRetry={retry} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {!loading && skillGroups.map((group, i) => (
          <motion.div key={group.label || i}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
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
    </div>
    </section>
  )
}