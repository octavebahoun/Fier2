import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sun, Moon, LogOut, Search, ArrowUpRight } from 'lucide-react'
import Logo from '../Logo.jsx'
import RoleBadge from '../RoleBadge.jsx'
import { useTheme } from '../../context/useTheme.js'
import api from '../../services/api.js'

const NAV_LINKS = [
  { id: 'home', label: 'Accueil' },
  { id: 'cite', label: 'Gouvernance' },
  { id: 'projects', label: 'Institut' },
  { id: 'workshops', label: 'Formations' },
  { id: 'clubs', label: 'CITE' },
  { id: 'opportunities', label: 'Opportunités' },
  { id: 'news', label: 'Actualités' },
]

/**
 * Navbar — navigation marketing (déconnecté ou parcours public).
 * Barre fixe classique : logo, liens, recherche, thème, connexion.
 * L'ancienne « capsule auto-rétrécissante » est abandonnée (refonte).
 */
export default function Navbar({
  currentPage,
  navigate,
  user,
  handleLogout,
  mobileMenuOpen,
  setMobileMenuOpen
}) {
  const { theme, toggleTheme } = useTheme()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    let mounted = true
    const loadUnread = async () => {
      try {
        if (!user) { setUnreadCount(0); return }
        const res = await api.dashboard.getNotifications()
        if (mounted && res && res.success) {
          setUnreadCount((res.data || []).filter(n => !n.read).length)
        }
      } catch {
        // Les notifications ne doivent pas bloquer la navigation.
      }
    }
    const handleUpdate = () => { void loadUnread() }
    const handleStorage = (ev) => {
      try {
        if (!ev || !ev.key) return
        if (ev.key.includes('fieri_db_notifications') || ev.key.includes('fieri_db')) {
          void loadUnread()
        }
      } catch {
        // Ignore les événements storage non conformes.
      }
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

  const isActive = (id) =>
    currentPage === id ||
    (id === 'projects' && currentPage === 'project-detail') ||
    (id === 'cite' && currentPage === 'cite-integration')

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-bg-primary/80 backdrop-blur-xl border-b border-border-subtle">
      <div className="max-w-[92rem] mx-auto h-16 px-4 md:px-6 flex items-center gap-6">
        {/* Marque */}
        <button
          type="button"
          onClick={() => navigate('home')}
          className="flex items-center gap-2.5 shrink-0 cursor-pointer group text-text-primary"
          aria-label="Aller à l'accueil"
        >
          <Logo className="h-6" />
        </button>

        {/* Liens (desktop) */}
        <nav aria-label="Navigation principale" className="hidden lg:flex items-center gap-1 flex-1">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => navigate(link.id)}
              aria-current={isActive(link.id) ? 'page' : undefined}
              className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                isActive(link.id)
                  ? 'text-engine underline decoration-engine decoration-2 underline-offset-[6px]'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            onClick={() => window.__openPalette?.()}
            className="hidden md:flex items-center gap-2 h-9 px-3 rounded-lg border border-border-subtle bg-bg-secondary text-text-muted hover:text-text-secondary hover:border-border-strong transition-all cursor-pointer"
            title="Rechercher (⌘K)"
            aria-label="Ouvrir la palette de commandes"
          >
            <Search className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm font-medium">Rechercher</span>
            <kbd className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded border border-border-subtle bg-bg-primary">
              ⌘K
            </kbd>
          </button>

          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all cursor-pointer"
            title={theme === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre'}
            aria-label={theme === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
          </button>

          {user && (
            <button
              onClick={handleLogout}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-danger hover:text-danger hover:bg-danger-wash transition-all cursor-pointer"
              title="Se déconnecter"
              aria-label="Se déconnecter"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
            </button>
          )}

          {/* CTA principal */}
          <button
            onClick={() => navigate(user ? 'dashboard' : 'auth')}
            className="hidden sm:flex items-center gap-2 h-10 px-5 chamfer-sm bg-engine text-on-accent text-sm font-bold transition-colors hover:bg-engine-deep cursor-pointer"
          >
            {user ? 'Mon dashboard' : 'Connexion'}
            {!user && <ArrowUpRight className="w-4 h-4" aria-hidden="true" />}
            {user && unreadCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-ember text-on-accent text-xs font-extrabold">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {user && (
            <div className="hidden sm:block">
              <RoleBadge
                role={user.role}
                variant="pill"
                className="text-xs uppercase tracking-wide font-bold px-2.5 py-1 rounded-full border shrink-0"
              />
            </div>
          )}

          {/* Burger (mobile) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-main-menu"
            aria-label={mobileMenuOpen ? 'Fermer le menu principal' : 'Ouvrir le menu principal'}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all cursor-pointer"
          >
            <X className={`w-4 h-4 transition-transform ${mobileMenuOpen ? 'rotate-90' : 'rotate-0'}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 top-16 bg-bg-primary/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <motion.nav
              id="mobile-main-menu"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden border-b border-border-subtle bg-bg-secondary shadow-xl"
              aria-label="Navigation mobile"
            >
              <div className="px-4 py-3 flex flex-col gap-0.5">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => { navigate(link.id); setMobileMenuOpen(false) }}
                    aria-current={isActive(link.id) ? 'page' : undefined}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                      isActive(link.id)
                        ? 'bg-engine-wash border border-engine/25 text-engine'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary border border-transparent'
                    }`}
                  >
                    {link.label}
                  </button>
                ))}

                <div className="h-px bg-border-subtle my-2" />

                <button
                  onClick={() => { navigate(user ? 'dashboard' : 'auth'); setMobileMenuOpen(false) }}
                  className="w-full h-11 px-3 chamfer-sm bg-engine text-on-accent text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  {user ? 'Mon dashboard' : 'Connexion'}
                  {user && (
                    <RoleBadge
                      role={user.role}
                      variant="pill"
                      className="text-xs uppercase tracking-wide font-bold px-2.5 py-0.5 rounded-full border shrink-0 bg-bg-tertiary border-border-strong"
                    />
                  )}
                </button>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
