import { useEffect, useState, useCallback } from 'react'
import { Search, Sun, Moon, Bell } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { SidebarTrigger } from '@/components/ui/sidebar.jsx'
import NotificationsModal from './NotificationsModal.jsx'
import { useTheme } from '../../context/useTheme.js'
import { api } from '../../services/api.js'

const BREADCRUMB_MAP = {
  dashboard: 'Mon Espace',
  profile: 'Mon Espace',
  'researcher-profile-edit': 'Mon Espace',
  admin: 'Gouvernance',
  gouvernance: 'Gouvernance',
  'espace-cite': 'Gouvernance',
  soutiens: 'Gouvernance',
  projects: 'Recherche & R&D',
  'project-detail': 'Recherche & R&D',
  clubs: 'Recherche & R&D',
  'club-detail': 'Recherche & R&D',
  workshops: 'Recherche & R&D',
  opportunities: 'Recherche & R&D',
  news: 'Communauté',
  'news-detail': 'Communauté',
  events: 'Communauté',
  challenges: 'Communauté',
  researchers: 'Communauté',
  contact: 'Support',
  'student-portal': 'Portail',
}

const PAGE_TITLES = {
  dashboard: 'Tableau de bord',
  profile: 'Mon profil',
  'researcher-profile-edit': 'Édition du profil',
  admin: 'Administration',
  projects: 'Projets', 'project-detail': 'Projet',
  clubs: 'CITE', 'club-detail': 'Club',
  workshops: 'Formations',
  opportunities: 'Opportunités',
  news: 'Actualités', 'news-detail': 'Article',
  events: 'Événements',
  researchers: 'Annuaire des chercheurs',
  cite: 'Gouvernance', 'cite-integration': 'Gouvernance',
  contact: 'Aide & Contact',
  'student-portal': 'Portail étudiant',
  home: 'Accueil',
  challenges: 'Challenges & Hackathons',
  soutiens: 'Soutiens & Trésorerie',
  'espace-cite': 'Mon espace CITE',
  gouvernance: 'Exclusions & Attestations',
  paf: 'PAF',
}

/**
 * SiteHeader — barre supérieure de l'espace connecté (SidebarInset).
 * Bascule le tiroir/replie la sidebar (SidebarTrigger), fil d'Ariane,
 * recherche (⌘K), thème et notifications.
 */
export default function SiteHeader({ currentPage, navigate, user }) {
  const { theme, toggleTheme } = useTheme()
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifOpen, setNotifOpen] = useState(false)

  const loadUnread = useCallback(async () => {
    try {
      if (!user) { setUnreadCount(0); return }
      const res = await api.dashboard.getNotifications()
      if (res?.success) {
        setUnreadCount((res.data || []).filter((n) => !n.read).length)
      }
    } catch { /* silencieux */ }
  }, [user])

  useEffect(() => {
    let mounted = true
    const run = async () => { if (mounted) await loadUnread() }
    run()
    const onUpdate = () => { void loadUnread() }
    if (typeof window !== 'undefined') {
      window.addEventListener('fieri:notifications:updated', onUpdate)
    }
    return () => {
      mounted = false
      if (typeof window !== 'undefined') {
        window.removeEventListener('fieri:notifications:updated', onUpdate)
      }
    }
  }, [loadUnread])

  const title = PAGE_TITLES[currentPage] || 'FIERI Research'
  const section = BREADCRUMB_MAP[currentPage]

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border-subtle bg-bg-primary/85 backdrop-blur-xl px-4 md:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />

        <Breadcrumb className="min-w-0">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <button
                  type="button"
                  onClick={() => navigate('dashboard')}
                  className="cursor-pointer font-semibold text-text-secondary hover:text-engine"
                >
                  FIERI Hub
                </button>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {section && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem className="hidden md:inline-flex">
                  <span className="text-text-muted">{section}</span>
                </BreadcrumbItem>
              </>
            )}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-bold text-text-primary">{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex-1" />

        <button
          onClick={() => window.__openPalette?.()}
          className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border-subtle bg-bg-secondary text-text-muted hover:text-text-secondary hover:border-border-strong transition-all cursor-pointer"
          title="Rechercher (⌘K)"
          aria-label="Ouvrir la recherche"
        >
          <Search className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline text-[13px] font-medium">Rechercher…</span>
          <kbd className="hidden md:inline text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded border border-border-subtle bg-bg-primary">⌘K</kbd>
        </button>

        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary border border-transparent hover:border-border-subtle transition-all cursor-pointer"
          title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          aria-label={theme === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
        </button>

        <button
          onClick={() => setNotifOpen(true)}
          className="relative w-9 h-9 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary border border-transparent hover:border-border-subtle transition-all cursor-pointer"
          title="Notifications"
          aria-label={unreadCount > 0 ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}` : 'Notifications'}
        >
          <Bell className="w-4 h-4" aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-ember text-white text-[11px] font-extrabold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </header>

      <NotificationsModal
        open={notifOpen}
        onClose={() => { setNotifOpen(false); loadUnread() }}
        navigate={navigate}
      />
    </>
  );
}
