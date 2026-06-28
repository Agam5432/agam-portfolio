import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, Github, Linkedin, Send, CheckCircle } from 'lucide-react'
import axios from 'axios'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setStatus('loading')
    try {
      await axios.post(`${BASE}/api/contact`, form)
      setStatus('success')
      setForm({ name: '', email: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="min-h-[calc(100vh-64px)] flex flex-col justify-center px-6 md:px-16 lg:px-24 py-16"
      style={{ background: '#0a0a0f' }}>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="text-xs font-semibold uppercase tracking-[3px] mb-3" style={{ color: '#6c63ff' }}>Contact</p>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-3">Let's Build Something</h2>
        <p className="text-sm mb-12 max-w-lg leading-relaxed" style={{ color: '#888899' }}>
          Open to full-time roles, freelance projects, and collaborations. Drop a message or reach out directly.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-12 max-w-4xl">
        {/* Contact Links */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
          className="space-y-4">
          {[
            { icon: <Mail size={16} />, label: 'agamtyagi2001@gmail.com', href: 'mailto:agamtyagi2001@gmail.com' },
            { icon: <Phone size={16} />, label: '+91 82181 85432', href: 'tel:+918218185432' },
            { icon: <Github size={16} />, label: 'GitHub', href: 'https://github.com' },
            { icon: <Linkedin size={16} />, label: 'LinkedIn', href: 'https://linkedin.com' },
          ].map((item, i) => (
            <motion.a key={item.label} href={item.href} target={item.href.startsWith('http') ? '_blank' : '_self'}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.07 }}
              className="flex items-center gap-3 p-4 rounded-xl transition-all duration-200 card-hover"
              style={{ background: '#14141e', border: '1px solid #2a2a3a', color: '#f0f0f5', textDecoration: 'none' }}>
              <span style={{ color: '#6c63ff' }}>{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </motion.a>
          ))}

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="mt-6 p-4 rounded-xl text-sm leading-relaxed"
            style={{ background: 'rgba(108,99,255,0.06)', border: '1px solid rgba(108,99,255,0.15)', color: '#888899' }}>
            💬 Or just chat with <span style={{ color: '#6c63ff' }}>Nexora</span> (bottom right) — my AI assistant can answer any questions about me instantly!
          </motion.div>
        </motion.div>

        {/* Contact Form */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          {status === 'success' ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-full gap-4 p-8 rounded-2xl text-center"
              style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <CheckCircle size={40} style={{ color: '#10b981' }} />
              <h3 className="text-lg font-bold">Message Sent!</h3>
              <p className="text-sm" style={{ color: '#888899' }}>I'll get back to you soon.</p>
              <button onClick={() => setStatus('idle')} className="btn-outline px-4 py-2 rounded-lg text-sm font-medium mt-2">
                Send Another
              </button>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              {[
                { name: 'name', placeholder: 'Your Name', type: 'text' },
                { name: 'email', placeholder: 'Your Email', type: 'email' },
              ].map(f => (
                <input key={f.name} type={f.type} name={f.name} placeholder={f.placeholder}
                  value={form[f.name]} onChange={handle} required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: '#14141e', border: '1px solid #2a2a3a', color: '#f0f0f5',
                    fontFamily: 'inherit'
                  }}
                  onFocus={e => e.target.style.borderColor = '#6c63ff'}
                  onBlur={e => e.target.style.borderColor = '#2a2a3a'}
                />
              ))}
              <textarea name="message" placeholder="Your Message" value={form.message} onChange={handle}
                required rows={5}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all"
                style={{ background: '#14141e', border: '1px solid #2a2a3a', color: '#f0f0f5', fontFamily: 'inherit' }}
                onFocus={e => e.target.style.borderColor = '#6c63ff'}
                onBlur={e => e.target.style.borderColor = '#2a2a3a'}
              />
              {status === 'error' && (
                <p className="text-xs" style={{ color: '#ef4444' }}>Something went wrong. Please try again.</p>
              )}
              <button type="submit" disabled={status === 'loading'}
                className="btn-primary w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                {status === 'loading' ? 'Sending...' : <><Send size={14} /> Send Message</>}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  )
}
