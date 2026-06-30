import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Calendar, Activity, Eye, Download, ArrowRight } from 'lucide-react'
import { api } from './shared'

function AnalyticsCard({ label, value, icon: Icon, color, onViewDetail, delay }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="p-5 rounded-2xl flex flex-col gap-4"
      style={{ background: '#14141e', border: '1px solid #2a2a3a' }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#888899' }}>{label}</span>
        <Icon size={16} style={{ color }} />
      </div>
      <div className="text-3xl font-black">{value}</div>
      {onViewDetail && (
        <button onClick={onViewDetail}
          className="flex items-center gap-1.5 text-xs font-semibold mt-1 self-start"
          style={{ color }}>
          View Detail <ArrowRight size={12} />
        </button>
      )}
    </motion.div>
  )
}

export default function AnalyticsPage({ token, setTab, setVisitorFilter }) {
  const [data, setData] = useState({
    uniqueVisitors: '—',
    todayVisitors: '—',
    totalSessions: '—',
    totalPageViews: '—',
    resumeDownloads: '—',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [unique, today, sessions, views, resume] = await Promise.all([
          api(token).get('/api/analytics/unique-visitors'),
          api(token).get('/api/analytics/today-visitors'),
          api(token).get('/api/analytics/total-sessions'),
          api(token).get('/api/analytics/page-views'),
          api(token).get('/api/analytics/resume-downloads'),
        ])
        setData({
          uniqueVisitors: unique.data.uniqueVisitors,
          todayVisitors: today.data.todayVisitors,
          totalSessions: sessions.data.totalSessions,
          totalPageViews: views.data.totalPageViews,
          resumeDownloads: resume.data.resumeDownloads,
        })
      } catch (err) {
        console.error('Failed to load analytics', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [token])

  // each card sends visitors to a DIFFERENT filtered view
  const goToVisitors = (filterType) => {
    setVisitorFilter(filterType)
    setTab('visitors')
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="text-2xl font-black mb-6">Analytics</h2>
      {loading
        ? <p className="text-sm" style={{ color: '#888899' }}>Loading...</p>
        : (
          <div className="grid grid-cols-3 gap-4">
            <AnalyticsCard label="Unique Visitors" value={data.uniqueVisitors} icon={Users} color="#6c63ff"
              onViewDetail={() => goToVisitors('unique')} delay={0} />
            <AnalyticsCard label="Today's Visitors" value={data.todayVisitors} icon={Calendar} color="#00d4ff"
              onViewDetail={() => goToVisitors('today')} delay={0.04} />
            <AnalyticsCard label="Total Sessions" value={data.totalSessions} icon={Activity} color="#10b981"
              onViewDetail={() => goToVisitors('sessions')} delay={0.08} />
            <AnalyticsCard label="Page Views" value={data.totalPageViews} icon={Eye} color="#f59e0b"
              onViewDetail={() => goToVisitors('pageviews')} delay={0.12} />
            <AnalyticsCard label="Resume Downloads" value={data.resumeDownloads} icon={Download} color="#ef4444"
              onViewDetail={() => goToVisitors('resume')} delay={0.16} />
          </div>
        )}
    </motion.div>
  )
}