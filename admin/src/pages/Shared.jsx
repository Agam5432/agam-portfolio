import axios from 'axios'

export const api = (token) => axios.create({
  headers: { Authorization: `Bearer ${token}` }
})

export const inputStyle = {
  background: '#1a1a24', border: '1px solid #2a2a3a',
  color: '#f0f0f5', fontFamily: 'inherit'
}

export const focusStyle = (e) => e.target.style.borderColor = '#6c63ff'
export const blurStyle = (e) => e.target.style.borderColor = '#2a2a3a'

export function StatCard({ label, value, icon: Icon, color }) {
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

export function Field({ label, name, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="text-xs mb-1 block" style={{ color: '#888899' }}>{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle}
        onFocus={focusStyle} onBlur={blurStyle} />
    </div>
  )
}

export function TextArea({ label, name, value, onChange, rows = 3 }) {
  return (
    <div>
      <label className="text-xs mb-1 block" style={{ color: '#888899' }}>{label}</label>
      <textarea name={name} value={value} onChange={onChange} rows={rows}
        className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none" style={inputStyle}
        onFocus={focusStyle} onBlur={blurStyle} />
    </div>
  )
}

export function Toggle({ label, checked, onChange }) {
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

export function SaveBtn({ saving }) {
  return (
    <button type="submit" disabled={saving}
      className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white"
      style={{ background: 'linear-gradient(135deg, #6c63ff, #00d4ff)', opacity: saving ? 0.7 : 1 }}>
      {saving ? 'Saving...' : 'Save'}
    </button>
  )
}