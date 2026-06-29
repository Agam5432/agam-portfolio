import { useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { Lock, User } from 'lucide-react'

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await axios.post(`/api/admin/login`, form)
      onLogin(res.data.token)
    } catch {
      setError('Invalid credentials. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(108,99,255,0.12) 0%, transparent 60%), #0a0a0f' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="w-full max-w-sm p-8 rounded-2xl"
        style={{ background: '#14141e', border: '1px solid #2a2a3a' }}>

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #6c63ff, #00d4ff)' }}>
            <Lock size={20} color="white" />
          </div>
          <h1 className="text-xl font-black">Admin Panel</h1>
          <p className="text-xs mt-1" style={{ color: '#888899' }}>Agam Portfolio Dashboard</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="relative">
            <User size={14} className="absolute left-3 top-3.5" style={{ color: '#888899' }} />
            <input type="text" placeholder="Username" value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required
              className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: '#1a1a24', border: '1px solid #2a2a3a', color: '#f0f0f5', fontFamily: 'inherit' }}
              onFocus={e => e.target.style.borderColor = '#6c63ff'}
              onBlur={e => e.target.style.borderColor = '#2a2a3a'}
            />
          </div>
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-3.5" style={{ color: '#888899' }} />
            <input type="password" placeholder="Password" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required
              className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: '#1a1a24', border: '1px solid #2a2a3a', color: '#f0f0f5', fontFamily: 'inherit' }}
              onFocus={e => e.target.style.borderColor = '#6c63ff'}
              onBlur={e => e.target.style.borderColor = '#2a2a3a'}
            />
          </div>
          {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity"
            style={{ background: 'linear-gradient(135deg, #6c63ff, #00d4ff)', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
