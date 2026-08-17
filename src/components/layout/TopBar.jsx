// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState, useCallback, useRef } from 'react'
import {
  Menu,
  Search,
  Sun,
  Moon,
  Bell,
  User,
  ChevronDown,
  LogOut,
  Shield,
  ShieldCheck,
  HeartHandshake,
  LayoutList,
  Edit3,

} from 'lucide-react'
import RoleBadge from '../RoleBadge.jsx'
import NotificationsModal from './NotificationsModal.jsx'
import { useTheme } from '../../context/useTheme.js'
import { useAuth } from '../../context/AuthContext.jsx'
import api from '../../services/api.js'

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

// Libellés lisibles pour la barre supérieure (titre de la section courante).
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
 * TopBar — barre supérieure de l'espace connecté (app-shell).
 * Contient : ouverture menu (mobile), titre de section, recherche (⌘K),
 * thème, notifications et le Badge de Rôle + Menu Utilisateur Interactif.
 */
export default function TopBar({ currentPage, navigate, user, handleLogout, collapsed, onOpenMobile }) {
  const { theme, toggleTheme } = useTheme()
  const { can, isAnyClubResponsible, isChefUniversitaire, isTreasurer, isSecretary, logout } = useAuth()
  
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifOpen, setNotifOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Disconnect handler fallback
  const onLogout = handleLogout || logout

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadUnread = useCallback(async () => {
    try {
      if (!user) { setUnreadCount(0); return }
      const res = await api.dashboard.getNotifications()
      if (res?.success) {
        setUnreadCount((res.data || []).filter(n => !n.read).length)
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
  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase() || 'U'

  // Role permissions
  const userRole = user?.role?.toUpperCase() || 'ETUDIANT'
  const isResponsable = isAnyClubResponsible?.() || userRole === 'RESPONSABLE'
  const isAdminUser = can('admin:access')
  const isChef = isChefUniversitaire?.()
  const isTreas = isTreasurer?.()
  const isSec = isSecretary?.()

  return (
    <>
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

          {/* Fil d'Ariane & Titre de section */}
          <div className="flex items-center gap-2 text-xs text-text-muted min-w-0">
            <span 
              onClick={() => navigate('dashboard')}
              className="hidden sm:inline-block font-bold text-text-secondary hover:text-fieri-blue cursor-pointer transition-colors"
            >
              FIERI Hub
            </span>
            <span className="hidden sm:inline-block text-text-muted/60">/</span>
            {BREADCRUMB_MAP[currentPage] && (
              <>
                <span className="hidden md:inline-block font-medium text-text-muted">{BREADCRUMB_MAP[currentPage]}</span>
                <span className="hidden md:inline-block text-text-muted/60">/</span>
              </>
            )}
            <h1 className="text-xs sm:text-sm font-black text-text-primary tracking-tight truncate">{title}</h1>
          </div>

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
            onClick={() => setNotifOpen(true)}
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

          {/* ─────────────────────────── BADGE DE RÔLE ET DROPDOWN INTERACTIF (HAUT DROITE) ─────────────────────────── */}
          <div
            ref={menuRef}
            className="relative"
            onMouseEnter={() => setUserMenuOpen(true)}
            onMouseLeave={() => setUserMenuOpen(false)}
          >
            <button
              onClick={() => setUserMenuOpen(prev => !prev)}
              className="flex items-center gap-2 py-1 px-2 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer"
              aria-expanded={userMenuOpen}
              aria-label="Menu du rôle et profil utilisateur"
            >
              {/* Avatar Pictogramme */}
              <div className="w-8 h-8 rounded-full bg-fieri-blue/20 border border-fieri-blue/40 flex items-center justify-center shrink-0 shadow-md">
                <span className="text-white font-black text-[11px]">
                  {initials}
                </span>
              </div>

              {/* Badge de Rôle Principal (Visible en permanence dans le header à droite) */}
              <div className="hidden sm:flex flex-col items-start text-left">
                <RoleBadge
                  role={user?.role}
                  variant="pill"
                  className="text-[8.5px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full border shrink-0"
                />
              </div>

              <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${userMenuOpen ? 'rotate-180 text-fieri-blue' : ''}`} />
            </button>

            {/* Menu Déroulant (Survol / Clic) */}
            {userMenuOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-72 glass-panel rounded-3xl p-4 border border-white/10 shadow-2xl bg-bg-secondary/95 backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                {/* Entête Utilisateur & Badges de Rôle */}
                <div className="p-3 bg-white/3 border border-white/5 rounded-2xl mb-3 flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-fieri-blue/20 border border-fieri-blue/40 flex items-center justify-center shrink-0">
                      <span className="text-fieri-blue font-black text-sm">{initials}</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-black text-text-primary truncate">
                        {user?.firstName} {user?.lastName}
                      </span>
                      <span className="text-[10px] font-medium text-text-muted truncate">
                        {user?.email}
                      </span>
                    </div>
                  </div>

                  {/* Badges de Spécification des Rôles */}
                  <div className="flex flex-wrap gap-1.5 pt-1 border-t border-white/5 mt-1">
                    <RoleBadge
                      role={user?.role}
                      variant="text"
                      className="text-[9px] uppercase tracking-wider font-black"
                    />
                    {isChef && (
                      <span className="text-[8.5px] font-black uppercase text-cyan-300 bg-cyan-500/15 px-2 py-0.5 rounded-md border border-cyan-500/30">
                        Chef Univ.
                      </span>
                    )}
                    {isSec && (
                      <span className="text-[8.5px] font-black uppercase text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30">
                        Secrétaire (Trésorerie & Rapports)
                      </span>
                    )}
                    {isTreas && !isSec && (
                      <span className="text-[8.5px] font-black uppercase text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30">
                        Trésorier
                      </span>
                    )}
                  </div>
                </div>

                {/* Liens Connexes au Rôle */}
                <div className="space-y-1">
                  <span className="px-2 text-[9px] font-black uppercase tracking-widest text-text-muted">
                    Accès Privilégiés & Rôle
                  </span>

                  {/* Mon Profil */}
                  <button
                    onClick={() => { navigate('profile', { researcherId: 'me' }); setUserMenuOpen(false); }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-white/5 flex items-center gap-2.5 transition-colors text-left cursor-pointer"
                  >
                    <User className="w-4 h-4 text-fieri-blue" />
                    <span>Mon Profil</span>
                  </button>

                  {/* Éditer mon profil */}
                  <button
                    onClick={() => { navigate('profile', { researcherId: 'me' }); setUserMenuOpen(false); }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-white/5 flex items-center gap-2.5 transition-colors text-left cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4 text-violet-400" />
                    <span>Éditer mes informations</span>
                  </button>

                  {/* Mon Espace CITE */}
                  {(isResponsable || isSec) && (
                    <button
                      onClick={() => { navigate('espace-cite'); setUserMenuOpen(false); }}
                      className="w-full px-3 py-2 rounded-xl text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-white/5 flex items-center gap-2.5 transition-colors text-left cursor-pointer"
                    >
                      <LayoutList className="w-4 h-4 text-emerald-400" />
                      <span>Mon Espace CITE (Rapports & Club)</span>
                    </button>
                  )}

                  {/* Soutiens & Trésorerie */}
                  {(isResponsable || isTreas || isSec || isChef || isAdminUser) && (
                    <button
                      onClick={() => { navigate('soutiens'); setUserMenuOpen(false); }}
                      className="w-full px-3 py-2 rounded-xl text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-white/5 flex items-center gap-2.5 transition-colors text-left cursor-pointer"
                    >
                      <HeartHandshake className="w-4 h-4 text-amber-400" />
                      <span>Soutiens & Trésorerie</span>
                    </button>
                  )}

                  {/* Gouvernance / Exclusions / Validation des Rapports */}
                  {(isAdminUser || isChef) && (
                    <button
                      onClick={() => { navigate('gouvernance'); setUserMenuOpen(false); }}
                      className="w-full px-3 py-2 rounded-xl text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-white/5 flex items-center gap-2.5 transition-colors text-left cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      <span>Gouvernance & Validation</span>
                    </button>
                  )}

                  {/* Console d'Administration */}
                  {isAdminUser && (
                    <button
                      onClick={() => { navigate('admin'); setUserMenuOpen(false); }}
                      className="w-full px-3 py-2 rounded-xl text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-white/5 flex items-center gap-2.5 transition-colors text-left cursor-pointer"
                    >
                      <Shield className="w-4 h-4 text-rose-400" />
                      <span>Console d'Administration</span>
                    </button>
                  )}
                </div>

                <div className="h-px bg-white/5 my-2" />

                {/* Déconnexion */}
                <button
                  onClick={() => { onLogout?.(); setUserMenuOpen(false); }}
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Se déconnecter</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal de notifications (slide-in panel) */}
      <NotificationsModal
        open={notifOpen}
        onClose={() => { setNotifOpen(false); loadUnread() }}
        navigate={navigate}
      />
    </>
  )
}
