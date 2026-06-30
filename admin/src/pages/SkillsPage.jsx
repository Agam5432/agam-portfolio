import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, X } from 'lucide-react'
import { api, Field, Toggle, SaveBtn } from './shared'

function SkillForm({ token, initial, onSave, onCancel }) {
  const blank = { label: '', chips: '', isAI: false, order: 0 }
  const [form, setForm] = useState(initial ? { ...initial, chips: initial.chips?.join(', ') || '' } : blank)
  const [saving, setSaving] = useState(false)
  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault(); setSaving(true)
    const payload = { ...form, chips: form.chips.split(',').map(c => c.trim()).filter(Boolean), order: Number(form.order) }
    try {
      if (initial?._id) await api(token).put(`/api/skills/${initial._id}`, payload)
      else await api(token).post('/api/skills', payload)
      onSave()
    } catch { setSaving(false) }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl mb-4" style={{ background: '#14141e', border: '1px solid rgba(108,99,255,0.3)' }}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Group Label" name="label" value={form.label} onChange={handle} placeholder="Frontend" />
        <Field label="Skills (comma separated)" name="chips" value={form.chips} onChange={handle} placeholder="React, Node.js, Python" />
        <Field label="Order" name="order" value={form.order} onChange={handle} placeholder="1" />
        <Toggle label="AI/ML Group (purple style)" checked={form.isAI} onChange={() => setForm(f => ({ ...f, isAI: !f.isAI }))} />
        <div className="flex gap-3">
          <SaveBtn saving={saving} />
          <button type="button" onClick={onCancel}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold"
            style={{ background: '#1a1a24', border: '1px solid #2a2a3a', color: '#888899' }}>
            <X size={14} /> Cancel
          </button>
        </div>
      </form>
    </motion.div>
  )
}

export default function SkillsPage({ token }) {
  const [groups, setGroups] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)

  const load = () => api(token).get('/api/skills').then(r => setGroups(r.data))
  useEffect(() => { load() }, [])

  const del = async (id) => {
    if (!confirm('Delete this skill group?')) return
    await api(token).delete(`/api/skills/${id}`)
    load()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black">Skills</h2>
        <button onClick={() => { setShowForm(true); setEditItem(null) }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #6c63ff, #00d4ff)' }}>
          <Plus size={14} /> Add Group
        </button>
      </div>
      {showForm && !editItem && <SkillForm token={token} onSave={() => { setShowForm(false); load() }} onCancel={() => setShowForm(false)} />}
      <div className="space-y-3">
        {groups.map((g, i) => (
          <div key={g._id}>
            {editItem?._id === g._id && <SkillForm token={token} initial={g} onSave={() => { setEditItem(null); load() }} onCancel={() => setEditItem(null)} />}
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-center gap-4 p-4 rounded-xl" style={{ background: '#14141e', border: '1px solid #2a2a3a' }}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: g.isAI ? '#6c63ff' : '#00d4ff' }}>{g.label}</p>
                <p className="text-xs mt-0.5 truncate" style={{ color: '#888899' }}>{g.chips?.join(', ')}</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                {g.isAI && <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(108,99,255,0.1)', color: '#6c63ff', border: '1px solid rgba(108,99,255,0.2)' }}>AI</span>}
                <button onClick={() => setEditItem(g)} className="p-1.5 rounded-lg" style={{ color: '#00d4ff' }}><Edit size={14} /></button>
                <button onClick={() => del(g._id)} className="p-1.5 rounded-lg" style={{ color: '#ef4444' }}><Trash2 size={14} /></button>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}