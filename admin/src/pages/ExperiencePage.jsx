import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, X } from 'lucide-react'
import { api, Field, SaveBtn, inputStyle, focusStyle, blurStyle } from './Shared'

function ExpForm({ token, initial, onSave, onCancel }) {
  const blank = { role: '', company: '', period: '', location: '', points: '', tags: '', order: 0 }
  const [form, setForm] = useState(initial ? {
    ...initial,
    points: initial.points?.join('\n') || '',
    tags: initial.tags?.join(', ') || '',
  } : blank)
  const [saving, setSaving] = useState(false)
  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault(); setSaving(true)
    const payload = {
      ...form,
      points: form.points.split('\n').map(p => p.trim()).filter(Boolean),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      order: Number(form.order),
    }
    try {
      if (initial?._id) await api(token).put(`/api/experience/${initial._id}`, payload)
      else await api(token).post('/api/experience', payload)
      onSave()
    } catch { setSaving(false) }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl mb-4" style={{ background: '#14141e', border: '1px solid rgba(108,99,255,0.3)' }}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Role / Position" name="role" value={form.role} onChange={handle} placeholder="Full Stack Developer" />
        <Field label="Company" name="company" value={form.company} onChange={handle} placeholder="Backup Infotech" />
        <Field label="Period" name="period" value={form.period} onChange={handle} placeholder="Jul 2024 – Present" />
        <Field label="Location" name="location" value={form.location} onChange={handle} placeholder="Chandigarh, India" />
        <Field label="Tags (comma separated)" name="tags" value={form.tags} onChange={handle} placeholder="PHP, Node.js, React" />
        <Field label="Order" name="order" value={form.order} onChange={handle} placeholder="1" />
        <div>
          <label className="text-xs mb-1 block" style={{ color: '#888899' }}>Bullet Points (one per line)</label>
          <textarea name="points" value={form.points} onChange={handle} rows={6}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none" style={inputStyle}
            onFocus={focusStyle} onBlur={blurStyle} placeholder="Built 5+ production apps&#10;Integrated payment gateways" />
        </div>
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

export default function ExperiencePage({ token }) {
  const [list, setList] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)

  const load = () => api(token).get('/api/experience').then(r => setList(r.data))
  useEffect(() => { load() }, [])

  const del = async (id) => {
    if (!confirm('Delete this experience?')) return
    await api(token).delete(`/api/experience/${id}`)
    load()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black">Experience</h2>
        <button onClick={() => { setShowForm(true); setEditItem(null) }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #6c63ff, #00d4ff)' }}>
          <Plus size={14} /> Add Experience
        </button>
      </div>
      {showForm && !editItem && <ExpForm token={token} onSave={() => { setShowForm(false); load() }} onCancel={() => setShowForm(false)} />}
      <div className="space-y-3">
        {list.map((exp, i) => (
          <div key={exp._id}>
            {editItem?._id === exp._id && <ExpForm token={token} initial={exp} onSave={() => { setEditItem(null); load() }} onCancel={() => setEditItem(null)} />}
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-center gap-4 p-4 rounded-xl" style={{ background: '#14141e', border: '1px solid #2a2a3a' }}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{exp.role}</p>
                <p className="text-xs mt-0.5" style={{ color: '#00d4ff' }}>{exp.company} · {exp.period}</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => setEditItem(exp)} className="p-1.5 rounded-lg" style={{ color: '#00d4ff' }}><Edit size={14} /></button>
                <button onClick={() => del(exp._id)} className="p-1.5 rounded-lg" style={{ color: '#ef4444' }}><Trash2 size={14} /></button>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}