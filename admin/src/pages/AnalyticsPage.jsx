import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Calendar, Activity, Eye, Download, ArrowRight, Repeat } from 'lucide-react'
import { api } from './Shared'

const card = { background: '#14141e', border: '1px solid #2a2a3a' }
const muted = { color: '#888899' }

function Stat({ label, value, sub, icon: Icon, color, onClick }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl flex flex-col gap-2" style={card}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest" style={muted}>{label}</span>
        <Icon size={16} style={{ color }} />
      </div>
      <div className="text-3xl font-black">{value}</div>
      {sub && <p className="text-xs" style={muted}>{sub}</p>}
      {onClick && (
        <button onClick={onClick} className="flex items-center gap-1.5 text-xs font-semibold self-start mt-1" style={{ color }}>
          View visitors <ArrowRight size={12} />
        </button>
      )}
    </motion.div>
  )
}

// Daily trend: bars = page views, line = unique visitors. Plain SVG, no chart lib.
function TrendChart({ daily }) {
  const W = 760, H = 200, P = { l: 32, r: 8, t: 10, b: 24 }
  const max = Math.max(1, ...daily.map(d => d.views))
  const iw = W - P.l - P.r, ih = H - P.t - P.b
  const bw = iw / daily.length
  const y = v => P.t + ih - (v / max) * ih
  const line = daily.map((d, i) => `${i ? 'L' : 'M'}${P.l + bw * i + bw / 2},${y(d.visitors)}`).join(' ')
  const tickEvery = Math.ceil(daily.length / 8)
  const fmt = s => new Date(s + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Daily page views and unique visitors">
      {[0, 0.5, 1].map(f => (
        <g key={f}>
          <line x1={P.l} x2={W - P.r} y1={y(max * f)} y2={y(max * f)} stroke="#2a2a3a" strokeWidth="1" />
          <text x={P.l - 6} y={y(max * f) + 4} fontSize="10" textAnchor="end" fill="#888899">{Math.round(max * f)}</text>
        </g>
      ))}
      {daily.map((d, i) => (
        <g key={d.date}>
          <rect x={P.l + bw * i + bw * 0.15} width={bw * 0.7} y={y(d.views)} height={Math.max(ih - (y(d.views) - P.t), 0)}
            rx="2" fill="#6c63ff" opacity="0.75">
            <title>{`${fmt(d.date)}: ${d.views} views, ${d.visitors} visitors${d.resume ? `, ${d.resume} resume` : ''}`}</title>
          </rect>
          {i % tickEvery === 0 && (
            <text x={P.l + bw * i + bw / 2} y={H - 6} fontSize="10" textAnchor="middle" fill="#888899">{fmt(d.date)}</text>
          )}
        </g>
      ))}
      <path d={line} fill="none" stroke="#00d4ff" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

function BarList({ title, rows, labelKey, valueKey, empty }) {
  const max = Math.max(1, ...rows.map(r => r[valueKey]))
  return (
    <div className="p-5 rounded-2xl" style={card}>
      <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#6c63ff' }}>{title}</p>
      {rows.length === 0 ? <p className="text-sm" style={muted}>{empty}</p> : (
        <div className="space-y-3">
          {rows.map(r => (
            <div key={r[labelKey]}>
              <div className="flex justify-between text-xs mb-1">
                <span className="truncate pr-2">{r[labelKey]}</span>
                <span style={muted}>{r[valueKey]}</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: '#2a2a3a' }}>
                <div className="h-1.5 rounded-full" style={{ width: `${(r[valueKey] / max) * 100}%`, background: 'linear-gradient(90deg,#6c63ff,#00d4ff)' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AnalyticsPage({ token, setTab, setVisitorFilter }) {
  const [days, setDays] = useState(30)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setData(null); setError('')
    api(token).get('/api/analytics/summary', { params: { days } })
      .then(r => setData(r.data))
      .catch(() => setError('Could not load analytics. The server may be waking up — try again in a few seconds.'))
  }, [token, days])

  const go = f => { setVisitorFilter(f); setTab('visitors') }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black">Analytics</h2>
          <p className="text-xs mt-1" style={muted}>Own visits are excluded: open your site once with <code>?notrack=1</code>. Times are in IST.</p>
        </div>
        <div className="flex gap-1 p-1 rounded-xl" style={card}>
          {[7, 30, 90].map(d => (
            <button key={d} onClick={() => setDays(d)} className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: days === d ? 'rgba(108,99,255,0.2)' : 'transparent', color: days === d ? '#00d4ff' : '#888899' }}>
              {d} days
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>}
      {!data && !error && <p className="text-sm" style={muted}>Loading...</p>}

      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
            <Stat label="Visitors" value={data.range.visitors} icon={Users} color="#6c63ff"
              sub={`${data.range.newVisitors} new · ${data.allTime.visitors} all time`} onClick={() => go('unique')} />
            <Stat label="Today (IST)" value={data.today.visitors} icon={Calendar} color="#00d4ff" onClick={() => go('today')} />
            <Stat label="Sessions" value={data.range.sessions} icon={Activity} color="#10b981" onClick={() => go('sessions')} />
            <Stat label="Page views" value={data.range.views} icon={Eye} color="#f59e0b" onClick={() => go('pageviews')} />
            <Stat label="Resume downloads" value={data.range.resumeDownloads} icon={Download} color="#ec4899"
              sub={`${data.allTime.resumeDownloads} all time`} onClick={() => go('resume')} />
            <Stat label="Returning visitors" value={data.allTime.returning} icon={Repeat} color="#8b5cf6" sub="2+ sessions, all time" onClick={() => go('returning')} />
          </div>

          <div className="p-5 rounded-2xl" style={card}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#6c63ff' }}>Last {days} days</p>
              <div className="flex gap-4 text-xs" style={muted}>
                <span><span style={{ color: '#6c63ff' }}>■</span> Page views</span>
                <span><span style={{ color: '#00d4ff' }}>━</span> Visitors</span>
              </div>
            </div>
            <TrendChart daily={data.daily} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <BarList title="Top pages" rows={data.topPages} labelKey="page" valueKey="views" empty="No page views yet." />
            <BarList title="Where new visitors came from" rows={data.topReferrers} labelKey="source" valueKey="views" empty="No external referrers yet — all traffic is direct." />
            <BarList title="Devices" rows={data.devices} labelKey="name" valueKey="count" empty="No data yet." />
            <BarList title="Browsers" rows={data.browsers} labelKey="name" valueKey="count" empty="No data yet." />
          </div>
        </div>
      )}
    </motion.div>
  )
}
