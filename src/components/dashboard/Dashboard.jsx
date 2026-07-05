import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Users, BookOpen, Calendar, ArrowRight, Award,
  ChevronRight, Cpu, Zap, Leaf, Building2, Brain, Rocket, Bell
} from 'lucide-react'
import NotificationsCenter from './NotificationsCenter.jsx'
import { api } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'

const CLUB_ICONS = {
  'club-1': { icon: Cpu,       color: '#e05a2b' },
  'club-2': { icon: Zap,       color: '#1b6fd8' },
  'club-3': { icon: Leaf,      color: '#10b981' },
  'club-4': { icon: Building2, color: '#f5a623' },
  'club-5': { icon: Brain,     color: '#8b5cf6' },
  'club-6': { icon: Rocket,    color: '#ec4899' },
}

function StatCard({ label, value, icon: Icon, color, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="glass-panel rounded-2xl p-5 border border-white/5 bg-[#0d1120]/60 backdrop-blur-xl flex flex-col gap-3 cursor-pointer group"
    >
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}1A`, border: `1px solid ${color}35` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-text-secondary group-hover:translate-x-0.5 transition-all" />
      </div>
      <div>
        <div className="text-2xl font-black text-text-primary">{value}</div>
        <div className="text-[11px] font-semibold text-text-muted mt-0.5">{label}</div>
      </div>
    </motion.div>
  )
}

export default function Dashboard({ navigate }) {
  const { user, isResearcher } = useAuth()
  const userId = user?.id ?? null

  // Le backend /dashboard/me ne renvoie que des COMPTEURS (pas la liste des clubs
  // rejoints) : on affiche donc les compteurs, et la section « Mes Clubs » se
  // dégrade en résumé (pas de cartes détaillées faute d'endpoint dédié).
  const [joinedClubs] = useState([])
  const [clubsCount, setClubsCount]         = useState(0)
  const [workshopsCount, setWorkshopsCount] = useState(0)
  const [projectsCount, setProjectsCount]   = useState(0)
  const [notifications, setNotifications]   = useState([])

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
        setNotifications(notifRes.data.filter(n => !n.read))
      }
    } catch { /* pas de notifications si l'appel échoue */ }
  }, [userId, user])

  useEffect(() => {
    loadData()
  }, [loadData])

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Chercheur'

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Colonne principale ── */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* En-tête de bienvenue */}
          <div className="glass-panel rounded-3xl p-8 border border-white/5 bg-[#0d1120]/60 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-fieri-blue/5 blur-[80px] rounded-full pointer-events-none" />
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-fieri-blue mb-1">Tableau de bord</p>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
                    Bonjour, {fullName.split(' ')[0]} 👋
                  </h1>
                  <p className="text-xs text-text-secondary mt-1">
                    {isResearcher?.() ? 'Profil Chercheur · FIERI Research' : 'Membre · FIERI Research'}
                  </p>
                </div>
                {isResearcher?.() && (
                  <button
                    onClick={() => navigate?.('researcher-profile-edit')}
                    className="shrink-0 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-text-secondary hover:bg-white/10 transition-all"
                  >
                    Modifier mon profil
                  </button>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-fieri-blue/8 border border-fieri-blue/20 text-xs">
                  <Bell className="w-4 h-4 text-fieri-blue shrink-0" />
                  <span className="text-text-secondary">
                    Vous avez{' '}
                    <strong className="text-fieri-blue">{notifications.length} notification{notifications.length > 1 ? 's' : ''}</strong>{' '}
                    non lue{notifications.length > 1 ? 's' : ''}.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              label="Clubs rejoints"
              value={clubsCount}
              icon={Users}
              color="#1b6fd8"
              onClick={() => navigate?.('clubs')}
            />
            <StatCard
              label="Ateliers inscrits"
              value={workshopsCount}
              icon={BookOpen}
              color="#10b981"
              onClick={() => navigate?.('workshops')}
            />
            <StatCard
              label="Projets suivis"
              value={projectsCount}
              icon={Award}
              color="#f5a623"
              onClick={() => navigate?.('projects')}
            />
          </div>

          {/* ── Section Mes Clubs ── */}
          <div className="glass-panel rounded-3xl p-6 border border-white/5 bg-[#0d1120]/60 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-fieri-blue" />
                <h2 className="text-base font-extrabold text-text-primary tracking-tight">Mes Clubs</h2>
              </div>
              <button
                onClick={() => navigate?.('clubs')}
                className="flex items-center gap-1 text-[11px] font-bold text-fieri-blue hover:text-fieri-blue/80 transition-colors"
              >
                Voir tout <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {joinedClubs.length === 0 ? (
              <div className="text-center py-10 flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center">
                  <Users className="w-5 h-5 text-text-muted" />
                </div>
                <p className="text-sm text-text-secondary">
                  {clubsCount > 0
                    ? `Vous êtes membre de ${clubsCount} club${clubsCount > 1 ? 's' : ''}.`
                    : "Vous n'avez pas encore rejoint de club."}
                </p>
                <button
                  onClick={() => navigate?.('clubs')}
                  className="px-4 py-2 rounded-xl bg-fieri-blue text-white text-xs font-bold hover:bg-fieri-blue/90 transition-all"
                >
                  {clubsCount > 0 ? 'Voir mes clubs' : 'Explorer les clubs'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {joinedClubs.map((club, i) => {
                  const meta = CLUB_ICONS[club.id] || { icon: Zap, color: '#1b6fd8' }
                  const Icon = meta.icon
                  return (
                    <motion.div
                      key={club.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-center gap-3 p-4 rounded-2xl border hover:bg-white/5 transition-all cursor-pointer group"
                      style={{
                        background: `${meta.color}08`,
                        borderColor: `${meta.color}28`,
                      }}
                      onClick={() => navigate?.('clubs')}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${meta.color}1A`, border: `1px solid ${meta.color}40` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: meta.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-text-primary truncate">{club.kicker}</p>
                        <p className="text-[10px] text-text-muted">{club.membersCount?.toLocaleString('fr-FR')} membres</p>
                      </div>
                      <div
                        className="text-[9px] font-black px-2 py-0.5 rounded-full"
                        style={{ background: `${meta.color}1A`, color: meta.color }}
                      >
                        Membre
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── Accès rapide ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Événements', icon: Calendar, page: 'events', color: '#f5a623' },
              { label: 'Opportunités', icon: Award, page: 'opportunities', color: '#8b5cf6' },
              { label: 'Portail Étudiant', icon: BookOpen, page: 'student-portal', color: '#10b981' },
            ].map(({ label, icon: Icon, page, color }) => (
              <button
                key={page}
                onClick={() => navigate?.(page)}
                className="flex items-center gap-3 p-4 rounded-2xl border border-white/8 bg-white/3 hover:bg-white/8 transition-all text-left group"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <span className="text-xs font-bold text-text-secondary group-hover:text-text-primary transition-colors">{label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-text-muted ml-auto group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
          </div>
        </div>

        {/* ── Colonne latérale : Notifications ── */}
        <aside className="lg:col-span-1">
          <NotificationsCenter navigate={navigate} onDataChange={loadData} />
        </aside>

      </div>
    </div>
  )
}
