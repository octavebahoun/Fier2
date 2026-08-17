// eslint-disable-next-line no-unused-vars
import React, { useMemo, useState } from 'react'
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
  Shield,
  Trophy,
  HeartHandshake,
  ShieldCheck,
  LayoutList,
  LifeBuoy,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  X,
  Sparkles,
  Layers,

} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

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
 * Sidebar — navigation ÉPURÉE & ACCORDION EXPANDABLE de l'espace connecté.
 * Les sessions (Communauté, Recherche, Administration) sont désormais des boutons extensibles.
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
  const { can, hasMinRole, isAnyClubResponsible, isChefUniversitaire, isTreasurer, isSecretary } = useAuth()

  // Tracking single open group for accordion behavior (closed by default)
  const [openGroupId, setOpenGroupId] = useState(null)

  const toggleGroup = (groupId) => {
    setOpenGroupId(prev => (prev === groupId ? null : groupId))
  }

  // ── Navigation groupée, filtrée par rôle ──
  const groups = useMemo(() => {
    const userRole = user?.role?.toUpperCase() || 'ETUDIANT'
    const isResponsable = isAnyClubResponsible?.() || userRole === 'RESPONSABLE'
    const isChercheur = hasMinRole('CHERCHEUR')
    const isAdminUser = can('admin:access')
    const canManageGouvernance = isAdminUser || isChefUniversitaire?.()
    const isSecr = isSecretary?.()

    return [
      // 1. Mon Espace
      {
        id: 'Personnel',
        label: 'Mon Espace',
        icon: Sparkles,
        items: [
          { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, show: true },
          { id: 'profile', label: 'Mon profil', icon: UserRound, params: { researcherId: 'me' }, show: isChercheur },
        ],
      },
      // 2. Secrétariat & Gouvernance
      {
        id: 'Gouvernance',
        label: 'Gouvernance & Secrétariat',
        icon: Shield,
        items: [
          { id: 'gouvernance', label: 'Attestations & Exclusions', icon: ShieldCheck, show: canManageGouvernance },
          { id: 'espace-cite', label: 'Secrétariat & Rapports CITE', icon: LayoutList, show: isResponsable || isSecr || isAdminUser },
          { id: 'soutiens', label: 'Soutiens & Trésorerie', icon: HeartHandshake, show: isResponsable || isTreasurer?.() || isSecr || isAdminUser },
          { id: 'admin', label: 'Console globale admin', icon: Shield, show: isAdminUser },
        ],
      },
      // 3. Recherche & Production
      {
        id: 'Recherche',
        label: 'Recherche & R&D',
        icon: Layers,
        items: [
          { id: 'projects', label: 'Projets R&D', icon: FolderGit2, show: isChercheur },
          { id: 'workshops', label: 'Formations & Ateliers', icon: GraduationCap, show: true },
          { id: 'opportunities', label: 'Opportunités Recherche', icon: Briefcase, show: isChercheur },
          { id: 'clubs', label: 'Clubs CITE UAC', icon: Users, show: true },
        ],
      },
      // 4. Communauté & Annuaire
      {
        id: 'Communauté',
        label: 'Communauté & Réseau',
        icon: Users,
        items: [
          { id: 'news', label: 'Actualités', icon: Newspaper, show: true },
          { id: 'events', label: 'Événements', icon: CalendarDays, show: true },
          { id: 'challenges', label: 'Challenges & Hackathons', icon: Trophy, show: isChercheur },
          { id: 'researchers', label: 'Annuaire Chercheurs', icon: Contact, show: true },
        ],
      },
    ]
      .map(g => ({ ...g, items: g.items.filter(i => i.show) }))
      .filter(g => g.items.length > 0)
  }, [can, hasMinRole, user, isAnyClubResponsible, isChefUniversitaire, isTreasurer, isSecretary])

  const isActive = (id) => currentPage === id || ACTIVE_ALIAS[currentPage] === id

  const go = (item) => {
    navigate(item.id, item.params || {})
    setMobileOpen?.(false)
  }

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
        <div className="absolute top-1/4 left-0 w-full h-1/2 pointer-events-none bg-fieri-blue/5 blur-[40px] z-0" />

        {/* En-tête : marque + toggle */}
        <div className="relative z-10 flex items-center justify-between h-16 px-4 shrink-0 border-b border-border-subtle/60">
          <button
            onClick={() => navigate('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group min-w-0"
            title="Tableau de bord"
            aria-label="Aller au tableau de bord"
          >
            <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg bg-fieri-blue/20 border border-fieri-blue/40 group-hover:border-fieri-blue/60 transition-colors shadow-md">
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
              aria-label="Replier la barre latérale"
            >
              <ChevronsLeft className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* ─────────────────────────── NAVIGATION PAR SESSIONS ACCORDÉONS (BOUTONS EXTENSIBLES) ─────────────────────────── */}
        <nav className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden py-5 px-3 flex flex-col gap-6">
          {groups.map((group) => {
            const isOpen = openGroupId === group.id
            const hasActiveChild = group.items.some(i => isActive(i.id))

            return (
              <div key={group.id} className="flex flex-col gap-2">
                
                {/* Session Extensible Button Header (non replié) */}
                {!collapsed ? (
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className={`w-full px-3 py-2 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer rounded-xl border ${
                      hasActiveChild 
                        ? 'text-fieri-blue bg-fieri-blue/10 border-fieri-blue/20 shadow-sm' 
                        : 'text-text-muted hover:text-text-primary bg-white/[0.03] hover:bg-white/[0.07] border-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <group.icon className="w-3.5 h-3.5 text-fieri-blue/80" />
                      <span>{group.label}</span>
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-fieri-blue' : ''}`} />
                  </button>
                ) : (
                  <div className="h-px bg-white/5 my-1" />
                )}

                {/* Contenu de la session (Boutons de navigation) */}
                {(isOpen || collapsed) && (
                  <div className="flex flex-col gap-1.5 pl-1">
                    {group.items.map((item) => {
                      const Icon = item.icon
                      const active = isActive(item.id)
                      return (
                        <button
                          key={item.id}
                          onClick={() => go(item)}
                          title={collapsed ? item.label : undefined}
                          aria-label={collapsed ? item.label : undefined}
                          aria-current={active ? 'page' : undefined}
                          className={`relative w-full h-10 rounded-xl flex items-center transition-all duration-200 cursor-pointer
                            ${collapsed ? 'justify-center px-0' : 'px-3 gap-3'}
                            ${active
                              ? 'bg-fieri-blue/15 border border-fieri-blue/30 text-text-primary shadow-sm font-bold'
                              : 'border border-transparent text-text-secondary hover:text-text-primary hover:bg-white/5 font-medium'}`}
                        >
                          <Icon className={`w-[17px] h-[17px] shrink-0 ${active ? 'text-fieri-blue' : 'text-text-muted'}`} aria-hidden="true" />
                          {!collapsed && (
                            <span className="text-xs tracking-wide whitespace-nowrap truncate">{item.label}</span>
                          )}
                          {active && (
                            <span className={`absolute rounded-full bg-fieri-blue shadow-[0_0_8px_rgba(108,76,241,0.8)] ${
                              collapsed ? 'top-2 right-2 w-1.5 h-1.5' : 'right-3 w-1.5 h-1.5'
                            }`} />
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Pied de Sidebar épuré */}
        <div className="relative z-10 shrink-0 border-t border-border-subtle/60 p-2.5 flex flex-col gap-1">
          <button
            onClick={() => go({ id: 'contact' })}
            title={collapsed ? 'Aide & Contact' : undefined}
            aria-label={collapsed ? 'Aide & Contact' : undefined}
            className={`w-full h-9 rounded-xl flex items-center transition-all cursor-pointer text-text-secondary hover:text-text-primary hover:bg-white/5 border border-transparent
              ${collapsed ? 'justify-center px-0' : 'px-2.5 gap-3'}`}
          >
            <LifeBuoy className="w-[17px] h-[17px] shrink-0 text-text-muted" aria-hidden="true" />
            {!collapsed && <span className="text-xs font-semibold tracking-wide">Aide & Contact</span>}
          </button>

          {collapsed && (
            <button
              onClick={() => setCollapsed?.(false)}
              title="Déplier la barre"
              aria-label="Déplier la barre latérale"
              className="hidden md:flex w-full h-9 rounded-xl items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/5 border border-transparent transition-all cursor-pointer"
            >
              <ChevronsRight className="w-[17px] h-[17px]" aria-hidden="true" />
            </button>
          )}

          <button
            onClick={handleLogout}
            title={collapsed ? 'Se déconnecter' : undefined}
            aria-label={collapsed ? 'Se déconnecter' : undefined}
            className={`w-full h-9 rounded-xl flex items-center transition-all cursor-pointer text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20
              ${collapsed ? 'justify-center px-0' : 'px-2.5 gap-3'}`}
          >
            <LogOut className="w-[17px] h-[17px] shrink-0 text-rose-400" aria-hidden="true" />
            {!collapsed && <span className="text-xs font-semibold tracking-wide">Déconnexion</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
