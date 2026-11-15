import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Monitor, Smartphone, Tablet, Download } from 'lucide-react'
import { api } from './Shared'

const LABELS = {
  unique: 'All visitors',
  today: "Today's visitors",
  sessions: 'Most sessions',
  pageviews: 'Most page views',
  resume: 'Resume downloads',
  returning: 'Returning visitors',
}

const DeviceIcon = ({ device }) => {
  const I = device === 'mobile' ? Smartphone : device === 'tablet' ? Tablet : Monitor
  return <I size={14} style={{ color: '#00d4ff' }} />
}

export default function VisitorsPage({ token, setTab, visitorFilter, setVisitorId }) {
  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState({ total: 0, pages: 1 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { setPage(1) }, [visitorFilter])

  useEffect(() => {
    setLoading(true); setError('')
    api(token).get('/api/analytics/visitors', { params: { filter: visitorFilter, page, limit: 25 } })
      .then(r => { setRows(r.data.items); setMeta({ total: r.data.total, pages: r.data.pages }) })
      .catch(() => setError('Could not load visitors.'))
      .finally(() => setLoading(false))
  }, [token, visitorFilter, page])

  const th = 'text-left px-4 py-3 font-semibold'
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setTab('analytics')} className="p-1.5 rounded-lg" style={{ color: '#888899' }}>
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-2xl font-black">{LABELS[visitorFilter] || 'Visitors'} ({meta.total})</h2>
      </div>

      {error && <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>}
      {loading ? <p className="text-sm" style={{ color: '#888899' }}>Loading...</p>
        : rows.length === 0 ? <p className="text-sm" style={{ color: '#888899' }}>No visitors for this view yet.</p>
        : (
          <>
            <div className="rounded-2xl overflow-x-auto" style={{ background: '#14141e', border: '1px solid #2a2a3a' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid #2a2a3a', color: '#888899' }}>
                    <th className={th}>Device / OS</th><th className={th}>Browser</th><th className={th}>Last page</th>
                    <th className={th}>Source</th><th className={th}>Views</th><th className={th}>Sessions</th>
                    <th className={th}>Resume</th><th className={th}>Last visit</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(v => (
                    <tr key={v.visitorId} onClick={() => setVisitorId(v.visitorId)} title="Click to view detail"
                      style={{ borderBottom: '1px solid #2a2a3a', cursor: 'pointer' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(108,99,255,0.05)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td className="px-4 py-3"><span className="flex items-center gap-2"><DeviceIcon device={v.device} />{v.device} · {v.os || '—'}</span></td>
                      <td className="px-4 py-3" style={{ color: '#888899' }}>{v.browser || '—'}</td>
                      <td className="px-4 py-3 truncate max-w-[140px]" style={{ color: '#888899' }}>{v.currentPage || '—'}</td>
                      <td className="px-4 py-3 truncate max-w-[140px]" style={{ color: '#888899' }}>{v.referrer || 'Direct'}</td>
                      <td className="px-4 py-3">{v.visitCount ?? 0}</td>
                      <td className="px-4 py-3">{v.sessionCount ?? 0}</td>
                      <td className="px-4 py-3">
                        {v.resumeDownloads > 0
                          ? <span className="flex items-center gap-1" style={{ color: '#10b981' }}><Download size={12} />{v.resumeDownloads}</span>
                          : <span style={{ color: '#888899' }}>—</span>}
                      </td>
                      <td className="px-4 py-3" style={{ color: '#d0d0d7' }}>{v.lastVisit ? new Date(v.lastVisit).toLocaleString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {meta.pages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-4 text-sm">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg disabled:opacity-40" style={{ border: '1px solid #2a2a3a' }}>Prev</button>
                <span style={{ color: '#888899' }}>Page {page} / {meta.pages}</span>
                <button disabled={page >= meta.pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg disabled:opacity-40" style={{ border: '1px solid #2a2a3a' }}>Next</button>
              </div>
            )}
          </>
        )}
    </motion.div>
  )
}
