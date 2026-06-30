import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from './Shared'

export default function ChatsPage({ token }) {
  const [chats, setChats] = useState([])

  useEffect(() => {
    api(token).get('/api/admin/chats').then(r => setChats(r.data))
  }, [])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="text-2xl font-black mb-6">Nexora Chat Logs ({chats.length})</h2>
      {chats.length === 0
        ? <p className="text-sm" style={{ color: '#888899' }}>No chats yet.</p>
        : (
          <div className="space-y-3">
            {chats.map((c, i) => (
              <motion.div key={c._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="p-4 rounded-xl" style={{ background: '#14141e', border: '1px solid #2a2a3a' }}>
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)' }}>User</span>
                  <p className="text-sm" style={{ color: '#f0f0f5' }}>{c.userMessage}</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(108,99,255,0.1)', color: '#6c63ff', border: '1px solid rgba(108,99,255,0.2)' }}>Nexora</span>
                  <p className="text-sm" style={{ color: '#888899' }}>{c.botReply}</p>
                </div>
                <p className="text-xs mt-2" style={{ color: '#2a2a3a' }}>{new Date(c.createdAt).toLocaleString()}</p>
              </motion.div>
            ))}
          </div>
        )}
    </motion.div>
  )
}