import { trackPageView } from "./analytics";
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from "react";
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom'

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
useEffect(() => {
  const page = location.pathname;
  // avoid duplicate calls (StrictMode double effects, same-page re-renders)
  if (sessionStorage.getItem("lastTrackedPage") === page) return;
  sessionStorage.setItem("lastTrackedPage", page);
  trackPageView(page);
}, [location.pathname]);
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5] font-inter">
      <Navbar />

      <main className="pt-16">
        <AnimatePresence mode="wait">
          <motion.div
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