import { AnimatePresence, motion } from 'framer-motion'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation
} from 'react-router-dom'

import { useEffect, useRef } from 'react'
import axios from 'axios'

import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Education from './components/Education'
import Contact from './components/Contact'
import NexoraChat from './components/NexoraChat'

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  )
}

function App() {
  const location = useLocation()

  // 🔥 HARD GUARD (prevents duplicate API calls)
  const lastTrackedPage = useRef("");

  useEffect(() => {
    const page = location.pathname;

    // 🚫 BLOCK duplicate calls
    if (lastTrackedPage.current === page) return;

    lastTrackedPage.current = page;

    const timer = setTimeout(() => {
      axios.post("/api/analytics/track-visit", {
        page
      });
    }, 300);

    return () => clearTimeout(timer);

  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5] font-inter">
      <Navbar />

      <main className="pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <Routes>
              <Route path="/" element={<Hero />} />
              <Route path="/about" element={<About />} />
              <Route path="/skills" element={<Skills />} />
              <Route path="/experience" element={<Experience />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/education" element={<Education />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      <NexoraChat />
    </div>
  )
}

export default AppWrapper