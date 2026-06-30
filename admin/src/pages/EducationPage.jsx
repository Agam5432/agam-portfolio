import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, X } from 'lucide-react'
import { api, Field, TextArea, Toggle, SaveBtn } from './Shared'

function EduForm({ token, initial, onSave, onCancel }) {
  const blank = { degree: '', uni: '', year: '', icon: '🎓', highlight: false, note: '', order: 0 }
  const [form, setForm] = useState(initial || blank)
  const [saving, setSaving] = useState(false)
  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault(); setSaving(true)
    const payload = { ...form, order: Number(form.order) }
    try {
      if (initial?._id) await api(token).put(`/api/education/${initial._id}`, payload)
      else await api(token).post('/api/education', payload)
      onSave()
    } catch { setSaving(false) }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl mb-4" style={{ background: '#14141e', border: '1px solid rgba(108,99,255,0.3)' }}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Degree" name="degree" value={form.degree} onChange={handle} placeholder="Master of Computer Applications (MCA)" />
        <Field label="University" name="uni" value={form.uni} onChange={handle} placeholder="Chandigarh University" />
        <Field label="Year" name="year" value={form.year} onChange={handle} placeholder="Jul 2022 – Jun 2024" />
        <Field label="Icon (emoji)" name="icon" value={form.icon} onChange={handle} placeholder="🎓" />
        <Field label="Order" name="order" value={form.order} onChange={handle} placeholder="1" />
        <TextArea label="Note (shown in highlight box)" name="note" value={form.note} onChange={handle} rows={3} />
        <Toggle label="Highlight (featured style)" checked={form.highlight} onChange={() => setForm(f => ({ ...f, highlight: !f.highlight }))} />
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

export default function EducationPage({ token }) {
  const [list, setList] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)

  const load = () => api(token).get('/api/education').then(r => setList(r.data))
  useEffect(() => { load() }, [])

  const del = async (id) => {
    if (!confirm('Delete this education entry?')) return
    await api(token).delete(`/api/education/${id}`)
    load()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black">Education</h2>
        <button onClick={() => { setShowForm(true); setEditItem(null) }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #6c63ff, #00d4ff)' }}>
          <Plus size={14} /> Add Education
        </button>
      </div>
      {showForm && !editItem && <EduForm token={token} onSave={() => { setShowForm(false); load() }} onCancel={() => setShowForm(false)} />}
      <div className="space-y-3">
        {list.map((edu, i) => (
          <div key={edu._id}>
            {editItem?._id === edu._id && <EduForm token={token} initial={edu} onSave={() => { setEditItem(null); load() }} onCancel={() => setEditItem(null)} />}
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-center gap-4 p-4 rounded-xl" style={{ background: '#14141e', border: '1px solid #2a2a3a' }}>
              <span className="text-2xl">{edu.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{edu.degree}</p>
                <p className="text-xs mt-0.5" style={{ color: '#00d4ff' }}>{edu.uni} · {edu.year}</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                {edu.highlight && <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(108,99,255,0.1)', color: '#6c63ff', border: '1px solid rgba(108,99,255,0.2)' }}>Featured</span>}
                <button onClick={() => setEditItem(edu)} className="p-1.5 rounded-lg" style={{ color: '#00d4ff' }}><Edit size={14} /></button>
                <button onClick={() => del(edu._id)} className="p-1.5 rounded-lg" style={{ color: '#ef4444' }}><Trash2 size={14} /></button>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}