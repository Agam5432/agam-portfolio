import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { api } from './Shared'

export default function MessagesPage({ token }) {
  const [contacts, setContacts] = useState([])

  const load = () => api(token).get('/api/admin/contacts').then(r => setContacts(r.data))
  useEffect(() => { load() }, [])

  const deleteContact = async (id) => {
    await api(token).delete(`/api/admin/contacts/${id}`)
    load()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="text-2xl font-black mb-6">Messages ({contacts.length})</h2>
      {contacts.length === 0
        ? <p className="text-sm" style={{ color: '#888899' }}>No messages yet.</p>
        : (
          <div className="space-y-3">
            {contacts.map((c, i) => (
              <motion.div key={c._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="p-5 rounded-xl" style={{ background: '#14141e', border: '1px solid #2a2a3a' }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-semibold">{c.name}</p>
                      <p className="text-xs" style={{ color: '#00d4ff' }}>{c.email}</p>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: '#888899' }}>{c.message}</p>
                    <p className="text-xs mt-2" style={{ color: '#d7d7e1' }}>{new Date(c.createdAt).toLocaleString()}</p>
                  </div>
                  <button onClick={() => deleteContact(c._id)} className="p-1.5 rounded-lg shrink-0" style={{ color: '#ef4444' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
    </motion.div>
  )
}