import { useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { Lock, User, KeyRound, Mail } from 'lucide-react'

const inputStyle = { background: '#1a1a24', border: '1px solid #2a2a3a', color: '#f0f0f5', fontFamily: 'inherit' }
const focusOn = e => (e.target.style.borderColor = '#6c63ff')
const focusOff = e => (e.target.style.borderColor = '#2a2a3a')

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login') // 'login' | 'forgot' | 'reset'
  const [form, setForm] = useState({ username: '', password: '' })
  const [reset, setReset] = useState({ code: '', newPassword: '', confirm: '' })
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const go = (m) => { setMode(m); setError(''); setInfo('') }

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

  const sendCode = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await axios.post(`/api/admin/forgot-password`)
      setMode('reset')
      setInfo('A 6-digit code was sent to the admin email. It is valid for 10 minutes.')
    } catch (err) {
      setError(err.response?.data?.error || 'Could not send the code. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (e) => {
    e.preventDefault()
    setError('')
    if (reset.newPassword !== reset.confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await axios.post(`/api/admin/reset-password`, {
        code: reset.code.trim(),
        newPassword: reset.newPassword,
      })
      setReset({ code: '', newPassword: '', confirm: '' })
      setForm({ username: form.username, password: '' })
      setMode('login')
      setInfo('Password updated. Log in with your new password.')
    } catch (err) {
      setError(err.response?.data?.error || 'Could not reset the password. Try again.')
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
          <h1 className="text-xl font-black">
            {mode === 'login' ? 'Admin Panel' : mode === 'forgot' ? 'Forgot Password' : 'Reset Password'}
          </h1>
          <p className="text-xs mt-1" style={{ color: '#888899' }}>Agam Portfolio Dashboard</p>
        </div>

        {mode === 'login' && (
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
          {info && <p className="text-xs" style={{ color: '#10b981' }}>{info}</p>}
          {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity"
            style={{ background: 'linear-gradient(135deg, #6c63ff, #00d4ff)', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <button type="button" onClick={() => go('forgot')}
            className="w-full text-xs text-center" style={{ color: '#888899' }}>
            Forgot password?
          </button>
        </form>
        )}
        {mode === 'forgot' && (
        <form onSubmit={sendCode} className="space-y-4">
          <div className="flex items-start gap-2 text-xs" style={{ color: '#888899' }}>
            <Mail size={14} className="mt-0.5 shrink-0" />
            <p>We will email a 6-digit code to the admin email address saved on the server.</p>
          </div>
          {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity"
            style={{ background: 'linear-gradient(135deg, #6c63ff, #00d4ff)', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Sending...' : 'Send code'}
          </button>
          <button type="button" onClick={() => go('login')}
            className="w-full text-xs text-center" style={{ color: '#888899' }}>
            Back to login
          </button>
        </form>
        )}
        {mode === 'reset' && (
        <form onSubmit={resetPassword} className="space-y-4">
          <div className="relative">
            <KeyRound size={14} className="absolute left-3 top-3.5" style={{ color: '#888899' }} />
            <input type="text" placeholder="6-digit code" value={reset.code}
              onChange={e => setReset(r => ({ ...r, code: e.target.value }))} required
              inputMode="numeric" maxLength={6} autoComplete="one-time-code" className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none"
              style={inputStyle} onFocus={focusOn} onBlur={focusOff}
            />
          </div>
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-3.5" style={{ color: '#888899' }} />
            <input type="password" placeholder="New password (min 10 characters)" value={reset.newPassword}
              onChange={e => setReset(r => ({ ...r, newPassword: e.target.value }))} required
              minLength={10} autoComplete="new-password" className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none"
              style={inputStyle} onFocus={focusOn} onBlur={focusOff}
            />
          </div>
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-3.5" style={{ color: '#888899' }} />
            <input type="password" placeholder="Confirm new password" value={reset.confirm}
              onChange={e => setReset(r => ({ ...r, confirm: e.target.value }))} required
              minLength={10} autoComplete="new-password" className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none"
              style={inputStyle} onFocus={focusOn} onBlur={focusOff}
            />
          </div>
          {info && <p className="text-xs" style={{ color: '#10b981' }}>{info}</p>}
          {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity"
            style={{ background: 'linear-gradient(135deg, #6c63ff, #00d4ff)', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Saving...' : 'Set new password'}
          </button>
          <button type="button" onClick={() => go('forgot')}
            className="w-full text-xs text-center" style={{ color: '#888899' }}>
            Send a new code
          </button>
        </form>
        )}
      </motion.div>
    </div>
  )
}
