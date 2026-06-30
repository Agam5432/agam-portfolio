import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Eye, EyeOff, X } from 'lucide-react'
import { api, Field, TextArea, Toggle, SaveBtn } from './shared'

function ProjectForm({ token, initial, onSave, onCancel }) {
  const blank = { title: '', description: '', icon: '🚀', tags: '', stack: '', liveUrl: '', githubUrl: '', featured: false, visible: true, order: 0 }
  const [form, setForm] = useState(initial ? {
    ...initial,
    tags: initial.tags?.join(', ') || '',
    stack: initial.stack?.join(', ') || ''
  } : blank)
  const [saving, setSaving] = useState(false)

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const toggle = (key) => setForm(f => ({ ...f, [key]: !f[key] }))

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      stack: form.stack.split(',').map(t => t.trim()).filter(Boolean),
      order: Number(form.order)
    }
    try {
      if (initial?._id) {
        await api(token).put(`/api/projects/${initial._id}`, payload)
      } else {
        await api(token).post('/api/projects', payload)
      }
      onSave()
    } catch { setSaving(false) }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl mb-6" style={{ background: '#14141e', border: '1px solid rgba(108,99,255,0.3)' }}>
      <h3 className="text-base font-bold mb-5">{initial ? 'Edit Project' : 'Add New Project'}</h3>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Title" name="title" value={form.title} onChange={handle} placeholder="Project Name" />
        <Field label="Icon (emoji)" name="icon" value={form.icon} onChange={handle} placeholder="🚀" />
        <Field label="Tags (comma separated)" name="tags" value={form.tags} onChange={handle} placeholder="AI, Web" />
        <Field label="Tech Stack (comma separated)" name="stack" value={form.stack} onChange={handle} placeholder="React, Node.js" />
        <Field label="Live URL" name="liveUrl" value={form.liveUrl} onChange={handle} placeholder="https://..." />
        <Field label="GitHub URL" name="githubUrl" value={form.githubUrl} onChange={handle} placeholder="https://github.com/..." />
        <Field label="Order (number)" name="order" value={form.order} onChange={handle} placeholder="1" />
        <TextArea label="Description" name="description" value={form.description} onChange={handle} />
        <div className="flex gap-4">
          <Toggle label="featured" checked={form.featured} onChange={() => toggle('featured')} />
          <Toggle label="visible" checked={form.visible} onChange={() => toggle('visible')} />
        </div>
        <div className="flex gap-3 pt-2">
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

export default function ProjectsPage({ token }) {
  const [projects, setProjects] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editProject, setEditProject] = useState(null)

  const load = () => api(token).get('/api/projects').then(r => setProjects(r.data))
  useEffect(() => { load() }, [])

  const deleteProject = async (id) => {
    if (!confirm('Delete this project?')) return
    await api(token).delete(`/api/projects/${id}`)
    load()
  }

  const toggleVisible = async (p) => {
    await api(token).put(`/api/projects/${p._id}`, { ...p, visible: !p.visible })
    load()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black">Projects</h2>
        <button onClick={() => { setShowForm(true); setEditProject(null) }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #6c63ff, #00d4ff)' }}>
          <Plus size={14} /> Add Project
        </button>
      </div>
      {(showForm && !editProject) && (
        <ProjectForm token={token} onSave={() => { setShowForm(false); load() }} onCancel={() => setShowForm(false)} />
      )}
      <div className="space-y-3">
        {projects.map((p, i) => (
          <div key={p._id}>
            {editProject?._id === p._id && (
              <ProjectForm token={token} initial={p}
                onSave={() => { setEditProject(null); load() }}
                onCancel={() => setEditProject(null)} />
            )}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-center gap-4 p-4 rounded-xl"
              style={{ background: '#14141e', border: '1px solid #2a2a3a' }}>
              <span className="text-2xl">{p.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{p.title}</p>
                <p className="text-xs mt-0.5 truncate" style={{ color: '#888899' }}>{p.stack?.join(', ')}</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                {p.featured && <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(108,99,255,0.1)', color: '#6c63ff', border: '1px solid rgba(108,99,255,0.2)' }}>Featured</span>}
                <button onClick={() => toggleVisible(p)} title={p.visible ? 'Hide' : 'Show'}
                  className="p-1.5 rounded-lg" style={{ color: '#888899' }}>
                  {p.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button onClick={() => setEditProject(p)} className="p-1.5 rounded-lg" style={{ color: '#00d4ff' }}>
                  <Edit size={14} />
                </button>
                <button onClick={() => deleteProject(p._id)} className="p-1.5 rounded-lg" style={{ color: '#ef4444' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}