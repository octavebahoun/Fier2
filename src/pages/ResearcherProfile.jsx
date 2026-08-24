// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  BookOpen,
  Users,
  Award,
  CheckCircle,
  Lock,
  ExternalLink,
  Star,
  Activity,
  Heart,
  Globe,
  Briefcase,
  Newspaper,
  ShieldCheck,
  GraduationCap,
  Microscope,
  UserCheck,
  Edit3,
  X,
  Save,
  Check,
  Zap,
  FileText
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useAuthGate } from '../context/AuthGateContext.jsx'
import { api } from '../services/api.js'

// ─────────────────────────── Toast Notification Component ───────────────────────────
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  const bgClass = type === 'success' 
    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
    : 'bg-red-500/10 border-red-500/30 text-red-400'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 chamfer-sm shadow-2xl backdrop-blur-md border ${bgClass}`}
      role="alert"
      aria-live="polite"
    >
      <CheckCircle className="w-5 h-5 shrink-0" />
      <span className="text-sm font-bold">{message}</span>
    </motion.div>
  )
}

// ─────────────────────────── Helper: Dynamic Role Configuration Matrix ───────────────────────────
function getRoleBadgeConfig(researcher, currentUser) {
  const isOwn = !researcher?.id || researcher?.id === currentUser?.id || researcher?.email === currentUser?.email || researcher?.isMe || researcher?.roleTitle === currentUser?.role
  
  const roleUpper = String((isOwn && currentUser?.role) || researcher?.role || currentUser?.role || '').toUpperCase()
  const cPost = String((isOwn && currentUser?.countryPost?.post) || researcher?.countryPost || currentUser?.countryPost || '').toUpperCase()
  const uPost = String((isOwn && currentUser?.universityPost?.post) || researcher?.universityPost || currentUser?.universityPost || '').toUpperCase()

  if (roleUpper === 'ADMIN' || cPost.includes('ADMIN') || cPost.includes('PRESIDENT')) {
    return {
      category: 'ADMINISTRATION FIERI',
      title: 'SUPER ADMINISTRATEUR & BUREAU EXÉCUTIF',
      badgeClass: 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
      gradientGlow: 'from-amber-500/20 via-purple-600/15 to-engine/20',
      icon: ShieldCheck,
      iconColor: 'text-amber-400',
      responsibilities: [
        'Supervision globale de la gouvernance et de l\'intégrité du réseau FIERI',
        'Validation et agrément officiel des nouveaux clubs et pôles de recherche',
        'Nomination des Chefs Universitaires et des Responsables Nationaux',
        'Arbitrage budgétaire, modération et gestion des accès privilégiés RBAC'
      ],
      capabilities: [
        'Accès administrateur complet au Back-Office FIERI',
        'Modération globale des membres, publications et événements',
        'Validation des propositions de projets R&D stratégiques',
        'Gestion des droits, promotion et rétrogradation des membres'
      ]
    }
  }

  if (roleUpper === 'CHEF_UNIVERSITAIRE' || uPost.includes('CHEF') || uPost.includes('RECTEUR') || uPost.includes('DIRECTEUR')) {
    return {
      category: 'GOUVERNANCE LOCALE',
      title: 'CHEF D\'ÉTABLISSEMENT UNIVERSITAIRE',
      badgeClass: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]',
      gradientGlow: 'from-cyan-500/20 via-indigo-600/15 to-engine/20',
      icon: GraduationCap,
      iconColor: 'text-cyan-400',
      responsibilities: [
        'Direction stratégique et supervision de la gouvernance locale sur le campus',
        'Validation des dossiers d\'intégration des clubs universitaires',
        'Supervision des budgets d\'équipement et des événements scientifiques du campus',
        'Représentation institutionnelle de l\'Université au sein de la Cité FIERI'
      ],
      capabilities: [
        'Supervision de tous les Pôles R&D et Clubs de l\'Université',
        'Émission d\'attestations et certifications académiques pour les étudiants',
        'Approbation des demandes de financement et matériel R&D local',
        'Validation et diffusion des actualités scientifiques du campus'
      ]
    }
  }

  if (roleUpper === 'RESPONSABLE' || roleUpper.includes('RESPONSABLE')) {
    return {
      category: 'DIRECTION TECHNIQUE',
      title: 'RESPONSABLE DE PÔLE DE RECHERCHE & CLUB',
      badgeClass: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
      gradientGlow: 'from-emerald-500/20 via-teal-600/15 to-engine/20',
      icon: Award,
      iconColor: 'text-emerald-400',
      responsibilities: [
        'Pilotage de la feuille de route scientifique et des objectifs techniques du pôle',
        'Encadrement de l\'équipe d\'étudiants chercheurs et répartition des travaux',
        'Suivi du budget R&D du club et gestion du matériel d\'expérimentation',
        'Organisation des démonstrations techniques et ateliers pratiques'
      ],
      capabilities: [
        'Gestion de l\'effectif et validation des adhésions au pôle',
        'Création, mise à jour et suivi des projets R&D du club',
        'Publication d\'articles de recherche et bilans techniques',
        'Validation de la présence des membres aux ateliers scientifiques'
      ]
    }
  }

  if (roleUpper === 'CHERCHEUR' || roleUpper.includes('CHERCHEUR')) {
    return {
      category: 'RECHERCHE APPLIQUÉE',
      title: 'ÉTIUDIANT CHERCHEUR ACCRÉDITÉ R&D',
      badgeClass: 'bg-violet-500/15 border-violet-500/40 text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.2)]',
      gradientGlow: 'from-engine/20 via-engine/10 to-engine/20',
      icon: Microscope,
      iconColor: 'text-violet-400',
      responsibilities: [
        'Conduite de travaux de recherche appliquée et expérimentations en laboratoire',
        'Développement de prototypes physiques et algorithmes spécialisés',
        'Rédaction de papiers scientifiques et livrables de recherche',
        'Mentorat technique et accompagnement des membres étudiants'
      ],
      capabilities: [
        'Soumission et direction de projets de recherche R&D',
        'Publication d\'articles dans le Journal Scientifique FIERI',
        'Soumission de demandes de soutien matériel et financier R&D',
        'Présentation des prototypes aux symposia et compétitions'
      ]
    }
  }

  // Default: ETUDIANT
  return {
    category: 'COMMUNAUTÉ ÉTUDIANTE',
    title: 'MEMBRE ÉTUDIANT ACADÉMIQUE',
    badgeClass: 'bg-sky-500/15 border-sky-500/40 text-sky-300 shadow-[0_0_15px_rgba(14,165,233,0.2)]',
    gradientGlow: 'from-sky-500/20 via-blue-600/15 to-engine/20',
    icon: UserCheck,
    iconColor: 'text-sky-400',
    responsibilities: [
      'Participation active aux projets, ateliers et hackathons du club',
      'Acquisition progressive de compétences scientifiques et techniques',
      'Contribution aux livrables collectifs et travaux pratiques',
      'Respect des règles de gouvernance et de la charte de la Cité'
    ],
    capabilities: [
      'Adhésion aux clubs et pôles de recherche de son université',
      'Inscription prioritaire aux ateliers et formations scientifiques',
      'Accès au catalogue des projets et actualités de la Cité',
      'Candidature aux opportunités de stages et bourses R&D'
    ]
  }
}

// ─────────────────────────── Skeleton Loading Component ───────────────────────────
function ProfileSkeleton() {
  return (
    <motion.div
      animate={{ opacity: [0.3, 0.7, 0.3] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      className="max-w-[88rem] mx-auto w-full py-24 px-6 md:px-12 lg:px-12 flex flex-col gap-12"
    >
      <div className="h-10 bg-bg-tertiary rounded-xl w-36" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="glass-panel chamfer p-8 flex flex-col md:flex-row gap-8 border border-border-subtle">
            <div className="w-32 h-32 chamfer bg-bg-tertiary shrink-0" />
            <div className="flex flex-col gap-4 flex-grow justify-center">
              <div className="h-7 bg-bg-tertiary rounded-md w-1/2" />
              <div className="h-4 bg-bg-tertiary rounded-md w-1/3" />
              <div className="h-4 bg-bg-tertiary rounded-md w-2/3" />
            </div>
          </div>
          <div className="glass-panel chamfer p-8 flex flex-col gap-4 border border-border-subtle">
            <div className="h-6 bg-bg-tertiary rounded-md w-1/4" />
            <div className="space-y-2">
              <div className="h-4 bg-bg-tertiary rounded-md w-full" />
              <div className="h-4 bg-bg-tertiary rounded-md w-5/6" />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-8">
          <div className="glass-panel chamfer p-8 flex flex-col gap-6 border border-border-subtle">
            <div className="h-6 bg-bg-tertiary rounded-md w-1/2 mx-auto" />
            <div className="h-10 bg-bg-tertiary chamfer-sm w-full" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─────────────────────────── Main Researcher Profile Page ───────────────────────────
export default function ResearcherProfile({ navigate, researcherId }) {
  const { user, can } = useAuth()
  const { promptLogin } = useAuthGate()
  const [researcher, setResearcher] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [followLoading, setFollowLoading] = useState(false)
  const [toast, setToast] = useState(null)

  // Profile Edit Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editSaving, setEditSaving] = useState(false)
  const [editValues, setEditValues] = useState({
    name: '',
    email: '',
    university: '',
    roleTitle: '',
    bio: '',
    specialties: '',
    avatar: '',
    portfolioUrl: '',
    cvUrl: ''
  })

  // Fetch researcher details
  useEffect(() => {
    let active = true
    const fetchProfile = async () => {
      if (!researcherId) {
        setError("Identifiant chercheur manquant.")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const res = researcherId === 'me'
          ? await api.researchers.getMe()
          : await api.researchers.getById(researcherId)
          
        if (active) {
          if (res.success && res.data) {
            const data = res.data
            setResearcher(data)
            setFollowersCount(data.followersCount ?? data.stars ?? 0)
            setIsFollowing(false)
            setError(null)

            // Populate edit values
            setEditValues({
              name: data.name || '',
              email: data.email || user?.email || '',
              university: data.university || '',
              roleTitle: data.role || '',
              bio: data.bio || '',
              specialties: Array.isArray(data.specialties) ? data.specialties.join(', ') : (data.specialties || ''),
              avatar: data.avatar || '',
              portfolioUrl: data.portfolioUrl || '',
              cvUrl: data.cvUrl || ''
            })
          } else {
            setError(res.message || "Impossible de charger le profil.")
          }
        }
      } catch (err) {
        if (active) {
          setError("Une erreur de communication est survenue lors de la récupération du profil.")
          console.error(err)
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    fetchProfile()
    return () => {
      active = false
    }
  }, [researcherId, user])

  // Handle follow / unfollow action
  const handleFollowToggle = async () => {
    if (!user) { promptLogin('Connectez-vous pour suivre ce chercheur.'); return }
    if (followLoading) return

    setFollowLoading(true)
    try {
      const res = await api.researchers.toggleFollow(researcher.id, user.id)
      if (res.success && res.data) {
        const nextFollowing = !isFollowing
        setIsFollowing(nextFollowing)
        setFollowersCount(c => nextFollowing ? c + 1 : Math.max(0, c - 1))
        setToast(
          nextFollowing 
            ? `Vous suivez désormais ${researcher.name} !` 
            : `Vous ne suivez plus ${researcher.name}.`
        )
      } else {
        setToast("Erreur lors de la mise à jour de l'abonnement.")
      }
    } catch (err) {
      console.error(err)
      setToast("Une erreur réseau est survenue.")
    } finally {
      setFollowLoading(false)
    }
  }

  // Check if current user has edit rights for this profile
  const isOwnProfile = user && researcher && (
    String(researcher.id) === String(user.id) || 
    researcherId === 'me' || 
    String(user.email || '').toLowerCase() === String(researcher.email || '').toLowerCase()
  )
  // « ADMINISTRATEUR » n'a jamais existé côté backend (constat F05).
  const canEdit = (isOwnProfile && can('profile:editOwn')) || can('admin:access')

  // Save profile changes via inline modal
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (editSaving) return
    setEditSaving(true)

    try {
      const payload = {
        name: editValues.name.trim(),
        email: editValues.email.trim(),
        university: editValues.university.trim(),
        role: editValues.roleTitle.trim(),
        bio: editValues.bio,
        specialties: editValues.specialties
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
        avatarUrl: editValues.avatar.trim(),
        portfolioUrl: editValues.portfolioUrl.trim(),
        cvUrl: editValues.cvUrl.trim()
      }

      const res = await api.researchers.updateMe(payload)
      if (res?.success || res?.data) {
        const updated = res.data || { ...researcher, ...payload, avatar: payload.avatarUrl }
        setResearcher(updated)
        setIsEditModalOpen(false)
        setToast("Profil mis à jour avec succès !")
      } else {
        setToast(res?.message || "Erreur lors de la mise à jour du profil.")
      }
    } catch (err) {
      console.error(err)
      setToast("Une erreur s'est produite lors de l'enregistrement.")
    } finally {
      setEditSaving(false)
    }
  }

  // Publications list from real researcher data
  const publications = researcher?.publications || []

  // Role Configuration
  const roleConfig = researcher ? getRoleBadgeConfig(researcher, user) : null
  const RoleIcon = roleConfig?.icon || Award

  return (
    <div className="max-w-[88rem] mx-auto w-full py-24 px-6 md:px-12 lg:px-12 relative min-h-screen">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {isLoading ? (
          <motion.div key="profile-skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ProfileSkeleton />
          </motion.div>
        ) : error || !researcher ? (
          <motion.div
            key="profile-error"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto w-full py-32 px-6 flex flex-col items-center justify-center text-center gap-8"
          >
            <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-400">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-extrabold tracking-tight text-text-primary">Profil Inaccessible</h2>
              <p className="text-sm text-text-secondary max-w-md">
                {error || "Ce profil n'est pas accessible dans l'annuaire FIERI."}
              </p>
            </div>
            <button
              onClick={() => navigate('researchers')}
              className="px-6 py-3 chamfer-sm text-xs font-bold text-white bg-engine hover:bg-engine/90 shadow-lg cursor-pointer flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retourner à l'annuaire
            </button>
          </motion.div>
        ) : (
          /* Page wrapper */
          <motion.div
            key="profile-content"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-10"
          >
            {/* Top Bar Navigation & Edit Trigger */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => navigate('researchers')}
                  className="group flex items-center gap-2 text-xs font-extrabold tracking-widest uppercase text-text-muted hover:text-engine transition-colors cursor-pointer w-fit"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Retour à l'annuaire
                </button>
                <div className="flex items-center gap-2.5 mt-1">
                  <span className="text-[11px] font-extrabold tracking-[0.25em] uppercase text-engine">
                    {roleConfig.category}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-engine/30" />
                  <span className="text-[11px] font-bold text-text-muted uppercase">
                    {researcher.pole || 'Pôle R&D'}
                  </span>
                </div>
              </div>

              {/* Direct Profile Edit Button */}
              {canEdit && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-5 py-3 chamfer-sm bg-engine/15 hover:bg-engine border border-engine/30 hover:border-engine text-engine hover:text-white font-extrabold text-xs tracking-wide transition-all shadow-lg hover:shadow-[0_0_20px_rgba(108,76,241,0.3)] flex items-center justify-center gap-2.5 cursor-pointer shrink-0"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Modifier mon profil</span>
                </button>
              )}
            </div>

            {/* Main Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* LEFT COLUMN: Main Profile Info & Role Matrix (Spans 2 columns) */}
              <div className="lg:col-span-2 flex flex-col gap-8">
                
                {/* 1. Header Identity Bento Cell with Custom Role Glow */}
                <div className="glass-panel chamfer p-8 md:p-10 flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden border border-border-subtle shadow-2xl group">
                  {/* Custom Background Radial Glow according to Role */}
                  <div className={`absolute -inset-px bg-gradient-to-r ${roleConfig.gradientGlow} opacity-60 group-hover:opacity-100 transition-opacity duration-500 chamfer pointer-events-none`} />

                  {/* Photo Avatar */}
                  <div className="relative shrink-0 z-10">
                    <img
                      src={researcher.avatar}
                      alt={researcher.name}
                      className="w-32 h-32 md:w-36 md:h-36 chamfer object-cover border-2 border-white/15 shadow-2xl"
                    />
                    <span className="absolute -bottom-2 -right-2 p-2 chamfer-sm bg-bg-secondary border border-border-subtle shadow-lg">
                      <RoleIcon className={`w-5 h-5 ${roleConfig.iconColor}`} />
                    </span>
                  </div>

                  {/* Bio Meta & Badges */}
                  <div className="flex flex-col gap-4 text-center md:text-left flex-grow z-10">
                    <div className="space-y-2">
                      {/* Role Badge Pill */}
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-extrabold uppercase tracking-wider border ${roleConfig.badgeClass}`}>
                          <RoleIcon className="w-3.5 h-3.5" />
                          {roleConfig.title}
                        </span>
                        {isOwnProfile && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                            Votre Compte
                          </span>
                        )}
                      </div>

                      <h1 className="text-2xl md:text-4xl font-extrabold text-text-primary tracking-tight">
                        {researcher.name}
                      </h1>
                      <p className="text-sm font-bold text-engine tracking-wide">
                        {researcher.role || roleConfig.shortRole}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 text-xs text-text-secondary font-medium">
                      <div className="flex items-center gap-2 justify-center md:justify-start">
                        <Briefcase className="w-4 h-4 text-text-muted shrink-0" />
                        <span>{researcher.university || 'Université d\'Abomey-Calavi (EPAC)'}</span>
                      </div>
                      <div className="flex items-center gap-2 justify-center md:justify-start">
                        <Globe className="w-4 h-4 text-text-muted shrink-0" />
                        <span className="capitalize">{researcher.pole || 'Pôle R&D'}</span>
                      </div>
                    </div>

                    {/* Specialties Tags */}
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-2">
                      {researcher.specialties?.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-bold text-text-primary bg-bg-tertiary border border-border-subtle px-3 py-1 rounded-xl shadow-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. SPECIFIC ROLE MATRIX BENTO CELL (Attributions & Prérogatives) */}
                <div className="glass-panel chamfer p-8 md:p-10 border border-border-subtle shadow-xl relative flex flex-col gap-6 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-extrabold tracking-tight text-text-primary flex items-center gap-2.5">
                      <ShieldCheck className={`w-5 h-5 ${roleConfig.iconColor}`} />
                      Attributions & Prérogatives du Rôle
                    </h2>
                    <span className={`text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-lg border ${roleConfig.badgeClass}`}>
                      Accréditation FIERI
                    </span>
                  </div>

                  <div className="h-px bg-bg-tertiary w-full" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Responsabilités Clés */}
                    <div className="space-y-4 bg-bg-secondary border border-border-subtle p-5 chamfer-sm">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-muted flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        Missions & Responsabilités
                      </h3>
                      <ul className="space-y-2.5">
                        {roleConfig.responsibilities.map((resp, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-text-secondary font-medium leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Fonctionnalités & Capacités Actives */}
                    <div className="space-y-4 bg-bg-secondary border border-border-subtle p-5 chamfer-sm">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-muted flex items-center gap-2">
                        <Zap className="w-4 h-4 text-engine" />
                        Capacités & Habilitations Plateforme
                      </h3>
                      <ul className="space-y-2.5">
                        {roleConfig.capabilities.map((cap, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-text-secondary font-medium leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-engine mt-1.5 shrink-0" />
                            <span>{cap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 3. Biography Bento Cell */}
                <div className="glass-panel chamfer p-8 md:p-10 border border-border-subtle shadow-lg relative flex flex-col gap-5">
                  <h2 className="text-lg font-extrabold tracking-tight text-text-primary flex items-center gap-2">
                    <Activity className="w-5 h-5 text-engine" />
                    Biographie & Orientation R&D
                  </h2>
                  <div className="h-px bg-bg-tertiary w-full" />
                  <p className="text-sm text-text-secondary leading-relaxed font-medium">
                    {researcher.bio || "Aucune biographie rédigée. Ce membre participe activement aux projets et initiatives scientifiques au sein de l'alliance FIERI."}
                  </p>
                </div>
                
              </div>

              {/* RIGHT COLUMN: Follow Status, Stats & Links */}
              <div className="flex flex-col gap-8">
                
                {/* 1. Subscription Actions Bento Cell */}
                <div className="glass-panel chamfer p-8 border border-border-subtle shadow-xl relative flex flex-col gap-6 text-center">
                  <div className="flex flex-col items-center gap-1 relative z-10">
                    <Users className="w-8 h-8 text-engine mb-1" />
                    <span className="text-4xl font-extrabold text-text-primary tracking-tight">
                      {followersCount}
                    </span>
                    <span className="text-xs font-extrabold tracking-widest text-text-muted uppercase">
                      Abonnés FIERI
                    </span>
                  </div>

                  <div className="h-px bg-bg-tertiary w-full my-1" />

                  <div className="relative z-10 flex flex-col gap-3">
                    {isOwnProfile ? (
                      <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="w-full py-3.5 chamfer-sm text-xs font-bold bg-engine/15 border border-engine/30 text-engine hover:bg-engine hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        <Edit3 className="w-4 h-4" />
                        Gérer mon profil
                      </button>
                    ) : user ? (
                      <button
                        onClick={handleFollowToggle}
                        disabled={followLoading}
                        className={`w-full py-3.5 chamfer-sm text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                          isFollowing
                            ? 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400'
                            : 'bg-engine hover:bg-engine/90 text-white shadow-[0_0_20px_rgba(108,76,241,0.3)]'
                        }`}
                      >
                        {followLoading ? (
                          <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                        ) : isFollowing ? (
                          <>
                            <Heart className="w-4 h-4 fill-current" />
                            Se désabonner
                          </>
                        ) : (
                          <>
                            <Heart className="w-4 h-4" />
                            S'abonner
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <button
                          disabled
                          className="w-full py-3.5 chamfer-sm text-xs font-bold bg-bg-tertiary border border-border-subtle text-text-muted opacity-60 flex items-center justify-center gap-2 cursor-not-allowed"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          S'abonner
                        </button>
                        <p className="text-[11px] font-bold text-red-400 bg-red-500/5 border border-red-500/10 py-2 px-3 rounded-xl leading-relaxed">
                          L'abonnement aux flux scientifiques est réservé aux membres connectés de l'alliance FIERI.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Scientific Work Stats Bento Cell */}
                <div className="glass-panel chamfer p-8 border border-border-subtle shadow-lg relative flex flex-col gap-5">
                  <h3 className="text-sm font-extrabold tracking-widest text-text-muted uppercase flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-engine" />
                    Indicateurs Clés
                  </h3>
                  
                  <div className="flex flex-col gap-3.5">
                    <div className="flex justify-between items-center bg-bg-secondary border border-border-subtle p-4 chamfer-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-engine/15 flex items-center justify-center text-engine">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-text-secondary">Publications</span>
                      </div>
                      <span className="text-base font-extrabold text-text-primary">{researcher.publicationsCount || publications.length}</span>
                    </div>

                    <div className="flex justify-between items-center bg-bg-secondary border border-border-subtle p-4 chamfer-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                          <Star className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-text-secondary">Projets R&D</span>
                      </div>
                      <span className="text-base font-extrabold text-text-primary">{researcher.projectsCount || 1}</span>
                    </div>

                    <div className="flex justify-between items-center bg-bg-secondary border border-border-subtle p-4 chamfer-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
                          <Award className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-text-secondary">Votes de confiance</span>
                      </div>
                      <span className="text-base font-extrabold text-text-primary">{researcher.stars || 42}</span>
                    </div>
                  </div>
                </div>

                {/* External links */}
                {(researcher.portfolioUrl || researcher.cvUrl) && (
                  <div className="glass-panel chamfer p-6 border border-border-subtle shadow-lg flex flex-col gap-3">
                    <h3 className="text-xs font-extrabold tracking-wider text-text-muted uppercase mb-1">
                      Liens Externes & Portfolio
                    </h3>
                    {researcher.portfolioUrl && (
                      <a
                        href={researcher.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3.5 rounded-xl bg-bg-secondary hover:bg-bg-tertiary border border-border-subtle text-xs font-bold text-text-primary transition-all group"
                      >
                        <span className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-engine" />
                          Portfolio / Site web
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-text-muted group-hover:text-engine transition-colors" />
                      </a>
                    )}
                    {researcher.cvUrl && (
                      <a
                        href={researcher.cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3.5 rounded-xl bg-bg-secondary hover:bg-bg-tertiary border border-border-subtle text-xs font-bold text-text-primary transition-all group"
                      >
                        <span className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-400" />
                          CV & Portfolio Académique
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-text-muted group-hover:text-emerald-400 transition-colors" />
                      </a>
                    )}
                  </div>
                )}

              </div>

            </div>

            {/* BOTTOM ROW: Scientific Publications Section */}
            {publications.length > 0 && (
              <div className="glass-panel chamfer p-8 md:p-10 border border-border-subtle shadow-xl relative flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-extrabold tracking-tight text-text-primary flex items-center gap-2.5">
                    <Newspaper className="w-5 h-5 text-engine" />
                    Publications Récentes de Recherche
                  </h3>
                  <span className="text-xs font-bold text-text-muted">
                    {publications.length} documents répertoriés
                  </span>
                </div>
                
                <div className="h-px bg-bg-tertiary w-full" />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {publications.map((pub, idx) => (
                    <div
                      key={idx}
                      className="bg-bg-secondary hover:bg-bg-tertiary border border-border-subtle hover:border-engine/20 p-5 chamfer-sm flex flex-col justify-between gap-5 transition-all group/card shadow-sm"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-engine bg-engine/10 px-2 py-0.5 rounded-md border border-engine/10">
                            {pub.year}
                          </span>
                          <span className="text-[11px] font-bold text-text-muted">
                            {pub.citations} Citations
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-text-primary leading-relaxed group-hover/card:text-engine transition-colors">
                          {pub.title}
                        </h4>
                      </div>
                      
                      <div className="flex justify-between items-center gap-2 pt-2 border-t border-border-subtle">
                        <span className="text-[11px] font-medium text-text-secondary truncate pr-3">
                          {pub.journal}
                        </span>
                        <a
                          href={pub.link || "#"}
                          className="text-text-muted hover:text-engine transition-colors cursor-pointer shrink-0"
                          aria-label={`Ouvrir la publication : ${pub.title}`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────── INLINE PROFILE EDIT MODAL ─────────────────────────── */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl glass-panel chamfer border border-border-subtle p-6 md:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto bg-bg-secondary"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-engine/15 border border-engine/30 text-engine">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-text-primary">Modifier mon Profil</h2>
                    <p className="text-xs text-text-secondary">Mettez à jour vos informations publiques et vos préférences</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 rounded-xl bg-bg-secondary hover:bg-bg-tertiary text-text-muted hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Nom complet */}
                  <div className="space-y-2">
                    <label htmlFor="edit-name" className="text-xs font-bold text-text-secondary">Nom complet</label>
                    <input
                      id="edit-name"
                      type="text"
                      required
                      value={editValues.name}
                      onChange={(e) => setEditValues(v => ({ ...v, name: e.target.value }))}
                      className="w-full px-4 py-3 chamfer-sm bg-bg-tertiary border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-engine"
                      placeholder="Ex: Dr. Samuel ADANLOKONON"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="edit-email" className="text-xs font-bold text-text-secondary">Email académique</label>
                    <input
                      id="edit-email"
                      type="email"
                      required
                      value={editValues.email}
                      onChange={(e) => setEditValues(v => ({ ...v, email: e.target.value }))}
                      className="w-full px-4 py-3 chamfer-sm bg-bg-tertiary border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-engine"
                      placeholder="vous@exemple.com"
                    />
                  </div>

                  {/* Université */}
                  <div className="space-y-2">
                    <label htmlFor="edit-university" className="text-xs font-bold text-text-secondary">Université / Établissement</label>
                    <input
                      id="edit-university"
                      type="text"
                      value={editValues.university}
                      onChange={(e) => setEditValues(v => ({ ...v, university: e.target.value }))}
                      className="w-full px-4 py-3 chamfer-sm bg-bg-tertiary border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-engine"
                      placeholder="Ex: Université d'Abomey-Calavi (EPAC)"
                    />
                  </div>

                  {/* Titre / Rôle */}
                  <div className="space-y-2">
                    <label htmlFor="edit-role" className="text-xs font-bold text-text-secondary">Titre / Rôle scientifique</label>
                    <input
                      id="edit-role"
                      type="text"
                      value={editValues.roleTitle}
                      onChange={(e) => setEditValues(v => ({ ...v, roleTitle: e.target.value }))}
                      className="w-full px-4 py-3 chamfer-sm bg-bg-tertiary border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-engine"
                      placeholder="Ex: Responsable du Pôle IA"
                    />
                  </div>

                </div>

                {/* Photo de profil avec Preview */}
                <div className="space-y-2">
                  <label htmlFor="edit-avatar" className="text-xs font-bold text-text-secondary">Photo de profil (URL d'image)</label>
                  <div className="flex items-center gap-4">
                    <img
                      src={editValues.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                      alt="Aperçu"
                      className="w-14 h-14 chamfer-sm object-cover border border-border-subtle shrink-0"
                    />
                    <input
                      id="edit-avatar"
                      type="url"
                      value={editValues.avatar}
                      onChange={(e) => setEditValues(v => ({ ...v, avatar: e.target.value }))}
                      className="w-full px-4 py-3 chamfer-sm bg-bg-tertiary border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-engine"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                </div>

                {/* Spécialités */}
                <div className="space-y-2">
                  <label htmlFor="edit-specialties" className="text-xs font-bold text-text-secondary">Spécialités (séparées par des virgules)</label>
                  <input
                    id="edit-specialties"
                    type="text"
                    value={editValues.specialties}
                    onChange={(e) => setEditValues(v => ({ ...v, specialties: e.target.value }))}
                    className="w-full px-4 py-3 chamfer-sm bg-bg-tertiary border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-engine"
                    placeholder="Deep Learning, ROS 2, Embedded IoT"
                  />
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <label htmlFor="edit-bio" className="text-xs font-bold text-text-secondary">Biographie & Travaux R&D</label>
                  <textarea
                    id="edit-bio"
                    rows={4}
                    value={editValues.bio}
                    onChange={(e) => setEditValues(v => ({ ...v, bio: e.target.value }))}
                    className="w-full px-4 py-3 chamfer-sm bg-bg-tertiary border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-engine resize-none"
                    placeholder="Présentez brièvement vos axes de recherche et contributions..."
                  />
                </div>

                {/* Portfolio & CV */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="edit-portfolio" className="text-xs font-bold text-text-secondary">Site web / Portfolio (URL)</label>
                    <input
                      id="edit-portfolio"
                      type="url"
                      value={editValues.portfolioUrl}
                      onChange={(e) => setEditValues(v => ({ ...v, portfolioUrl: e.target.value }))}
                      className="w-full px-4 py-3 chamfer-sm bg-bg-tertiary border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-engine"
                      placeholder="https://mon-portfolio.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="edit-cv" className="text-xs font-bold text-text-secondary">CV académique (URL)</label>
                    <input
                      id="edit-cv"
                      type="url"
                      value={editValues.cvUrl}
                      onChange={(e) => setEditValues(v => ({ ...v, cvUrl: e.target.value }))}
                      className="w-full px-4 py-3 chamfer-sm bg-bg-tertiary border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-engine"
                      placeholder="https://mon-cv.pdf"
                    />
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-5 py-3 chamfer-sm text-xs font-bold text-text-muted hover:text-white bg-bg-secondary hover:bg-bg-tertiary transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={editSaving}
                    className="px-6 py-3 chamfer-sm text-xs font-extrabold text-white bg-engine hover:bg-engine/90 shadow-lg shadow-engine/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {editSaving ? (
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{editSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
