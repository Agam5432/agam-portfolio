import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FolderOpen, Mail, MessageSquare, Plus, User } from 'lucide-react'
import { api, StatCard } from './Shared'

export default function OverviewPage({ token, setTab, setShowForm }) {
  const [stats, setStats] = useState({})

  useEffect(() => {
    api(token).get('/api/admin/stats').then(r => setStats(r.data))
  }, [])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="text-2xl font-black mb-6">Overview</h2>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Projects" value={stats.projects ?? '—'} icon={FolderOpen} color="#6c63ff" />
        <StatCard label="Messages" value={stats.contacts ?? '—'} icon={Mail} color="#00d4ff" />
        <StatCard label="Nexora Chats" value={stats.chats ?? '—'} icon={MessageSquare} color="#10b981" />
      </div>
      <div className="p-6 rounded-2xl" style={{ background: '#14141e', border: '1px solid #2a2a3a' }}>
        <h3 className="text-sm font-bold mb-3" style={{ color: '#888899' }}>Quick Actions</h3>
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => setTab('profile')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #6c63ff, #00d4ff)' }}>
            <User size={14} /> Edit Profile
          </button>
          <button onClick={() => { setTab('projects'); setShowForm && setShowForm(true) }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: '#1a1a24', border: '1px solid #2a2a3a', color: '#f0f0f5' }}>
            <Plus size={14} /> Add Project
          </button>
          <button onClick={() => setTab('contacts')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: '#1a1a24', border: '1px solid #2a2a3a', color: '#f0f0f5' }}>
            <Mail size={14} /> View Messages
          </button>
        </div>
      </div>
    </motion.div>
  )
}