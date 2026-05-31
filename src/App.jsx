import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown, LogIn, LayoutDashboard, Sparkles, GraduationCap, Compass, Rss, Search, Sun, Moon, LogOut } from 'lucide-react'
import './App.css'
import { api } from './services/api.js'
import AppLayout from './components/layout/AppLayout.jsx'
import { useAuth } from './context/AuthContext.jsx'

// Import all 14 pages
import Home from './pages/Home.jsx'
import StudentPortal from './pages/StudentPortal.jsx'
import News from './pages/News.jsx'
import ResearchClubs from './pages/ResearchClubs.jsx'
import Projects from './pages/Projects.jsx'
import ProjectDetail from './pages/ProjectDetail.jsx'
import Workshops from './pages/Workshops.jsx'
import Events from './pages/Events.jsx'
import Members from './pages/Members.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ResearcherProfile from './pages/ResearcherProfile.jsx'
import Contact from './pages/Contact.jsx'
import Auth from './pages/Auth.jsx'
import Opportunities from './pages/Opportunities.jsx'
import Admin from './pages/Admin.jsx'
import Logo from './components/Logo.jsx'
import PerspectiveGrid from './components/PerspectiveGrid.jsx'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [isScrolled, setIsScrolled] = useState(false)
  const [isNavExpanded, setIsNavExpanded] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isDesktopNavExpanded = !isScrolled || isNavExpanded
  
  // Theme state and Search query state
  const [theme, setTheme] = useState('dark')
  const [searchQuery, setSearchQuery] = useState('')
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false)

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      alert("Veuillez entrer une adresse e-mail valide.");
      return;
    }
    setNewsletterSubscribed(true);
    setNewsletterEmail('');
    setTimeout(() => {
      setNewsletterSubscribed(false);
    }, 4500);
  };

  const { user, logout, loading } = useAuth()

  const handleLogout = () => {
    logout();
    navigate('home');
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    if (nextTheme === 'light') {
      document.body.classList.add('light-theme')
    } else {
      document.body.classList.remove('light-theme')
    }
  }

  // Shared state for selected project or active researcher profile detail
  const [selectedProjectId, setSelectedProjectId] = useState('p1')
  const [selectedResearcherId, setSelectedResearcherId] = useState('r1')

  // Gating privé silencieux et immédiat si non authentifié
  useEffect(() => {
    if (!loading) {
      const protectedPages = ['dashboard', 'profile', 'admin'];
      if (protectedPages.includes(currentPage) && !user) {
        navigate('auth');
      }
    }
  }, [currentPage, user, loading]);

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true)
        setIsNavExpanded(false) // contract signature pill on scroll down
      } else {
        setIsScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle click outside to collapse navigation menus automatically
  useEffect(() => {
    const handleClickOutside = (e) => {
      // If expanded and click is outside active nav container
      if (isNavExpanded && !e.target.closest('.pointer-events-auto')) {
        setIsNavExpanded(false)
      }
      if (mobileMenuOpen && !e.target.closest('.pointer-events-auto')) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('mousedown', handleClickOutside)
    return () => window.removeEventListener('mousedown', handleClickOutside)
  }, [isNavExpanded, mobileMenuOpen])

  // Smooth scroll back to top on page change
  const navigate = (pageName, params = {}) => {
    setCurrentPage(pageName)
    setMobileMenuOpen(false)
    setIsNavExpanded(false)
    
    if (params.projectId) {
      setSelectedProjectId(params.projectId)
    }
    if (params.researcherId) {
      setSelectedResearcherId(params.researcherId)
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle Dynamic Component Rendering
  const renderPage = () => {
    // Redirection/gating préventive pour éviter les flashs visuels
    const protectedPages = ['dashboard', 'profile', 'admin'];
    if (protectedPages.includes(currentPage) && !user) {
      return null;
    }

    switch (currentPage) {
      case 'home':
        return <Home navigate={navigate} />
      case 'student-portal':
        return <StudentPortal navigate={navigate} />
      case 'news':
        return <News navigate={navigate} />
      case 'clubs':
        return <ResearchClubs navigate={navigate} />
      case 'projects':
        return <Projects navigate={navigate} selectedProjectId={selectedProjectId} />
      case 'project-detail':
        return <ProjectDetail navigate={navigate} projectId={selectedProjectId} />
      case 'workshops':
        return <Workshops navigate={navigate} />
      case 'events':
        return <Events navigate={navigate} />
      case 'members':
        return <Members navigate={navigate} />
      case 'dashboard':
        return <Dashboard navigate={navigate} />
      case 'profile':
        return <ResearcherProfile navigate={navigate} researcherId={selectedResearcherId} />
      case 'admin':
        return <Admin navigate={navigate} />
      case 'contact':
        return <Contact navigate={navigate} />
      case 'auth':
        return <Auth navigate={navigate} />
      case 'opportunities':
        return <Opportunities navigate={navigate} />
      default:
        return <Home navigate={navigate} />
    }
  }

  return (
    <AppLayout
      currentPage={currentPage}
      navigate={navigate}
      theme={theme}
      toggleTheme={toggleTheme}
      user={user}
      handleLogout={handleLogout}
      isScrolled={isScrolled}
      isNavExpanded={isNavExpanded}
      setIsNavExpanded={setIsNavExpanded}
      mobileMenuOpen={mobileMenuOpen}
      setMobileMenuOpen={setMobileMenuOpen}
      newsletterEmail={newsletterEmail}
      setNewsletterEmail={setNewsletterEmail}
      newsletterSubscribed={newsletterSubscribed}
      handleNewsletterSubmit={handleNewsletterSubmit}
    >
      {renderPage()}
    </AppLayout>
  )
}

export default App
