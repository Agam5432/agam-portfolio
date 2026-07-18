import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Monitor, Smartphone, Download } from 'lucide-react'
import { api } from './Shared'

const FILTER_LABELS = {
  unique: 'Unique Visitors',
  today: "Today's Visitors",
  sessions: 'By Total Sessions',
  pageviews: 'By Page Views',
  resume: 'Resume Downloads',
}

// ✅ ALL FILTERS HANDLE HERE
function applyFilter(visitors, filterType) {

  switch (filterType) {

    // ✅ ONLY TODAY VISITORS
    case 'today': {
      const today = new Date().toDateString()

      return visitors.filter(v => {
        if (!v.lastVisit) return false

        return new Date(v.lastVisit).toDateString() === today
      })
    }

    // ✅ SORT BY HIGHEST SESSIONS
    case 'sessions':
      return [...visitors]
        .filter(v => (v.sessionCount || 0) > 0)
        .sort((a, b) => (b.sessionCount || 0) - (a.sessionCount || 0))

    // ✅ SORT BY PAGE VIEWS
    case 'pageviews':
      return [...visitors]
        .filter(v => (v.visitCount || 0) > 0)
        .sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0))

    // ✅ ONLY RESUME DOWNLOAD USERS
    case 'resume':
      return visitors.filter(v => Boolean(v.resumeDownloaded))

    // ✅ DEFAULT = ALL UNIQUE USERS
    case 'unique':
    default:
      return visitors
  }
}

export default function VisitorsPage({
  token,
  setTab,
  visitorFilter,
  setVisitorId
}) {

  const [visitors, setVisitors] = useState([])
  const [loading, setLoading] = useState(true)

  // ✅ FETCH ALL VISITORS
  useEffect(() => {

    setLoading(true)

    api(token)
      .get('/api/analytics/all')

      .then(r => {
        setVisitors(r.data || [])
      })

      .catch(err => {
        console.error('Failed to load visitors', err)
      })

      .finally(() => {
        setLoading(false)
      })

  }, [token])

  // ✅ APPLY FILTER
  const filtered = applyFilter(visitors, visitorFilter)

  // ✅ DEBUGGING
  console.log('ACTIVE FILTER:', visitorFilter)
  console.log('FILTERED DATA:', filtered)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">

        <button
          onClick={() => setTab('analytics')}
          className="p-1.5 rounded-lg"
          style={{ color: '#888899' }}
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <h2 className="text-2xl font-black">
            {FILTER_LABELS[visitorFilter] || 'Visitors'} ({filtered.length})
          </h2>
        </div>

      </div>

      {/* LOADING */}
      {loading ? (

        <p
          className="text-sm"
          style={{ color: '#888899' }}
        >
          Loading...
        </p>

      ) : filtered.length === 0 ? (

        <p
          className="text-sm"
          style={{ color: '#888899' }}
        >
          No visitor data for this view.
        </p>

      ) : (

        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: '#14141e',
            border: '1px solid #2a2a3a'
          }}
        >

          <table className="w-full text-sm">

            {/* TABLE HEAD */}
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a3a' }}>

                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#888899' }}>
                  Device / OS
                </th>

                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#888899' }}>
                  Browser
                </th>

                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#888899' }}>
                  Current Page
                </th>

                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#888899' }}>
                  Referrer
                </th>

                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#888899' }}>
                  Visits
                </th>

                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#888899' }}>
                  Sessions
                </th>

                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#888899' }}>
                  Resume
                </th>

                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#888899' }}>
                  Last Visit
                </th>

              </tr>
            </thead>

            {/* TABLE BODY */}
            <tbody>

              {filtered.map((v, i) => (

                <motion.tr
                  key={v._id}

                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}

                  transition={{ delay: i * 0.02 }}

                  onClick={() => setVisitorId(v.visitorId)}

                  style={{
                    borderBottom: '1px solid #2a2a3a',
                    cursor: 'pointer'
                  }}

                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(108,99,255,0.05)'
                  }}

                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent'
                  }}

                  title="Click to view detail"
                >

                  {/* DEVICE */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">

                      {v.device === 'mobile'
                        ? (
                          <Smartphone
                            size={14}
                            style={{ color: '#00d4ff' }}
                          />
                        )
                        : (
                          <Monitor
                            size={14}
                            style={{ color: '#00d4ff' }}
                          />
                        )
                      }

                      <span>
                        {v.device || '—'} · {v.os || '—'}
                      </span>

                    </div>
                  </td>

                  {/* BROWSER */}
                  <td
                    className="px-4 py-3"
                    style={{ color: '#888899' }}
                  >
                    {v.browser || '—'}
                  </td>

                  {/* PAGE */}
                  <td
                    className="px-4 py-3 truncate max-w-[160px]"
                    style={{ color: '#888899' }}
                  >
                    {v.currentPage || '—'}
                  </td>

                  {/* REFERRER */}
                  <td
                    className="px-4 py-3 truncate max-w-[160px]"
                    style={{ color: '#888899' }}
                  >
                    {v.referrer || 'Direct'}
                  </td>

                  {/* VISITS */}
                  <td className="px-4 py-3">
                    {v.visitCount ?? 0}
                  </td>

                  {/* SESSIONS */}
                  <td className="px-4 py-3">
                    {v.sessionCount ?? 0}
                  </td>

                  {/* RESUME */}
                  <td className="px-4 py-3">

                    {v.resumeDownloaded ? (

                      <span
                        className="flex items-center gap-1"
                        style={{ color: '#10b981' }}
                      >
                        <Download size={12} />
                        Yes
                      </span>

                    ) : (

                      <span style={{ color: '#888899' }}>
                        No
                      </span>

                    )}

                  </td>

                  {/* LAST VISIT */}
                  <td
                    className="px-4 py-3"
                    style={{ color: '#d0d0d7' }}
                  >
                    {v.lastVisit
                      ? new Date(v.lastVisit).toLocaleString()
                      : '—'}
                  </td>

                </motion.tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </motion.div>
  )
}