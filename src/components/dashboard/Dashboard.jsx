import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Users, BookOpen, Calendar, ArrowRight, Award,
  ChevronRight, Cpu, Zap, Leaf, Building2, Brain, Rocket, Bell,
  Shield, Briefcase, PenSquare, UserCog, Lock, FolderGit2, GraduationCap
} from 'lucide-react'
import { api } from '../../services/api.js'
import { useAuth, getRolePresentation } from '../../context/AuthContext.jsx'

const mix = (color, pct) => `color-mix(in srgb, ${color} ${pct}, transparent)`;

const CLUB_ICONS = {
  'club-1': { icon: Cpu,       color: 'var(--color-ember)' },
  'club-2': { icon: Zap,       color: 'var(--color-engine)' },
  'club-3': { icon: Leaf,      color: 'var(--color-engine)' },
  'club-4': { icon: Building2, color: 'var(--color-ember)' },
  'club-5': { icon: Brain,     color: 'var(--color-engine)' },
  'club-6': { icon: Rocket,    color: 'var(--color-ember)' },
}

function StatCard({ label, value, icon: Icon, color, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="glass-panel chamfer-sm p-5 flex flex-col gap-3 cursor-pointer group"
    >
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: mix(color, '10%'), border: `1px solid ${mix(color, '21%')}` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-text-secondary group-hover:translate-x-0.5 transition-all" />
      </div>
      <div>
        <div className="text-2xl font-extrabold text-text-primary font-mono">{value}</div>
        <div className="eyebrow mt-0.5">{label}</div>
      </div>
    </motion.div>
  )
}

/**
 * Dashboard — tableau de bord post-connexion.
 *
 * ── REFONTE v2 ──
 * • Les notifications ne sont PLUS incrustées ici (elles sont dans la modal TopBar).
 * • Le layout est désormais pleine largeur (1 colonne, pas 2/3 + 1/3).
 * • Les « Actions privilégiées » ne s'affichent QUE si l'utilisateur en a vraiment.
 * • L'accès rapide s'adapte au rôle (pas de liens inutiles pour un étudiant simple).
 */
export default function Dashboard({ navigate }) {
  const { user, isResearcher, isAdmin, isMentor, isAnyClubResponsible } = useAuth()

  const isChercheur = isResearcher?.()
  const isAdminUser = isAdmin?.()
  const isResponsable = isAnyClubResponsible?.()

  // Actions réservées selon le rôle — chaque entrée n'apparaît que si `show` est vrai.
  const privilegedActions = [
    { show: isAdminUser, label: 'Administration', desc: 'Gérer la plateforme et les membres', icon: Shield, color: 'var(--color-ember)', page: 'admin' },
    { show: isAdminUser, label: 'Modérer les actualités', desc: 'Approuver ou rejeter les articles', icon: PenSquare, color: 'var(--color-engine)', page: 'news' },
    { show: isChercheur, label: 'Publier une opportunité', desc: 'Diffuser une offre R&D', icon: Briefcase, color: 'var(--color-engine)', page: 'opportunities' },
    { show: isChercheur, label: 'Rédiger un article', desc: 'Soumettre au journal scientifique', icon: PenSquare, color: 'var(--color-engine)', page: 'news' },
    { show: isChercheur, label: 'Éditer ma fiche chercheur', desc: 'Bio, spécialités, portfolio', icon: UserCog, color: 'var(--color-engine)', page: 'researcher-profile-edit' },
    { show: isMentor?.() || isResponsable, label: 'Gérer les adhésions', desc: 'Valider les demandes de club', icon: Users, color: 'var(--color-ember)', page: 'clubs' },
  ].filter(a => a.show)

  const rolePres = getRolePresentation(user?.role)

  // Le backend /dashboard/me ne renvoie que des COMPTEURS (pas la liste des clubs
  // rejoints) : on affiche donc les compteurs, et la section « Mes Clubs » se
  // dégrade en résumé (pas de cartes détaillées faute d'endpoint dédié).
  const [joinedClubs] = useState([])
  const [clubsCount, setClubsCount]         = useState(0)
  const [workshopsCount, setWorkshopsCount] = useState(0)
  const [projectsCount, setProjectsCount]   = useState(0)
  const [notifCount, setNotifCount]         = useState(0)

  const loadData = useCallback(async () => {
    try {
      const statsRes = await api.dashboard.getStats()
      if (statsRes?.success && statsRes.data) {
        const d = statsRes.data
        setClubsCount(d.joinedClubsCount ?? d.clubsCount ?? 0)
        setWorkshopsCount(d.registeredWorkshopsCount ?? d.workshopsCount ?? 0)
        setProjectsCount(d.starredProjectsCount ?? d.projectsCount ?? 0)
      }
    } catch { /* compteurs laissés à 0 en cas d'erreur backend */ }

    try {
      const notifRes = await api.dashboard.getNotifications()
      if (notifRes?.success && Array.isArray(notifRes.data)) {
        setNotifCount(notifRes.data.filter(n => !n.read).length)
      }
    } catch { /* pas de notifications si l'appel échoue */ }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Membre'

  // Accès rapide — adapté au rôle
  const quickLinks = [
    { label: 'Événements', icon: Calendar, page: 'events', color: 'var(--color-ember)', show: true },
    { label: 'Formations', icon: GraduationCap, page: 'workshops', color: 'var(--color-engine)', show: true },
    { label: 'Opportunités', icon: Award, page: 'opportunities', color: 'var(--color-engine)', show: isChercheur },
    { label: 'Projets', icon: FolderGit2, page: 'projects', color: 'var(--color-ember)', show: isChercheur },
    { label: 'Portail Étudiant', icon: BookOpen, page: 'student-portal', color: 'var(--color-engine)', show: !isChercheur },
  ].filter(l => l.show)

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-12 py-10">
      <div className="flex flex-col gap-6">

        {/* ── En-tête de bienvenue ── */}
        <div className="glass-panel chamfer p-8 relative overflow-hidden">
          <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <span className="eyebrow flex items-center gap-3">
                  <span className="w-8 h-px bg-ember inline-block" aria-hidden="true" />
                  Tableau de bord
                </span>
                <h1 className="mt-3 text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight font-display">
                  Bonjour, {fullName.split(' ')[0]}
                </h1>
                <p className="text-xs text-text-secondary mt-1">
                  {isChercheur ? 'Profil Chercheur · FIERI Research' : 'Membre · FIERI Research'}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[11px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full border ${rolePres.badgeClassName}`}>
                  {rolePres.label}
                </span>
                {isChercheur && (
                  <button
                    onClick={() => navigate?.('researcher-profile-edit')}
                    className="px-4 py-2 chamfer-sm bg-bg-tertiary border border-border-subtle text-xs font-bold text-text-secondary hover:text-text-primary hover:border-border-strong transition-all cursor-pointer"
                  >
                    Modifier mon profil
                  </button>
                )}
              </div>
            </div>

            {notifCount > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-engine/8 border border-engine/20 text-xs">
                <Bell className="w-4 h-4 text-engine shrink-0" />
                <span className="text-text-secondary">
                  Vous avez{' '}
                  <strong className="text-engine">{notifCount} notification{notifCount > 1 ? 's' : ''}</strong>{' '}
                  non lue{notifCount > 1 ? 's' : ''} — cliquez sur la cloche pour les consulter.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Stats rapides ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard
            label="CITE rejointes"
            value={clubsCount}
            icon={Users}
            color="var(--color-engine)"
            onClick={() => navigate?.('clubs')}
          />
          <StatCard
            label="Ateliers inscrits"
            value={workshopsCount}
            icon={BookOpen}
            color="var(--color-emerald-500)"
            onClick={() => navigate?.('workshops')}
          />
          <StatCard
            label="Projets suivis"
            value={projectsCount}
            icon={Award}
            color="var(--color-ember)"
            onClick={() => navigate?.('projects')}
          />
        </div>

        {/* ── Actions privilégiées (SEULEMENT si le rôle en a) ── */}
        {privilegedActions.length > 0 && (
          <div className="glass-panel chamfer p-6">
            <div className="flex items-center gap-2.5 mb-1">
              <Lock className="w-4 h-4 text-engine" />
              <h2 className="text-base font-extrabold text-text-primary tracking-tight font-display">Actions privilégiées</h2>
            </div>
            <p className="text-xs text-text-muted mb-4">Actions réservées à votre rôle sur la plateforme.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {privilegedActions.map(({ label, desc, icon: Icon, color, page }) => (
                <button
                  key={label + page}
                  onClick={() => navigate?.(page)}
                  className="flex items-center gap-3 p-4 rounded-lg border transition-all text-left group hover:-translate-y-0.5 cursor-pointer"
                  style={{ background: mix(color, '5%'), borderColor: mix(color, '19%') }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: mix(color, '10%'), border: `1px solid ${mix(color, '25%')}` }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-text-primary">{label}</p>
                    <p className="text-[11px] text-text-muted">{desc}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Section Mes Clubs ── */}
        <div className="glass-panel chamfer p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-engine" />
              <h2 className="text-base font-extrabold text-text-primary tracking-tight font-display">Mes CITE</h2>
            </div>
            <button
              onClick={() => navigate?.('clubs')}
              className="flex items-center gap-1 text-[11px] font-bold text-engine hover:text-engine/80 transition-colors cursor-pointer"
            >
              Voir tout <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {joinedClubs.length === 0 ? (
            <div className="text-center py-10 flex flex-col items-center gap-3">
              <div className="w-12 h-12 chamfer-sm bg-bg-tertiary border border-border-subtle flex items-center justify-center">
                <Users className="w-5 h-5 text-text-muted" />
              </div>
              <p className="text-sm text-text-secondary">
                {clubsCount > 0
                  ? `Vous êtes membre de ${clubsCount} club${clubsCount > 1 ? 's' : ''}.`
                  : "Vous n'avez pas encore rejoint de club."}
              </p>
              <button
                onClick={() => navigate?.('clubs')}
                className="px-4 py-2 chamfer-sm bg-engine text-white text-xs font-bold hover:bg-engine-deep transition-all cursor-pointer"
              >
                {clubsCount > 0 ? 'Voir mes clubs' : 'Explorer les clubs'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {joinedClubs.map((club, i) => {
                const meta = CLUB_ICONS[club.id] || { icon: Zap, color: 'var(--color-engine)' }
                const Icon = meta.icon
                return (
                  <motion.div
                    key={club.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-3 p-4 rounded-lg border hover:bg-bg-tertiary transition-all cursor-pointer group"
                    style={{
                      background: mix(meta.color, '3%'),
                      borderColor: mix(meta.color, '16%'),
                    }}
                    onClick={() => navigate?.('clubs')}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: mix(meta.color, '10%'), border: `1px solid ${mix(meta.color, '25%')}` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: meta.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-text-primary truncate">{club.kicker}</p>
                      <p className="text-[11px] text-text-muted">{club.membersCount?.toLocaleString('fr-FR')} membres</p>
                    </div>
                    <div
                      className="text-[11px] font-extrabold px-2 py-0.5 rounded-full"
                      style={{ background: mix(meta.color, '10%'), color: meta.color }}
                    >
                      Membre
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Accès rapide (adapté au rôle) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickLinks.map(({ label, icon: Icon, page, color }) => (
            <button
              key={page}
              onClick={() => navigate?.(page)}
              className="flex items-center gap-3 p-4 chamfer-sm border border-border-subtle bg-bg-secondary hover:border-border-strong transition-all text-left group cursor-pointer"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: mix(color, '9%'), border: `1px solid ${mix(color, '19%')}` }}
              >
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <span className="text-xs font-bold text-text-secondary group-hover:text-text-primary transition-colors">{label}</span>
              <ArrowRight className="w-3.5 h-3.5 text-text-muted ml-auto group-hover:translate-x-0.5 transition-transform" />
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}
