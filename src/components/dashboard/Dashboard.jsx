import { useEffect, useState, useCallback } from 'react'
import {
  Users, BookOpen, ArrowRight, Award, Bell,
  Shield, ShieldCheck, Briefcase, PenSquare, UserCog, Lock, FolderGit2,
  GraduationCap, LayoutList, Wallet, Calendar,
} from 'lucide-react'
import { api } from '../../services/api.js'
import { useAuth, getRolePresentation, getPostPresentation } from '../../context/AuthContext.jsx'

/**
 * Dashboard — la première chose que voit un membre après s'être connecté.
 *
 * Une seule intention : « où en suis-je, et qu'est-ce que je peux faire ici ».
 * Trois chiffres, les actions que mon rôle autorise vraiment, et des raccourcis.
 *
 * Corrections de la version précédente :
 *
 * • Les compteurs partaient de 0 et le `catch` restait muet : un échec réseau
 *   s'affichait « 0 CITE rejointes », indiscernable d'une réalité. Ils partent
 *   maintenant de `null` et affichent « — » tant qu'on ne sait pas.
 * • 40 lignes de code mort : `joinedClubs` n'était jamais renseigné, la branche
 *   qui dessinait les cartes de club ne pouvait pas s'exécuter — avec sa table
 *   d'icônes et de couleurs inventées par club.
 * • La tuile « Ateliers » pointait sur `--color-emerald-500`, un token qui
 *   n'existe pas : ni icône colorée, ni fond.
 * • Les fonds étaient des `color-mix(… 5%, transparent)` en style inline, soit
 *   1,1:1 — invisibles. Ils passent aux surfaces opaques du système.
 * • Deux actions menaient au mauvais écran depuis le découpage : « Trésorerie »
 *   ouvrait la page PUBLIQUE de dons, et « Rapports » l'accueil du club.
 */

/** Un chiffre qu'on n'a pas su lire ne s'invente pas. */
const chiffre = (v) => (v === null || v === undefined ? '—' : v)

function StatCard({ label, value, icon: Icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="glass-panel chamfer-sm group flex cursor-pointer flex-col gap-3 p-5 text-left transition-colors hover:bg-bg-tertiary"
    >
      <div className="flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center border border-engine bg-engine-wash">
          <Icon className="h-5 w-5 text-engine" aria-hidden="true" />
        </span>
        <ArrowRight
          className="h-4 w-4 text-text-muted transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </div>
      <span>
        <span className="block font-mono text-2xl font-extrabold text-text-primary">{value}</span>
        <span className="eyebrow mt-0.5 block">{label}</span>
      </span>
    </button>
  )
}

function ActionTile({ label, desc, icon: Icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-11 cursor-pointer items-center gap-3 border border-border-strong bg-bg-secondary p-4 text-left transition-colors hover:bg-bg-tertiary"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-engine bg-engine-wash">
        <Icon className="h-5 w-5 text-engine" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-text-primary">{label}</span>
        <span className="block text-sm text-text-muted">{desc}</span>
      </span>
      <ArrowRight
        className="h-4 w-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </button>
  )
}

export default function Dashboard({ navigate }) {
  const { user, can, identity } = useAuth()

  // Les actions listées ici sont exactement celles que l'API acceptera : même
  // table de capacités que la barre latérale et que les gardes de route.
  const privilegedActions = [
    { cap: 'admin:access',       label: 'Console d’administration', desc: 'Membres, rôles et postes de gouvernance', icon: Shield,      page: 'admin' },
    { cap: 'news:moderate',      label: 'Modérer les actualités',   desc: 'Approuver ou rejeter les articles',       icon: PenSquare,   page: 'news' },
    { cap: 'certificate:issue',  label: 'Émettre une attestation',  desc: 'Document officiel signé de l’université', icon: ShieldCheck, page: 'gouvernance' },
    { cap: 'treasury:read',      label: 'Trésorerie',               desc: 'Grand livre et opérations',               icon: Wallet,      page: 'tresorerie' },
    { cap: 'report:read',        label: 'Rapports des clubs',       desc: 'Suivi d’activité de l’université',        icon: LayoutList,  page: 'cite-rapports' },
    { cap: 'report:submit',      label: 'Rapport de mon club',      desc: 'Recensement et activité mensuelle',       icon: LayoutList,  page: 'cite-rapports' },
    { cap: 'membership:review',  label: 'Valider les adhésions',    desc: 'Candidatures en attente de votre club',   icon: Users,       page: 'cite-adhesions' },
    { cap: 'badge:award',        label: 'Attribuer un badge',       desc: 'Distinguer un membre encadré',            icon: Award,       page: 'challenges' },
    { cap: 'opportunity:create', label: 'Publier une opportunité',  desc: 'Diffuser une offre R&D',                  icon: Briefcase,   page: 'opportunities' },
    { cap: 'news:submit',        label: 'Rédiger un article',       desc: 'Soumettre au journal scientifique',       icon: PenSquare,   page: 'news' },
    { cap: 'profile:editOwn',    label: 'Modifier mon profil',      desc: 'Bio, spécialités, portfolio',             icon: UserCog,     page: 'researcher-profile-edit' },
  ].filter((a) => can(a.cap))

  const isChercheur = can('opportunity:create')
  const rolePres = getRolePresentation(identity?.role)
  const postPres = getPostPresentation(identity?.universityPost || identity?.countryPost)

  const [stats, setStats] = useState({ clubs: null, workshops: null, projects: null })
  const [notifCount, setNotifCount] = useState(null)
  const [statsError, setStatsError] = useState(null)

  const loadData = useCallback(async () => {
    setStatsError(null)
    try {
      const res = await api.dashboard.getStats()
      if (!res?.success || !res.data) throw new Error(res?.message)
      const d = res.data
      setStats({
        clubs: d.joinedClubsCount ?? d.clubsCount ?? 0,
        workshops: d.registeredWorkshopsCount ?? d.workshopsCount ?? 0,
        projects: d.starredProjectsCount ?? d.projectsCount ?? 0,
      })
    } catch (err) {
      // Un zéro faux est un mensonge tranquille : on ne l'affiche pas.
      setStats({ clubs: null, workshops: null, projects: null })
      setStatsError(err?.serverMessage || err?.message || 'Vos chiffres n’ont pas pu être chargés.')
    }

    try {
      const res = await api.dashboard.getNotifications()
      setNotifCount(res?.success && Array.isArray(res.data) ? res.data.filter((n) => !n.read).length : null)
    } catch {
      setNotifCount(null)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const prenom = user?.firstName || 'Membre'

  const quickLinks = [
    { label: 'Événements', icon: Calendar, page: 'events', show: true },
    { label: 'Formations', icon: GraduationCap, page: 'workshops', show: true },
    { label: 'Opportunités', icon: Award, page: 'opportunities', show: isChercheur },
    { label: 'Projets', icon: FolderGit2, page: 'projects', show: isChercheur },
    { label: 'Portail Étudiant', icon: BookOpen, page: 'student-portal', show: !isChercheur },
  ].filter((l) => l.show)

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 md:px-6">

      <header className="glass-panel chamfer relative overflow-hidden p-6 md:p-8">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="eyebrow flex items-center gap-3">
                <span className="inline-block h-px w-8 bg-ember" aria-hidden="true" />
                Tableau de bord
              </span>
              <h1 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-text-primary md:text-3xl">
                Bonjour, {prenom}
              </h1>
              <p className="mt-1 text-sm text-text-secondary">
                {isChercheur ? 'Profil Chercheur · FIERI Research' : 'Membre · FIERI Research'}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <span className={`border px-2.5 py-1 text-xs font-extrabold uppercase tracking-wider ${rolePres.badgeClassName}`}>
                {rolePres.label}
              </span>
              {postPres && (
                <span className={`border px-2.5 py-1 text-xs font-extrabold uppercase tracking-wider ${postPres.badgeClassName}`}>
                  {postPres.label}
                </span>
              )}
            </div>
          </div>

          {notifCount > 0 && (
            <p className="flex items-center gap-3 border border-engine bg-engine-wash p-3 text-sm text-text-secondary">
              <Bell className="h-4 w-4 shrink-0 text-engine" aria-hidden="true" />
              <span>
                Vous avez <strong className="text-engine">{notifCount} notification{notifCount > 1 ? 's' : ''}</strong>{' '}
                non lue{notifCount > 1 ? 's' : ''} — la cloche, en haut à droite, les ouvre.
              </span>
            </p>
          )}
        </div>
      </header>

      <section aria-label="Mes chiffres" className="flex flex-col gap-2">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="CITE rejointes" value={chiffre(stats.clubs)} icon={Users} onClick={() => navigate?.('clubs')} />
          <StatCard label="Ateliers inscrits" value={chiffre(stats.workshops)} icon={BookOpen} onClick={() => navigate?.('workshops')} />
          <StatCard label="Projets suivis" value={chiffre(stats.projects)} icon={Award} onClick={() => navigate?.('projects')} />
        </div>
        {statsError && (
          <p className="flex flex-wrap items-center gap-2 border border-warning bg-warning-wash px-3 py-2 text-sm text-text-secondary">
            <span>{statsError}</span>
            <button
              type="button"
              onClick={loadData}
              className="min-h-11 cursor-pointer font-semibold text-warning underline underline-offset-4"
            >
              Réessayer
            </button>
          </p>
        )}
      </section>

      {privilegedActions.length > 0 && (
        <section className="glass-panel chamfer p-6">
          <h2 className="flex items-center gap-2.5 font-display text-base font-extrabold tracking-tight text-text-primary">
            <Lock className="h-4 w-4 text-engine" aria-hidden="true" />
            Actions privilégiées
          </h2>
          <p className="mb-4 mt-1 text-sm text-text-muted">
            Ce que votre rôle vous autorise à faire, et rien d’autre.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {privilegedActions.map(({ label, desc, icon, page }) => (
              <ActionTile key={label} label={label} desc={desc} icon={icon} onClick={() => navigate?.(page)} />
            ))}
          </div>
        </section>
      )}

      <nav aria-label="Accès rapide" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {quickLinks.map(({ label, icon: Icon, page }) => (
          <button
            key={page}
            type="button"
            onClick={() => navigate?.(page)}
            className="chamfer-sm group flex min-h-11 cursor-pointer items-center gap-3 border border-border-strong bg-bg-secondary p-4 text-left transition-colors hover:bg-bg-tertiary"
          >
            <Icon className="h-5 w-5 shrink-0 text-engine" aria-hidden="true" />
            <span className="text-sm font-bold text-text-secondary transition-colors group-hover:text-text-primary">
              {label}
            </span>
            <ArrowRight
              className="ml-auto h-4 w-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </button>
        ))}
      </nav>
    </div>
  )
}
