import { useState, useEffect, useRef } from 'react'
import { FileText, Upload, Trash2, ExternalLink } from 'lucide-react'
import axios from 'axios'
import { api } from './Shared'

const MAX = 5 * 1024 * 1024

export default function ResumeCard({ token }) {
  const [info, setInfo] = useState(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })
  const input = useRef(null)

  const load = () => axios.get('/api/resume/info').then(r => setInfo(r.data)).catch(() => setInfo({ exists: false }))
  useEffect(() => { load() }, [])

  const say = (type, text) => setMsg({ type, text })

  const onPick = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) return say('error', 'Only PDF files are allowed.')
    if (file.size > MAX) return say('error', 'File is too large (max 5 MB).')
    setBusy(true); say('', '')
    try {
      const r = await api(token).post(`/api/resume?filename=${encodeURIComponent(file.name)}`, file, {
        headers: { 'Content-Type': 'application/pdf' },
      })
      setInfo(r.data)
      say('ok', 'Resume uploaded. The Resume button on your site now serves this file.')
    } catch (err) {
      say('error', err.response?.data?.error || 'Upload failed. If the server was asleep, try again.')
    } finally { setBusy(false) }
  }

  const remove = async () => {
    if (!window.confirm('Remove the uploaded resume? The site will fall back to the bundled default file.')) return
    setBusy(true)
    try { await api(token).delete('/api/resume'); setInfo({ exists: false }); say('ok', 'Uploaded resume removed.') }
    catch { say('error', 'Could not remove resume.') }
    finally { setBusy(false) }
  }

  const base = axios.defaults.baseURL || ''
  return (
    <div className="p-5 rounded-2xl space-y-3 max-w-3xl mb-4" style={{ background: '#14141e', border: '1px solid #2a2a3a' }}>
      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#6c63ff' }}>Resume (PDF)</p>
      <div className="flex items-center gap-3 flex-wrap">
        <FileText size={18} style={{ color: info?.exists ? '#10b981' : '#888899' }} />
        <div className="flex-1 min-w-0 text-sm">
          {!info ? 'Loading...' : info.exists ? (
            <>
              <p className="truncate">{info.filename}</p>
              <p className="text-xs" style={{ color: '#888899' }}>
                {(info.size / 1024).toFixed(0)} KB · updated {new Date(info.updatedAt).toLocaleString()}
              </p>
            </>
          ) : (
            <p style={{ color: '#888899' }}>No resume uploaded — the site serves the bundled default (/Agam_Tyagi_Resume.pdf).</p>
          )}
        </div>
        {info?.exists && (
          <a href={`${base}/api/resume?view=1&v=${new Date(info.updatedAt).getTime()}`} target="_blank" rel="noreferrer"
            className="p-2 rounded-lg" style={{ color: '#00d4ff' }} title="Preview"><ExternalLink size={15} /></a>
        )}
        {info?.exists && (
          <button type="button" onClick={remove} disabled={busy} className="p-2 rounded-lg" style={{ color: '#ef4444' }} title="Remove"><Trash2 size={15} /></button>
        )}
        <button type="button" onClick={() => input.current?.click()} disabled={busy}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #6c63ff, #00d4ff)', opacity: busy ? 0.7 : 1 }}>
          <Upload size={14} /> {busy ? 'Working...' : info?.exists ? 'Replace' : 'Upload'}
        </button>
        <input ref={input} type="file" accept="application/pdf,.pdf" className="hidden" onChange={onPick} />
      </div>
      {msg.text && <p className="text-xs" style={{ color: msg.type === 'ok' ? '#10b981' : '#ef4444' }}>{msg.text}</p>}
    </div>
  )
}
