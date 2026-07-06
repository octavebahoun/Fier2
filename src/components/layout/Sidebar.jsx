import React, { useMemo } from 'react'
import {
  LayoutDashboard,
  UserRound,
  FolderGit2,
  Users,
  GraduationCap,
  Briefcase,
  Newspaper,
  CalendarDays,
  Contact,
  Building2,
  Shield,
  LifeBuoy,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  X
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import RoleBadge from '../RoleBadge.jsx'

// Mappe les pages « détail » vers l'item de menu parent pour l'état actif.
const ACTIVE_ALIAS = {
  'project-detail': 'projects',
  'club-detail': 'clubs',
  'news-detail': 'news',
  'cite-integration': 'cite',
  'student-portal': 'dashboard',
  'researcher-profile-edit': 'profile',
}

/**
 * Sidebar — navigation PRINCIPALE de l'espace connecté (app-shell).
 * Regroupe les sections et n'affiche que ce à quoi l'utilisateur a droit :
 * une capacité absente = un item (voire un groupe entier) INVISIBLE.
 * La visibilité vient exclusivement de `can()` / `hasMinRole()` — aucun rôle en dur.
 */
export default function Sidebar({
  currentPage,
  navigate,
  user,
  handleLogout,
  collapsed = false,
  setCollapsed,
  mobileOpen = false,
  setMobileOpen
}) {
  const { can, hasMinRole } = useAuth()

  // Sections groupées. `show` porte le contrôle d'accès ; un groupe sans item
  // visible n'est pas rendu du tout (ex. « Administration » pour un non-admin).
  const groups = useMemo(() => ([
    {
      label: 'Mon espace',
      items: [
        { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, show: true },
        { id: 'profile', label: 'Mon profil', icon: UserRound, params: { researcherId: 'me' }, show: hasMinRole('CHERCHEUR') },
      ],
    },
    {
      label: 'Recherche',
      items: [
        { id: 'projects', label: 'Projets', icon: FolderGit2, show: true },
        { id: 'clubs', label: 'Clubs', icon: Users, show: true },
        { id: 'workshops', label: 'Formations', icon: GraduationCap, show: true },
        { id: 'opportunities', label: 'Opportunités', icon: Briefcase, show: true },
      ],
    },
    {
      label: 'Communauté',
      items: [
        { id: 'news', label: 'Actualités', icon: Newspaper, show: true },
        { id: 'events', label: 'Événements', icon: CalendarDays, show: true },
        { id: 'researchers', label: 'Annuaire', icon: Contact, show: true },
        { id: 'cite', label: 'La Cité', icon: Building2, show: true },
      ],
    },
    {
      label: 'Administration',
      items: [
        { id: 'admin', label: 'Console admin', icon: Shield, show: can('admin:access') },
      ],
    },
  ].map(g => ({ ...g, items: g.items.filter(i => i.show) }))
    .filter(g => g.items.length > 0)), [can, hasMinRole])

  const isActive = (id) => currentPage === id || ACTIVE_ALIAS[currentPage] === id

  const go = (item) => {
    navigate(item.id, item.params || {})
    setMobileOpen?.(false)
  }

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase() || 'U'

  return (
    <>
      {/* Backdrop (mobile uniquement) */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen?.(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col bg-bg-secondary/95 backdrop-blur-xl border-r border-border-subtle h-screen select-none pointer-events-auto
          transition-[width,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${collapsed ? 'w-[76px]' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        aria-label="Navigation principale"
      >
        {/* Glow décoratif */}
        <div className="absolute top-1/4 left-0 w-full h-1/2 pointer-events-none bg-accent-primary/5 blur-[40px] z-0" />

        {/* En-tête : marque + toggle */}
        <div className="relative z-10 flex items-center justify-between h-16 px-4 shrink-0 border-b border-border-subtle/60">
          <button
            onClick={() => navigate('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group min-w-0"
            title="Tableau de bord"
          >
            <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg bg-accent-primary/20 border border-accent-primary/40 group-hover:border-fieri-blue/60 transition-colors">
              <span className="text-fieri-blue text-xs font-black">F</span>
            </div>
            {!collapsed && (
              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-text-primary truncate">FIERI Hub</span>
            )}
          </button>

          {/* Fermer (mobile) */}
          <button
            onClick={() => setMobileOpen?.(false)}
            className="md:hidden p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-all cursor-pointer"
            aria-label="Fermer le menu"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Replier / déplier (desktop) */}
          {!collapsed && (
            <button
              onClick={() => setCollapsed?.(true)}
              className="hidden md:flex p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-all cursor-pointer"
              title="Replier la barre"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Bloc utilisateur */}
        <div className={`relative z-10 shrink-0 border-b border-border-subtle/50 ${collapsed ? 'px-2 py-3' : 'px-4 py-3.5'}`}>
          <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 shrink-0 rounded-full bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center">
              <span className="text-text-primary font-bold text-xs">{initials}</span>
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-text-primary truncate">
                  {user?.firstName} {user?.lastName}
                </span>
                <RoleBadge
                  role={user?.role}
                  variant="text"
                  className="text-[8.5px] uppercase tracking-wider font-extrabold self-start"
                />
              </div>
            )}
          </div>
        </div>

        {/* Navigation groupée */}
        <nav className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden py-3 px-2.5 flex flex-col gap-4">
          {groups.map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              {!collapsed && (
                <span className="px-2.5 mb-0.5 text-[9px] font-black uppercase tracking-[0.2em] text-text-muted/70">
                  {group.label}
                </span>
              )}
              {group.items.map((item) => {
                const Icon = item.icon
                const active = isActive(item.id)
                return (
                  <button
                    key={item.id}
                    onClick={() => go(item)}
                    title={collapsed ? item.label : undefined}
                    className={`relative w-full h-9 rounded-lg flex items-center transition-all duration-200 cursor-pointer
                      ${collapsed ? 'justify-center px-0' : 'px-2.5 gap-3'}
                      ${active
                        ? 'bg-accent-primary/20 border border-accent-primary/30 text-text-primary'
                        : 'border border-transparent text-text-secondary hover:text-text-primary hover:bg-white/5'}`}
                  >
                    <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-fieri-blue' : ''}`} />
                    {!collapsed && (
                      <span className="text-xs font-semibold tracking-wide whitespace-nowrap truncate">{item.label}</span>
                    )}
                    {active && (
                      <span className={`absolute rounded-full bg-accent-secondary shadow-[0_0_8px_rgba(245,166,35,0.7)] ${
                        collapsed ? 'top-1.5 right-1.5 w-1.5 h-1.5' : 'right-2.5 w-1.5 h-1.5'
                      }`} />
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Pied : aide, déplier, déconnexion */}
        <div className="relative z-10 shrink-0 border-t border-border-subtle/60 p-2.5 flex flex-col gap-1">
          <button
            onClick={() => go({ id: 'contact' })}
            title={collapsed ? 'Aide & Contact' : undefined}
            className={`w-full h-9 rounded-lg flex items-center transition-all cursor-pointer text-text-secondary hover:text-text-primary hover:bg-white/5 border border-transparent
              ${collapsed ? 'justify-center px-0' : 'px-2.5 gap-3'}`}
          >
            <LifeBuoy className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span className="text-xs font-semibold tracking-wide">Aide & Contact</span>}
          </button>

          {collapsed && (
            <button
              onClick={() => setCollapsed?.(false)}
              title="Déplier la barre"
              className="hidden md:flex w-full h-9 rounded-lg items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/5 border border-transparent transition-all cursor-pointer"
            >
              <ChevronsRight className="w-[18px] h-[18px]" />
            </button>
          )}

          <button
            onClick={handleLogout}
            title={collapsed ? 'Se déconnecter' : undefined}
            className={`w-full h-9 rounded-lg flex items-center transition-all cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20
              ${collapsed ? 'justify-center px-0' : 'px-2.5 gap-3'}`}
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span className="text-xs font-semibold tracking-wide">Déconnexion</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
