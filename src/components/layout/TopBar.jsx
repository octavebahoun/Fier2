import { useEffect, useState } from 'react'
import { Menu, Search, Sun, Moon, Bell } from 'lucide-react'
import RoleBadge from '../RoleBadge.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import api from '../../services/api.js'

// Libellés lisibles pour la barre supérieure (titre de la section courante).
const PAGE_TITLES = {
  dashboard: 'Tableau de bord',
  profile: 'Mon profil',
  'researcher-profile-edit': 'Édition du profil',
  admin: 'Administration',
  projects: 'Projets', 'project-detail': 'Projet',
  clubs: 'Clubs', 'club-detail': 'Club',
  workshops: 'Formations',
  opportunities: 'Opportunités',
  news: 'Actualités', 'news-detail': 'Article',
  events: 'Événements',
  researchers: 'Annuaire des chercheurs',
  cite: 'La Cité', 'cite-integration': 'La Cité',
  contact: 'Aide & Contact',
  'student-portal': 'Portail étudiant',
  home: 'Accueil',
}

/**
 * TopBar — barre supérieure fine de l'espace connecté (app-shell).
 * Décalée à droite de la sidebar. Contient : ouverture menu (mobile), titre de
 * section, recherche (palette ⌘K), thème, notifications et pastille de rôle.
 */
export default function TopBar({ currentPage, navigate, user, collapsed, onOpenMobile }) {
  const { theme, toggleTheme } = useTheme()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    let mounted = true
    const loadUnread = async () => {
      try {
        if (!user) { setUnreadCount(0); return }
        const res = await api.dashboard.getNotifications()
        if (mounted && res?.success) {
          setUnreadCount((res.data || []).filter(n => !n.read).length)
        }
      } catch { /* silencieux */ }
    }
    const onUpdate = () => { void loadUnread() }
    loadUnread()
    if (typeof window !== 'undefined') {
      window.addEventListener('fieri:notifications:updated', onUpdate)
    }
    return () => {
      mounted = false
      if (typeof window !== 'undefined') {
        window.removeEventListener('fieri:notifications:updated', onUpdate)
      }
    }
  }, [user])

  const title = PAGE_TITLES[currentPage] || 'FIERI Research'

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-30 h-16 bg-bg-secondary/85 backdrop-blur-xl border-b border-border-subtle
        transition-[padding] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${collapsed ? 'md:pl-[76px]' : 'md:pl-64'}`}
    >
      <div className="h-full flex items-center gap-3 px-4 md:px-6">
        {/* Ouverture du menu (mobile) */}
        <button
          onClick={onOpenMobile}
          className="md:hidden p-2 -ml-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all cursor-pointer"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Titre de section */}
        <h1 className="text-sm font-extrabold text-text-primary tracking-tight truncate">{title}</h1>

        <div className="flex-1" />

        {/* Recherche / palette de commandes */}
        <button
          onClick={() => window.__openPalette?.()}
          className="flex items-center gap-2 h-9 px-3 rounded-xl border border-border-subtle bg-bg-primary/40 text-text-muted hover:text-text-secondary hover:border-accent-primary/40 transition-all cursor-pointer"
          title="Rechercher (⌘K)"
          aria-label="Ouvrir la recherche"
        >
          <Search className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="hidden sm:inline text-[11px] font-semibold">Rechercher…</span>
          <kbd className="hidden md:inline text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/5 border border-border-subtle">⌘K</kbd>
        </button>

        {/* Thème */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 border border-transparent hover:border-border-subtle transition-all cursor-pointer"
          title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          aria-label={theme === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigate('dashboard')}
          className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 border border-transparent hover:border-border-subtle transition-all cursor-pointer"
          title="Notifications"
          aria-label={unreadCount > 0 ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}` : 'Notifications'}
        >
          <Bell className="w-4 h-4" aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-accent-secondary text-white text-[9px] font-black">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Pastille de rôle (identité rapide) */}
        <button
          onClick={() => navigate('dashboard')}
          className="flex items-center gap-2 pl-1.5 cursor-pointer"
          title={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()}
          aria-label="Ouvrir le tableau de bord"
        >
          <div className="w-8 h-8 rounded-full bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center shrink-0">
            <span className="text-text-primary font-bold text-[11px]">
              {`${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase() || 'U'}
            </span>
          </div>
          <RoleBadge
            role={user?.role}
            variant="pill"
            className="hidden sm:inline text-[8.5px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full border shrink-0"
          />
        </button>
      </div>
    </header>
  )
}
