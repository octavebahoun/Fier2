import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown, Sun, Moon, LogOut, Search } from 'lucide-react'
import Logo from '../Logo.jsx'
import api from '../../services/api.js'

export default function Navbar({
  currentPage,
  navigate,
  theme,
  toggleTheme,
  user,
  handleLogout,
  isScrolled,
  isNavExpanded,
  setIsNavExpanded,
  mobileMenuOpen,
  setMobileMenuOpen
}) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    let mounted = true
    const loadUnread = async () => {
      try {
        if (!user) { setUnreadCount(0); return }
        const res = await api.dashboard.getNotifications()
        if (mounted && res && res.success) {
          const count = (res.data || []).filter(n => !n.read).length
          setUnreadCount(count)
        }
      } catch (e) {
        // ignore
      }
    }
    const handleUpdate = () => { void loadUnread() }
    const handleStorage = (ev) => {
      try {
        if (!ev || !ev.key) return
        if (ev.key.includes('fieri_db_notifications') || ev.key.includes('fieri_db')) {
          void loadUnread()
        }
      } catch {}
    }

    loadUnread()
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('fieri:notifications:updated', handleUpdate)
      window.addEventListener('storage', handleStorage)
    }

    return () => {
      mounted = false
      if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
        window.removeEventListener('fieri:notifications:updated', handleUpdate)
        window.removeEventListener('storage', handleStorage)
      }
    }
  }, [user])
  return (
    <header className="fixed top-3 left-0 right-0 z-50 pointer-events-none flex justify-center w-full px-4 md:px-6">
      {/* ====== DESKTOP NAVIGATION ====== */}
      <div className="hidden md:flex items-center justify-center w-full max-w-7xl">
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className={`border border-border-subtle bg-bg-secondary/90 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.5)] transition-all duration-300 ease-out select-none flex items-center justify-between rounded-full overflow-hidden pointer-events-auto ${
            (!isScrolled || isNavExpanded)
              ? 'w-[1100px] max-w-[95vw] h-14 px-6'
              : 'w-[250px] h-12 px-4 cursor-pointer hover:border-accent-primary/40 group mx-auto'
          }`}
          onClick={() => {
            if (isScrolled && !isNavExpanded) {
              setIsNavExpanded(true)
            }
          }}
        >
          {/* If scrolled and NOT expanded: Show centered burger + brand name */}
          {isScrolled && !isNavExpanded ? (
            <div className="flex items-center justify-between w-full">
              {/* Brand name + symbol */}
              <div className="flex items-center gap-2">
                <div className="relative w-6.5 h-6.5 flex items-center justify-center rounded bg-accent-primary/20 border border-accent-primary/40">
                  <span className="text-fieri-blue text-[10px] font-black">F</span>
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-text-primary">Fieri</span>
              </div>

              {/* Burger label + burger lines */}
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-text-secondary group-hover:text-accent-secondary transition-colors">
                  Menu
                </span>
                <div className="flex flex-col gap-1 w-4 select-none">
                  <span className="h-[1.5px] w-4 bg-text-primary rounded-full" />
                  <span className="h-[1.5px] w-2.5 bg-text-primary rounded-full group-hover:w-4 transition-all duration-300" />
                  <span className="h-[1.5px] w-4 bg-text-primary rounded-full" />
                </div>
              </div>
            </div>
          ) : (
            // Full navigation contents (Initial expanded OR clicked scrolled expanded)
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05, duration: 0.2 }}
              className="flex items-center justify-between w-full"
              onClick={(e) => e.stopPropagation()} // Prevent closing capsule on inner clicks
            >
              {/* Brand Logo & Name */}
              <div
                onClick={() => navigate('home')}
                className="flex items-center gap-2.5 cursor-pointer shrink-0 select-none group pointer-events-auto"
              >
                <div className="relative w-8 h-8 flex items-center justify-center rounded-lg bg-accent-primary/20 border border-accent-primary/40 group-hover:border-fieri-blue/60 transition-colors">
                  <span className="text-fieri-blue text-xs font-black">F</span>
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-accent-secondary border border-bg-primary animate-pulse" />
                </div>
                <Logo className="h-5" />
              </div>

              {/* Nav Links */}
              <div className="flex items-center gap-1">
                {[
                  { id: 'home', label: 'Accueil' },
                  { id: 'cite', label: 'Cité' },
                  { id: 'projects', label: 'Institut' },
                  { id: 'workshops', label: 'Académie' },
                  { id: 'clubs', label: 'Clubs' },
                  { id: 'opportunities', label: 'Opportunités' },
                  { id: 'news', label: 'Actualités & Événements' }
                ].map((link) => {
                  const isActive = currentPage === link.id ||
                    (link.id === 'projects' && currentPage === 'project-detail') ||
                    (link.id === 'cite' && currentPage === 'cite-integration');
                  return (
                    <button
                      key={link.id}
                      onClick={() => { navigate(link.id); setIsNavExpanded(false); }}
                      className={`px-3.5 py-1.5 rounded-full text-[10.5px] font-black uppercase tracking-wider transition-all duration-250 cursor-pointer ${
                        isActive
                          ? 'text-text-primary bg-accent-primary/30 border border-accent-primary/40 shadow-inner'
                          : 'text-text-secondary hover:text-text-primary hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      {link.label}
                    </button>
                  )
                })}
              </div>

              {/* Right hand details: Theme Toggle, Login/CTA */}
              <div className="flex items-center gap-4">
                {/* Command Palette Toggle */}
                <button
                  onClick={() => window.__openPalette?.()}
                  className="p-2 rounded-full hover:bg-white/5 border border-transparent hover:border-border-subtle text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                  title="Commandes (⌘K)"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-white/5 border border-transparent hover:border-border-subtle text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                  title={theme === 'dark' ? "Passer au mode clair" : "Passer au mode sombre"}
                >
                  {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                </button>

                {/* Logout Button (Desktop) */}
                {user && (
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-full hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-red-400 hover:text-red-300 transition-all cursor-pointer"
                    title="Se déconnecter"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Session Login / Dashboard */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { navigate(user ? 'dashboard' : 'auth'); setIsNavExpanded(false); }}
                    className="relative text-[9.5px] uppercase tracking-widest font-black px-4.5 py-2 rounded-full transition-all duration-300 border cursor-pointer bg-fieri-blue border-transparent text-white hover:bg-fieri-blue/90 shadow-[0_4px_12px_rgba(27,111,216,0.25)]"
                  >
                    {user ? 'Dashboard' : 'Connexion'}
                    {/** Notification badge */}
                    {user && unreadCount > 0 && typeof window !== 'undefined' && (
                      <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent-secondary text-white text-[10px] font-black">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {user && (
                    <span className={`text-[8.5px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full border shrink-0 ${
                      user.role === 'ADMIN'
                        ? 'bg-red-500/10 border-red-500/30 text-red-400'
                        : user.role === 'CHERCHEUR'
                        ? 'bg-accent-primary/15 border-accent-primary/30 text-fieri-blue'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    }`}>
                      {user.role === 'ADMIN' ? 'Admin' : user.role === 'CHERCHEUR' ? 'Chercheur' : user.role === 'ETUDIANT' ? 'Étudiant' : 'Membre'}
                    </span>
                  )}
                </div>

                {/* Close 'X' button inside scrolled expanded capsule */}
                {isScrolled && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsNavExpanded(false)
                    }}
                    className="flex items-center justify-center w-7.5 h-7.5 rounded-full border border-border-subtle hover:border-white/20 hover:bg-white/5 transition-all text-text-secondary hover:text-text-primary cursor-pointer ml-1"
                    title="Réduire le menu"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ====== MOBILE NAVIGATION ====== */}
      <div className="md:hidden flex flex-col items-center w-full pointer-events-auto">
        <motion.div
          layout
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex items-center justify-between border border-border-subtle bg-bg-secondary/95 backdrop-blur-xl shadow-lg h-10 px-3 rounded-full cursor-pointer hover:border-accent-primary/20 transition-all select-none mx-auto w-[200px]"
        >
          {/* Brand name & symbol */}
          <div className="flex items-center gap-1.5">
            <div className="relative w-5.5 h-5.5 flex items-center justify-center rounded bg-accent-primary/20 border border-accent-primary/40">
              <span className="text-fieri-blue text-[9px] font-black">F</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-text-primary">Fieri</span>
          </div>

          {/* Menu icon states */}
          <div className="flex flex-col items-center justify-center gap-0.5 w-5 h-5 select-none">
            <span className={`h-[1px] bg-text-primary rounded-full transition-transform duration-300 ${
              mobileMenuOpen ? 'w-3 translate-y-[3px] rotate-45' : 'w-3'
            }`} />
            <span className={`h-[1px] bg-text-primary rounded-full transition-all duration-300 ${
              mobileMenuOpen ? 'w-0 opacity-0' : 'w-2'
            }`} />
            <span className={`h-[1px] bg-text-primary rounded-full transition-transform duration-300 ${
              mobileMenuOpen ? 'w-3 -translate-y-[2.5px] -rotate-45' : 'w-3'
            }`} />
          </div>
        </motion.div>

        {/* Centered Mobile Dropdown glass card */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute top-12 left-1/2 -translate-x-1/2 w-[295px] pointer-events-auto bg-bg-secondary/95 border border-border-subtle backdrop-blur-2xl rounded-2xl shadow-2xl p-5 flex flex-col gap-4 z-50 overflow-hidden"
            >
              {/* Embedded cosmic blur */}
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-accent-primary/10 blur-[40px] pointer-events-none" />

              {/* Theme Toggle for Mobile */}
              <div className="flex items-center justify-between bg-white/5 border border-border-subtle rounded-xl px-3 py-2 relative z-10">
                <span className="text-xs text-text-secondary">Thème de l'interface</span>
                <button
                  onClick={toggleTheme}
                  className="p-1.5 rounded-full bg-white/5 border border-border-subtle text-text-primary cursor-pointer"
                >
                  {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Logout Button for Mobile */}
              {user && (
                <div className="flex items-center justify-between bg-red-500/5 border border-red-500/15 rounded-xl px-3 py-2 relative z-10">
                  <span className="text-xs text-red-400 font-medium">Déconnexion</span>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <hr className="border-border-subtle/50 relative z-10" />

              <div className="flex flex-col gap-1.5 relative z-10">
                {[
                  { id: 'home', label: 'Accueil', desc: 'Page principale' },
                  { id: 'cite', label: 'Cité', desc: 'Notre campus' },
                  { id: 'projects', label: 'Institut', desc: 'Nos projets scientifiques' },
                  { id: 'workshops', label: 'Académie', desc: 'Formations et cours' },
                  { id: 'clubs', label: 'Clubs', desc: 'Clubs de recherche' },
                  { id: 'opportunities', label: 'Opportunités', desc: 'Offres & Recrutement' },
                  { id: 'news', label: 'Actualités & Événements', desc: 'Publications et concours' }
                ].map((link) => {
                  const isActive = currentPage === link.id ||
                    (link.id === 'projects' && currentPage === 'project-detail') ||
                    (link.id === 'cite' && currentPage === 'cite-integration');
                  return (
                    <button
                      key={link.id}
                      onClick={() => { navigate(link.id); setMobileMenuOpen(false); }}
                      className={`w-full text-left py-2 px-3 rounded-xl flex items-center justify-between group transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-accent-primary/20 border border-accent-primary/30 text-text-primary'
                          : 'hover:bg-white/5 border border-transparent text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider">{link.label}</div>
                        <div className="text-[9px] text-text-muted mt-0.5">{link.desc}</div>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-text-muted group-hover:text-text-primary transition-transform" />
                    </button>
                  )
                })}
              </div>

              <hr className="border-border-subtle relative z-10" />

              <div className="grid grid-cols-2 gap-1.5 relative z-10">
                {[
                  { id: 'members', label: 'Annuaire' },
                  { id: 'contact', label: 'Contact' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { navigate(item.id); setMobileMenuOpen(false); }}
                    className="py-2 px-3 text-center rounded-xl text-[10px] font-bold text-text-secondary hover:text-text-primary hover:bg-white/5 border border-transparent transition-all cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2 relative z-10 mt-1">
                <button
                  onClick={() => { navigate(user ? 'dashboard' : 'auth'); setMobileMenuOpen(false); }}
                  className="w-full py-2 px-4 rounded-xl border border-border-subtle text-text-primary hover:bg-white/5 text-center font-bold text-xs uppercase cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{user ? 'Mon Dashboard' : 'Se Connecter'}</span>
                  {user && (
                    <span className={`text-[8.5px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full border shrink-0 ${
                      user.role === 'ADMIN'
                        ? 'bg-red-500/10 border-red-500/30 text-red-400'
                        : user.role === 'CHERCHEUR'
                        ? 'bg-accent-primary/15 border-accent-primary/30 text-fieri-blue'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    }`}>
                      {user.role === 'ADMIN' ? 'Admin' : user.role === 'CHERCHEUR' ? 'Chercheur' : user.role === 'ETUDIANT' ? 'Étudiant' : 'Membre'}
                    </span>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
