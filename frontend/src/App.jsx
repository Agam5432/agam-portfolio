import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Education from './components/Education'
import Contact from './components/Contact'
import NexoraChat from './components/NexoraChat'

const SECTIONS = ['home', 'about', 'skills', 'experience', 'projects', 'education', 'contact']

const sectionComponents = {
  home: Hero,
  about: About,
  skills: Skills,
  experience: Experience,
  projects: Projects,
  education: Education,
  contact: Contact,
}

export default function App() {
  const [active, setActive] = useState('home')

  const goTo = (section) => {
    if (SECTIONS.includes(section)) {
      setActive(section)
      window.scrollTo(0, 0)
    }
  }

  const ActiveComponent = sectionComponents[active]

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5] font-inter">
      <Navbar active={active} goTo={goTo} />
      <main className="pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <ActiveComponent goTo={goTo} />
          </motion.div>
        </AnimatePresence>
      </main>
      <NexoraChat />
    </div>
  )
}
