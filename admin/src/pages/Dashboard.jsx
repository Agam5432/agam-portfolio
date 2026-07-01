import { useState } from 'react'
import {
  LayoutDashboard, FolderOpen, Mail, MessageSquare,
  LogOut, User, Zap, Briefcase, GraduationCap, BarChart2
} from 'lucide-react'

import OverviewPage from './OverviewPage'
import ProfilePage from './ProfilePage'
import SkillsPage from './SkillsPage'
import ExperiencePage from './ExperiencePage'
import EducationPage from './EducationPage'
import ProjectsPage from './ProjectsPage'
import ContactsPage from './ContactsPage'
import ChatsPage from './ChatsPage'
import AnalyticsPage from './AnalyticsPage'
import VisitorsTable from './VisitorsTable'

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'skills', label: 'Skills', icon: Zap },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'contacts', label: 'Messages', icon: Mail },
  { id: 'chats', label: 'Nexora Chats', icon: MessageSquare },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  // 'visitors' is intentionally NOT in sidebar — reached via "View Detail" button on Analytics cards
]

export default function Dashboard({ token, logout }) {
  const [tab, setTab] = useState('overview')
  const [visitorFilter, setVisitorFilter] = useState('unique')

  const renderPage = () => {
    switch (tab) {
      case 'overview': return <OverviewPage token={token} setTab={setTab} />
      case 'profile': return <ProfilePage token={token} />
      case 'skills': return <SkillsPage token={token} />
      case 'experience': return <ExperiencePage token={token} />
      case 'education': return <EducationPage token={token} />
      case 'projects': return <ProjectsPage token={token} />
      case 'contacts': return <ContactsPage token={token} />
      case 'chats': return <ChatsPage token={token} />
      case 'analytics': return <AnalyticsPage token={token} setTab={setTab} setVisitorFilter={setVisitorFilter} />
      case 'visitors': return <VisitorsTable token={token} setTab={setTab} visitorFilter={visitorFilter} />
      default: return null
    }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0a0a0f' }}>
      {/* Sidebar */}
      <aside className="w-64 bg-[#111] fixed left-0 top-0 h-screen"
        style={{ background: '#0d0d14', borderRight: '1px solid #2a2a3a' }}>
        <div className="px-2 mb-6">
          <p className="text-lg font-black" style={{ background: 'linear-gradient(90deg,#6c63ff,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Admin</p>
          <p className="text-xs" style={{ color: '#888899' }}>Portfolio Dashboard</p>
        </div>
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
              style={{
                background: tab === t.id ? 'rgba(108,99,255,0.1)' : 'transparent',
                color: tab === t.id ? '#00d4ff' : '#888899',
                border: tab === t.id ? '1px solid rgba(108,99,255,0.2)' : '1px solid transparent'
              }}>
              <Icon size={15} /> {t.label}
            </button>
          )
        })}
        <button onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 mt-10 rounded-xl text-sm font-medium mt-auto"
          style={{ color: '#ef4444', border: '1px solid transparent' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <LogOut size={15} /> Logout
        </button>
      </aside>

      {/* Main */}
      <main className="ml-64 flex-1 overflow-y-auto h-screen p-8">
        {renderPage()}
      </main>
    </div>
  )
}