import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import {
  LayoutDashboard, FolderOpen, Mail, MessageSquare,
  LogOut, Plus, Trash2, Edit, Eye, EyeOff, Save, X, BarChart2,
  User, Zap, Briefcase, GraduationCap
} from 'lucide-react'
  const api = (token) => axios.create({
    headers: { Authorization: `Bearer ${token}` }
  })

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'skills', label: 'Skills', icon: Zap },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'contacts', label: 'Messages', icon: Mail },
  { id: 'chats', label: 'Nexora Chats', icon: MessageSquare },
]

const inputStyle = {
  background: '#1a1a24', border: '1px solid #2a2a3a',
  color: '#f0f0f5', fontFamily: 'inherit'
}

const focusStyle = (e) => e.target.style.borderColor = '#6c63ff'
const blurStyle = (e) => e.target.style.borderColor = '#2a2a3a'

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="p-5 rounded-2xl" style={{ background: '#14141e', border: '1px solid #2a2a3a' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#888899' }}>{label}</span>
        <Icon size={16} style={{ color }} />
      </div>
      <div className="text-3xl font-black">{value}</div>
    </div>
  )
}

// ── INPUT HELPERS ─────────────────────────────────────────────
function Field({ label, name, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="text-xs mb-1 block" style={{ color: '#888899' }}>{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle}
        onFocus={focusStyle} onBlur={blurStyle} />
    </div>
  )
}

function TextArea({ label, name, value, onChange, rows = 3 }) {
  return (
    <div>
      <label className="text-xs mb-1 block" style={{ color: '#888899' }}>{label}</label>
      <textarea name={name} value={value} onChange={onChange} rows={rows}
        className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none" style={inputStyle}
        onFocus={focusStyle} onBlur={blurStyle} />
    </div>
  )
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <div onClick={onChange}
        className="w-10 h-5 rounded-full transition-colors relative"
        style={{ background: checked ? '#6c63ff' : '#2a2a3a' }}>
        <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all"
          style={{ left: checked ? '1.375rem' : '0.125rem' }} />
      </div>
      <span style={{ color: '#888899' }} className="capitalize">{label}</span>
    </label>
  )
}

function SaveBtn({ saving }) {
  return (
    <button type="submit" disabled={saving}
      className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white"
      style={{ background: 'linear-gradient(135deg, #6c63ff, #00d4ff)', opacity: saving ? 0.7 : 1 }}>
      <Save size={14} /> {saving ? 'Saving...' : 'Save'}
    </button>
  )
}

// ── PROJECT FORM ──────────────────────────────────────────────
function ProjectForm({ initial, onSave, onCancel, token }) {
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

// ── PROFILE TAB ───────────────────────────────────────────────
function ProfileTab({ token }) {
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api(token).get('/api/profile').then(r => {
      const d = r.data
      setForm({
        ...d,
        stats: d.stats?.map(s => `${s.num}|${s.label}`).join('\n') || '',
        aboutTags: d.aboutTags?.join(', ') || '',
        aboutCards: d.aboutCards?.map(c => `${c.icon}|${c.title}|${c.desc}`).join('\n') || '',
      })
    })
  }, [])

  if (!form) return <p className="text-sm" style={{ color: '#888899' }}>Loading...</p>

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      stats: form.stats.split('\n').filter(Boolean).map(line => {
        const [num, ...rest] = line.split('|')
        return { num: num.trim(), label: rest.join('|').trim() }
      }),
      aboutTags: form.aboutTags.split(',').map(t => t.trim()).filter(Boolean),
      aboutCards: form.aboutCards.split('\n').filter(Boolean).map(line => {
        const [icon, title, ...rest] = line.split('|')
        return { icon: icon.trim(), title: title.trim(), desc: rest.join('|').trim() }
      }),
    }
    try {
      await api(token).put('/api/profile', payload)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally { setSaving(false) }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="text-2xl font-black mb-6">Profile / About</h2>
      <form onSubmit={submit} className="space-y-4 max-w-2xl">

        <div className="p-5 rounded-2xl space-y-3" style={{ background: '#14141e', border: '1px solid #2a2a3a' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#6c63ff' }}>Hero Section</p>
          <Field label="Full Name" name="name" value={form.name || ''} onChange={handle} placeholder="Agam Tyagi" />
          <Field label="Badge Text" name="badge" value={form.badge || ''} onChange={handle} placeholder="Open to Opportunities" />
          <Field label="Title (bold part)" name="title" value={form.title || ''} onChange={handle} placeholder="Full Stack Developer" />
          <Field label="Subtitle" name="subtitle" value={form.subtitle || ''} onChange={handle} placeholder="AI Integration Engineer" />
          <TextArea label="Tagline" name="tagline" value={form.tagline || ''} onChange={handle} rows={2} />
          <Field label="GitHub URL" name="githubUrl" value={form.githubUrl || ''} onChange={handle} placeholder="https://github.com/..." />
          <Field label="LinkedIn URL" name="linkedinUrl" value={form.linkedinUrl || ''} onChange={handle} placeholder="https://linkedin.com/in/..." />
          <Field label="Resume URL" name="resumeUrl" value={form.resumeUrl || ''} onChange={handle} placeholder="/Agam_Tyagi_Resume.pdf" />
          <div>
            <label className="text-xs mb-1 block" style={{ color: '#888899' }}>Stats (one per line: <code>2+|Years Experience</code>)</label>
            <textarea name="stats" value={form.stats || ''} onChange={handle} rows={4}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none font-mono" style={inputStyle}
              onFocus={focusStyle} onBlur={blurStyle} />
          </div>
        </div>

        <div className="p-5 rounded-2xl space-y-3" style={{ background: '#14141e', border: '1px solid #2a2a3a' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#6c63ff' }}>About Section</p>
          <TextArea label="Paragraph 1" name="aboutPara1" value={form.aboutPara1 || ''} onChange={handle} rows={3} />
          <TextArea label="Paragraph 2" name="aboutPara2" value={form.aboutPara2 || ''} onChange={handle} rows={3} />
          <TextArea label="Paragraph 3" name="aboutPara3" value={form.aboutPara3 || ''} onChange={handle} rows={3} />
          <Field label="About Tags (comma separated)" name="aboutTags" value={form.aboutTags || ''} onChange={handle} placeholder="React, Node.js, Python" />
          <div>
            <label className="text-xs mb-1 block" style={{ color: '#888899' }}>About Cards (one per line: <code>🤖|AI/ML Integration|Description here</code>)</label>
            <textarea name="aboutCards" value={form.aboutCards || ''} onChange={handle} rows={4}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none font-mono" style={inputStyle}
              onFocus={focusStyle} onBlur={blurStyle} />
          </div>
          <Field label="Location" name="location" value={form.location || ''} onChange={handle} placeholder="Chandigarh, India" />
        </div>

        <div className="flex items-center gap-3">
          <SaveBtn saving={saving} />
          {saved && <span className="text-sm" style={{ color: '#10b981' }}>✓ Saved!</span>}
        </div>
      </form>
    </motion.div>
  )
}

// ── SKILLS TAB ────────────────────────────────────────────────
function SkillsTab({ token }) {
  const [groups, setGroups] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)

  const load = () => api(token).get('/api/skills').then(r => setGroups(r.data))
  useEffect(() => { load() }, [])

  const SkillForm = ({ initial, onSave, onCancel }) => {
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
      {showForm && !editItem && <SkillForm onSave={() => { setShowForm(false); load() }} onCancel={() => setShowForm(false)} />}
      <div className="space-y-3">
        {groups.map((g, i) => (
          <div key={g._id}>
            {editItem?._id === g._id && <SkillForm initial={g} onSave={() => { setEditItem(null); load() }} onCancel={() => setEditItem(null)} />}
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

// ── EXPERIENCE TAB ────────────────────────────────────────────
function ExperienceTab({ token }) {
  const [list, setList] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)

  const load = () => api(token).get('/api/experience').then(r => setList(r.data))
  useEffect(() => { load() }, [])

  const ExpForm = ({ initial, onSave, onCancel }) => {
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
      {showForm && !editItem && <ExpForm onSave={() => { setShowForm(false); load() }} onCancel={() => setShowForm(false)} />}
      <div className="space-y-3">
        {list.map((exp, i) => (
          <div key={exp._id}>
            {editItem?._id === exp._id && <ExpForm initial={exp} onSave={() => { setEditItem(null); load() }} onCancel={() => setEditItem(null)} />}
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

// ── EDUCATION TAB ─────────────────────────────────────────────
function EducationTab({ token }) {
  const [list, setList] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)

  const load = () => api(token).get('/api/education').then(r => setList(r.data))
  useEffect(() => { load() }, [])

  const EduForm = ({ initial, onSave, onCancel }) => {
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
      {showForm && !editItem && <EduForm onSave={() => { setShowForm(false); load() }} onCancel={() => setShowForm(false)} />}
      <div className="space-y-3">
        {list.map((edu, i) => (
          <div key={edu._id}>
            {editItem?._id === edu._id && <EduForm initial={edu} onSave={() => { setEditItem(null); load() }} onCancel={() => setEditItem(null)} />}
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

// ── MAIN DASHBOARD ────────────────────────────────────────────
export default function Dashboard({ token, logout }) {
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState({})
  const [projects, setProjects] = useState([])
  const [contacts, setContacts] = useState([])
  const [chats, setChats] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editProject, setEditProject] = useState(null)

  const load = async () => {
    try {
      const [s, p, c, ch] = await Promise.all([
        api(token).get('/api/admin/stats'),
        api(token).get('/api/projects'),
        api(token).get('/api/admin/contacts'),
        api(token).get('/api/admin/chats'),
      ])
      setStats(s.data)
      setProjects(p.data)
      setContacts(c.data)
      setChats(ch.data)
    } catch { logout() }
  }

  useEffect(() => { if (['overview', 'projects', 'contacts', 'chats'].includes(tab)) load() }, [tab])

  const deleteProject = async (id) => {
    if (!confirm('Delete this project?')) return
    await api(token).delete(`/api/projects/${id}`)
    load()
  }

  const deleteContact = async (id) => {
    await api(token).delete(`/api/admin/contacts/${id}`)
    load()
  }

  const toggleVisible = async (p) => {
    await api(token).put(`/api/projects/${p._id}`, { ...p, visible: !p.visible })
    load()
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0a0a0f' }}>
      {/* Sidebar */}
      <aside className="w-64 bg-[#111] fixed left-0 top-0 h-screen"
        style={{ background: '#0d0d14', borderRight: '1px solid #2a2a3a' }}>
        <div className="px-2 mb-6">
          <p className="text-lg font-black" style={{ background: 'linear-gradient(90deg,#6c63ff,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Admin</p>
          <p className="text-xs" style={{ color: '#888899' }}>Portfolio Dashboard</p>
        </div>
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
              style={{
                background: tab === t.id ? 'rgba(108,99,255,0.1)' : 'transparent',
                color: tab === t.id ? '#00d4ff' : '#888899',
                border: tab === t.id ? '1px solid rgba(108,99,255,0.2)' : '1px solid transparent'
              }}>
              <Icon size={15} /> {t.label}
            </button>
          )
        })}
        <button onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 mt-10 rounded-xl text-sm font-medium mt-auto"
          style={{ color: '#ef4444', border: '1px solid transparent' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <LogOut size={15} /> Logout
        </button>
      </aside>

      {/* Main */}
      <main className="ml-64 flex-1 overflow-y-auto h-screen">

        {tab === 'overview' && (
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
                <button onClick={() => { setTab('projects'); setShowForm(true) }}
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
        )}

        {tab === 'profile' && <ProfileTab token={token} />}
        {tab === 'skills' && <SkillsTab token={token} />}
        {tab === 'experience' && <ExperienceTab token={token} />}
        {tab === 'education' && <EducationTab token={token} />}

        {tab === 'projects' && (
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
        )}

        {tab === 'contacts' && (
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
                          <p className="text-xs mt-2" style={{ color: '#2a2a3a' }}>{new Date(c.createdAt).toLocaleString()}</p>
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
        )}

        {tab === 'chats' && (
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
        )}
      </main>
    </div>
  )
}
