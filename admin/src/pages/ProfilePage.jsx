import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api, Field, TextArea, SaveBtn, inputStyle, focusStyle, blurStyle } from './Shared'

export default function ProfilePage({ token }) {
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