import { trackPageView } from "./analytics";
import { useEffect } from "react";

import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Education from './components/Education'
import Contact from './components/Contact'
import NexoraChat from './components/NexoraChat'

// Old multi-page URLs (/about, /projects ...) still work: they scroll to the matching section.
const PATH_TO_SECTION = {
  '/about': 'about', '/skills': 'skills', '/experience': 'experience',
  '/projects': 'projects', '/education': 'education', '/contact': 'contact',
}

function App() {
  useEffect(() => {
    // the whole site is one page now, so one page view per visit
    if (sessionStorage.getItem("lastTrackedPage") !== "/") {
      sessionStorage.setItem("lastTrackedPage", "/");
      trackPageView("/");
    }
    const target = PATH_TO_SECTION[window.location.pathname.replace(/\/+$/, '')]
    if (target) {
      window.history.replaceState(null, '', '/')
      setTimeout(() => document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' }), 600)
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5] font-sans">
      <Navbar />

      <main className="pt-16">
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Education />
        <Contact />
      </main>

      <footer className="px-6 py-8 text-center text-xs" style={{ borderTop: '1px solid #2a2a3a', color: '#888899' }}>
        © {new Date().getFullYear()} Agam Tyagi · AI Engineer · Mohali, Punjab, India
      </footer>

      <NexoraChat />
    </div>
  )
}

export default App
