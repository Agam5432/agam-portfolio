import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, MessageCircleMore } from 'lucide-react'
import axios from 'axios'
const QUICK = [
  "What are Agam's skills?",
  "Tell me about his projects",
  "Is he available to hire?",
  "How can I contact him?",
]

const WELCOME = "Hey! I'm Nexora — Agam's personal AI assistant. Ask me anything about his skills, projects, or experience! 👋"

export default function NexoraChat() {
  const [open, setOpen] = useState(false)
  const [history, setHistory] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [leadState, setLeadState] = useState({ stage: 'idle' }) // NEW
  const msgsRef = useRef(null)

  useEffect(() => {
    if (msgsRef.current) {
      msgsRef.current.scrollTop = msgsRef.current.scrollHeight
    }
  }, [history, loading])

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')

    const userMsg = { role: 'user', content: msg }
    setHistory(h => [...h, userMsg])
    setLoading(true)

    try {
      const res = await axios.post(`/api/nexora/chat`, {
        message: msg,
        history: history.slice(-6),
        leadState
      })
      setHistory(h => [...h, { role: 'assistant', content: res.data.reply }])
      setLeadState(res.data.leadState || { stage: 'idle' })
    } catch (err) {
      const errMsg = err.response?.status === 429
        ? "Too many messages! Please wait a moment and try again."
        : "Something went wrong. Please try again."
      setHistory(h => [...h, { role: 'assistant', content: errMsg }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      {/* Floating Bubble */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #6c63ff, #00d4ff)', boxShadow: '0 4px 24px rgba(108,99,255,0.5)' }}
        title="Chat with Nexora"
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X size={22} color="white" /></motion.div>
            : <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><MessageCircleMore size={22} color="white" /></motion.div>
          }
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed bottom-24 right-6 z-50 w-[340px] rounded-2xl overflow-hidden flex flex-col"
            style={{
              height: '480px',
              background: '#111118',
              border: '1px solid #2a2a3a',
              boxShadow: '0 20px 60px rgba(0,0,0,0.7)'
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 shrink-0"
              style={{ background: 'linear-gradient(135deg, #6c63ff, #00d4ff)' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm"
                style={{ background: 'rgba(255,255,255,0.2)' }}>NX</div>
              <div>
                <p className="text-sm font-bold text-white">Nexora</p>
                <p className="text-xs text-white/75">Agam's AI Assistant · Always Online</p>
              </div>
              <div className="ml-auto w-2 h-2 rounded-full bg-green-400"
                style={{ boxShadow: '0 0 6px rgba(74,222,128,0.8)' }} />
            </div>

            {/* Messages */}
            <div ref={msgsRef} className="flex-1 overflow-y-auto p-4 space-y-3 nexora-msgs">
              {/* Welcome */}
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, #6c63ff, #00d4ff)' }}>NX</div>
                <div className="px-3 py-2 rounded-2xl rounded-tl-sm text-xs leading-relaxed max-w-[85%]"
                  style={{ background: '#1a1a24', border: '1px solid #2a2a3a', color: '#f0f0f5' }}>
                  {WELCOME}
                </div>
              </div>

              {/* Quick chips — only when no history */}
              {history.length === 0 && (
                <div className="flex flex-wrap gap-1.5 ml-9">
                  {QUICK.map(q => (
                    <button key={q} onClick={() => send(q)}
                      className="px-2.5 py-1 rounded-full text-xs transition-all duration-150"
                      style={{ background: '#1a1a24', border: '1px solid rgba(0,212,255,0.25)', color: '#00d4ff' }}
                      onMouseEnter={e => e.target.style.background = 'rgba(0,212,255,0.08)'}
                      onMouseLeave={e => e.target.style.background = '#1a1a24'}>
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Chat messages */}
              {history.map((msg, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: 'linear-gradient(135deg, #6c63ff, #00d4ff)' }}>NX</div>
                  )}
                  <div className={`px-3 py-2 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                    msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'
                  }`}
                    style={msg.role === 'user'
                      ? { background: 'linear-gradient(135deg, #6c63ff, #00d4ff)', color: 'white' }
                      : { background: '#1a1a24', border: '1px solid #2a2a3a', color: '#f0f0f5' }
                    }>
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg, #6c63ff, #00d4ff)' }}>NX</div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1.5 items-center"
                    style={{ background: '#1a1a24', border: '1px solid #2a2a3a' }}>
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} className="w-2 h-2 rounded-full"
                        style={{ background: '#6c63ff' }}
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }} />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 shrink-0 flex gap-2 items-center"
              style={{ borderTop: '1px solid #2a2a3a', background: '#0a0a0f' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about Agam..."
                className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
                style={{ background: '#1a1a24', border: '1px solid #2a2a3a', color: '#f0f0f5', fontFamily: 'inherit' }}
                onFocus={e => e.target.style.borderColor = '#6c63ff'}
                onBlur={e => e.target.style.borderColor = '#2a2a3a'}
              />
              <button onClick={() => send()}
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-opacity"
                style={{
                  background: 'linear-gradient(135deg, #6c63ff, #00d4ff)',
                  opacity: !input.trim() || loading ? 0.4 : 1
                }}>
                <Send size={14} color="white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
