import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Monitor, Smartphone, Download, Globe, Clock, BarChart2 } from 'lucide-react'
import { api } from './shared'

export default function VisitorDetailPage({ token, setTab, visitorId }) {
  const [visitor, setVisitor] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!visitorId) return
    api(token).get(`/api/analytics/visitor/${visitorId}`)
      .then(r => setVisitor(r.data))
      .catch(err => console.error('Failed to load visitor detail', err))
      .finally(() => setLoading(false))
  }, [visitorId])

  // No visitorId in URL — go back to visitors table
  if (!visitorId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-sm" style={{ color: '#888899' }}>No visitor selected.</p>
        <button onClick={() => setTab('visitors')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #6c63ff, #00d4ff)', color: '#fff' }}>
          Back to Visitors
        </button>
      </div>
    )
  }

  if (loading) return <p className="text-sm" style={{ color: '#888899' }}>Loading...</p>
  if (!visitor) return <p className="text-sm" style={{ color: '#888899' }}>Visitor not found.</p>

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setTab('visitors')}
          className="p-1.5 rounded-lg" style={{ color: '#888899' }}>
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-2xl font-black">Visitor Detail</h2>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">

        {/* Device Info */}
        <div className="p-5 rounded-2xl space-y-3" style={{ background: '#14141e', border: '1px solid #2a2a3a' }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#6c63ff' }}>Device Info</p>
          <div className="flex items-center gap-2">
            {visitor.device === 'mobile'
              ? <Smartphone size={14} style={{ color: '#00d4ff' }} />
              : <Monitor size={14} style={{ color: '#00d4ff' }} />}
            <span className="text-sm">{visitor.device || 'Desktop'}</span>
          </div>
          <p className="text-xs" style={{ color: '#888899' }}>{visitor.browser || '—'}</p>
          <p className="text-xs" style={{ color: '#888899' }}>OS: {visitor.os || '—'}</p>
        </div>

        {/* Visit Summary */}
        <div className="p-5 rounded-2xl space-y-3" style={{ background: '#14141e', border: '1px solid #2a2a3a' }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#6c63ff' }}>Summary</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-2xl font-black">{visitor.visitCount ?? 0}</p>
              <p className="text-xs" style={{ color: '#888899' }}>Total Page Views</p>
            </div>
            <div>
              <p className="text-2xl font-black">{visitor.sessionCount ?? 0}</p>
              <p className="text-xs" style={{ color: '#888899' }}>Sessions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Download size={12} style={{ color: visitor.resumeDownloaded ? '#10b981' : '#888899' }} />
            <span className="text-xs" style={{ color: visitor.resumeDownloaded ? '#10b981' : '#888899' }}>
              Resume {visitor.resumeDownloaded ? 'Downloaded' : 'Not Downloaded'}
            </span>
          </div>
        </div>

        {/* Referrer & Source */}
        <div className="p-5 rounded-2xl space-y-3" style={{ background: '#14141e', border: '1px solid #2a2a3a' }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#6c63ff' }}>Source</p>
          <div className="flex items-center gap-2">
            <Globe size={13} style={{ color: '#00d4ff' }} />
            <span className="text-sm truncate">{visitor.referrer || 'Direct'}</span>
          </div>
          <p className="text-xs" style={{ color: '#888899' }}>Last Page: {visitor.currentPage || '—'}</p>
        </div>

        {/* Timestamps */}
        <div className="p-5 rounded-2xl space-y-3" style={{ background: '#14141e', border: '1px solid #2a2a3a' }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#6c63ff' }}>Timestamps</p>
          <div className="flex items-start gap-2">
            <Clock size={13} style={{ color: '#00d4ff' }} className="mt-0.5 shrink-0" />
            <div>
              <p className="text-xs" style={{ color: '#888899' }}>First Visit</p>
              <p className="text-sm">{visitor.firstVisit ? new Date(visitor.firstVisit).toLocaleString() : '—'}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock size={13} style={{ color: '#6c63ff' }} className="mt-0.5 shrink-0" />
            <div>
              <p className="text-xs" style={{ color: '#888899' }}>Last Visit</p>
              <p className="text-sm">{visitor.lastVisit ? new Date(visitor.lastVisit).toLocaleString() : '—'}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Page History */}
      <div className="p-5 rounded-2xl" style={{ background: '#14141e', border: '1px solid #2a2a3a' }}>
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 size={15} style={{ color: '#6c63ff' }} />
          <p className="text-sm font-bold uppercase tracking-widest" style={{ color: '#6c63ff' }}>Page History</p>
        </div>

        {!visitor.pages || visitor.pages.length === 0
          ? <p className="text-sm" style={{ color: '#888899' }}>No page history yet.</p>
          : (
            <div className="space-y-2">
              {/* Sort by count descending */}
              {[...visitor.pages]
                .sort((a, b) => b.count - a.count)
                .map((p, i) => (
                  <motion.div key={p.page}
                    initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-4 p-3 rounded-xl"
                    style={{ background: '#0d0d14', border: '1px solid #2a2a3a' }}>

                    {/* Page name */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: '#00d4ff' }}>{p.page}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#888899' }}>
                        First: {new Date(p.firstVisit).toLocaleString()}
                      </p>
                      <p className="text-xs" style={{ color: '#888899' }}>
                        Last: {new Date(p.lastVisit).toLocaleString()}
                      </p>
                    </div>

                    {/* Visit count badge */}
                    <div className="shrink-0 text-center">
                      <p className="text-xl font-black">{p.count}</p>
                      <p className="text-xs" style={{ color: '#888899' }}>visits</p>
                    </div>

                    {/* Visual bar */}
                    <div className="w-24 shrink-0">
                      <div className="h-1.5 rounded-full" style={{ background: '#2a2a3a' }}>
                        <div className="h-1.5 rounded-full"
                          style={{
                            background: 'linear-gradient(90deg, #6c63ff, #00d4ff)',
                            width: `${Math.min((p.count / visitor.visitCount) * 100, 100)}%`
                          }} />
                      </div>
                    </div>

                  </motion.div>
                ))}
            </div>
          )}
      </div>

    </motion.div>
  )
}