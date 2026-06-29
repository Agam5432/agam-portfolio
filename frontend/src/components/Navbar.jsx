import { useState } from 'react'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

const links = [
  { id: '/', label: 'Home' },
  { id: '/about', label: 'About' },
  { id: '/skills', label: 'Skills' },
  { id: '/experience', label: 'Experience' },
  { id: '/projects', label: 'Projects' },
  { id: '/education', label: 'Education' },
  { id: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handle = (path) => {
    navigate(path)
    setOpen(false)
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 md:px-12"
      style={{
        background: 'rgba(10,10,15,0.88)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #2a2a3a'
      }}
    >
      {/* Logo */}
      <button
        onClick={() => handle('/')}
        className="text-lg font-black tracking-tight gradient-text"
      >
        AT
      </button>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-1">
        {links.map(link => {
          const isActive = location.pathname === link.id

          return (
            <button
              key={link.id}
              onClick={() => handle(link.id)}
              className="relative px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150"
              style={{ color: isActive ? '#00d4ff' : '#888899' }}
            >
              {link.label}

              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: 'rgba(0,212,255,0.08)',
                    border: '1px solid rgba(0,212,255,0.2)'
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-[#888899]"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Dropdown */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-16 left-0 right-0 flex flex-col gap-1 p-4"
          style={{
            background: '#111118',
            borderBottom: '1px solid #2a2a3a'
          }}
        >
          {links.map(link => {
            const isActive = location.pathname === link.id

            return (
              <button
                key={link.id}
                onClick={() => handle(link.id)}
                className="text-left px-4 py-3 rounded-lg text-sm font-medium"
                style={{
                  color: isActive ? '#00d4ff' : '#888899',
                  background: isActive ? 'rgba(0,212,255,0.08)' : 'transparent'
                }}
              >
                {link.label}
              </button>
            )
          })}
        </motion.div>
      )}
    </nav>
  )
}