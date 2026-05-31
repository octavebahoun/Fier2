import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  User,
  FolderGit2,
  Rss,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield
} from 'lucide-react'

export default function Sidebar({
  currentPage,
  navigate,
  user,
  handleLogout
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPinned, setIsPinned] = useState(false)

  const isExpanded = isHovered || isPinned

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ...(user?.role === 'CHERCHEUR' ? [{
      id: 'profile',
      label: 'Mon Profil',
      icon: User,
      params: { researcherId: user?.id || 'r1' }
    }] : []),
    ...(user?.role === 'ADMIN' ? [{
      id: 'admin',
      label: 'Administration',
      icon: Shield
    }] : []),
    { id: 'projects', label: 'Projets', icon: FolderGit2 },
    { id: 'news', label: 'Actualités', icon: Rss },
    { id: 'contact', label: 'Aide & Contact', icon: HelpCircle }
  ]

  const handleItemClick = (item) => {
    navigate(item.id, item.params || {})
  }

  return (
    <motion.aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{ width: isExpanded ? 240 : 40 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
      className="fixed top-0 left-0 bottom-0 z-40 bg-bg-secondary/95 border-r border-border-subtle flex flex-col justify-between py-6 select-none h-screen pointer-events-auto"
    >
      {/* Decorative radial gradient glow */}
      <div className="absolute top-1/4 left-0 w-full h-1/2 pointer-events-none bg-accent-primary/5 blur-[40px] z-0" />

      <div className="relative z-10 flex flex-col gap-6 w-full">
        {/* Sidebar Header / Toggle Button */}
        <div className="flex items-center justify-between px-3 h-10 shrink-0">
          {isExpanded ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              <div className="w-6 h-6 flex items-center justify-center rounded bg-accent-primary/20 border border-accent-primary/40">
                <span className="text-fieri-blue text-[10px] font-black">F</span>
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-text-primary">FIERI Hub</span>
            </motion.div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-6 h-6 flex items-center justify-center rounded bg-accent-primary/20 border border-accent-primary/40">
                <span className="text-fieri-blue text-[10px] font-black">F</span>
              </div>
            </div>
          )}

          {/* Toggle pin button (only visible when expanded) */}
          {isExpanded && (
            <button
              onClick={() => setIsPinned(!isPinned)}
              className="p-1 rounded-md hover:bg-white/5 border border-transparent hover:border-border-subtle text-text-muted hover:text-text-primary transition-all cursor-pointer"
              title={isPinned ? "Désépingler la barre" : "Épingler la barre"}
            >
              {isPinned ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* User Block for Role Presentation */}
        {isExpanded && user && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-3 pb-3 border-b border-border-subtle/50 flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-full bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center shrink-0">
              <span className="text-text-primary font-bold text-xs uppercase">
                {user.firstName ? user.firstName[0] : 'U'}
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-text-primary truncate">
                {user.firstName} {user.lastName}
              </span>
              <span className={`text-[8.5px] uppercase tracking-wider font-extrabold self-start ${
                user.role === 'ADMIN'
                  ? 'text-red-400'
                  : user.role === 'CHERCHEUR'
                  ? 'text-fieri-blue'
                  : 'text-emerald-400'
              }`}>
                {user.role === 'ADMIN' ? 'Administrateur' : user.role === 'CHERCHEUR' ? 'Chercheur FIERI' : 'Membre'}
              </span>
            </div>
          </motion.div>
        )}

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5 px-2 w-full">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id ||
              (item.id === 'projects' && currentPage === 'project-detail') ||
              (item.id === 'profile' && currentPage === 'profile')

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`relative w-full h-9 rounded-lg flex items-center gap-3 transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-accent-primary/20 border border-accent-primary/30 text-text-primary'
                    : 'hover:bg-white/5 border border-transparent text-text-secondary hover:text-text-primary'
                } ${isExpanded ? 'px-3' : 'justify-center px-0'}`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-fieri-blue' : ''}`} />

                {/* Text Label (shown only when expanded) */}
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-xs font-semibold tracking-wide whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}

                {/* Glowing Amber Active indicator */}
                {isActive && (
                  <span className={`absolute rounded-full bg-accent-secondary border border-bg-primary shadow-[0_0_8px_rgba(245,166,35,0.7)] ${
                    isExpanded
                      ? 'right-3 w-1.5 h-1.5 animate-pulse'
                      : 'top-1 right-1 w-2 h-2 animate-pulse-dot'
                  }`} />
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Logout button at the bottom */}
      <div className="relative z-10 px-2 w-full">
        <button
          onClick={handleLogout}
          className={`w-full h-9 rounded-lg flex items-center gap-3 transition-all duration-250 cursor-pointer hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-red-400 hover:text-red-300 ${
            isExpanded ? 'px-3' : 'justify-center px-0'
          }`}
          title="Se déconnecter"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {isExpanded && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="text-xs font-semibold tracking-wide whitespace-nowrap"
            >
              Déconnexion
            </motion.span>
          )}
        </button>
      </div>
    </motion.aside>
  )
}
