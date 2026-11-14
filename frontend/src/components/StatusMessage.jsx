export default function StatusMessage({ loading, error, empty, label, onRetry }) {
  if (loading) {
    return <div className="text-sm" style={{ color: '#888899' }}>Loading {label}… (the server may take a few seconds to wake up)</div>
  }
  if (error) {
    return (
      <div className="text-sm rounded-xl p-5 max-w-md" style={{ background: '#14141e', border: '1px solid #2a2a3a', color: '#f0f0f5' }}>
        <p className="mb-3" style={{ color: '#888899' }}>Couldn't load {label} right now.</p>
        <button onClick={onRetry} className="px-4 py-2 rounded-lg text-xs font-semibold"
          style={{ background: '#6c63ff', color: '#fff' }}>Try again</button>
      </div>
    )
  }
  if (empty) return <div className="text-sm" style={{ color: '#888899' }}>No {label} to show yet.</div>
  return null
}
