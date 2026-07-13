// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  BookOpen,
  Users,
  Award,
  CheckCircle,
  Sparkles,
  Lock,
  ExternalLink,
  Star,
  Activity,
  Heart,
  Globe,
  Briefcase,
  Newspaper
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
    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md border ${bgClass}`}
      role="alert"
      aria-live="polite"
    >
      <CheckCircle className="w-5 h-5 shrink-0" />
      <span className="text-sm font-bold">{message}</span>
    </motion.div>
  )
}

// ─────────────────────────── Mock Publications Data ───────────────────────────
const MOCK_PUBLICATIONS = {
  r1: [
    {
      title: "Optimisation du SLAM visuel monoculaire pour la navigation autonome en intérieur",
      journal: "Revue Africaine d'Automatique et Robotique",
      year: "2025",
      citations: 28
    },
    {
      title: "Intégration hybride ROS/AI dans la cartographie d'environnements texturés et changeants",
      journal: "IEEE Xplore Fieri Symposium",
      year: "2026",
      citations: 12
    },
    {
      title: "Robotique mobile et souveraineté logicielle : Enjeux industriels en Afrique de l'Ouest",
      journal: "Working Paper FIERI",
      year: "2024",
      citations: 45
    }
  ],
  r2: [
    {
      title: "Réseaux de capteurs LoRaWAN auto-alimentés en milieu tropical : Analyse de résilience",
      journal: "Journal of IoT & Cyber-Physical Systems",
      year: "2025",
      citations: 94
    },
    {
      title: "Protocole MAC à faible consommation d'énergie pour la télédétection des micro-climats",
      journal: "International Conference on Embedded Networks",
      year: "2026",
      citations: 37
    },
    {
      title: "IoT et Agriculture de précision : Conception d'un gateway multicouche autonome",
      journal: "FIERI Journal of Applied Science",
      year: "2024",
      citations: 82
    }
  ],
  r3: [
    {
      title: "Deep Learning compressé pour la vision embarquée (Edge AI) : Comparaison d'architectures",
      journal: "Revue de l'Intelligence Artificielle FIERI",
      year: "2025",
      citations: 18
    },
    {
      title: "Détection précoce des pathologies foliaires par réseaux de neurones convolutifs légers",
      journal: "Symposium Africain sur les Sciences de l'IA",
      year: "2026",
      citations: 9
    },
    {
      title: "Traitement d'images satellitaires haute résolution : Analyse du stress hydrique périphérique",
      journal: "Journal de Vision Appliquée",
      year: "2024",
      citations: 31
    }
  ]
}

// ─────────────────────────── Skeleton Loading Component ───────────────────────────
function ProfileSkeleton() {
  return (
    <motion.div
      animate={{ opacity: [0.3, 0.7, 0.3] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      className="max-w-[88rem] mx-auto w-full py-24 px-6 md:px-12 lg:px-12 flex flex-col gap-12"
    >
      {/* Back button */}
      <div className="h-10 bg-white/5 rounded-xl w-36" />
      
      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side (Header & Bio) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="glass-panel rounded-3xl p-8 flex flex-col md:flex-row gap-8 border border-white/5">
            <div className="w-32 h-32 rounded-3xl bg-white/10 shrink-0" />
            <div className="flex flex-col gap-4 flex-grow justify-center">
              <div className="h-7 bg-white/10 rounded-md w-1/2" />
              <div className="h-4 bg-white/5 rounded-md w-1/3" />
              <div className="h-4 bg-white/5 rounded-md w-2/3" />
            </div>
          </div>
          
          <div className="glass-panel rounded-3xl p-8 flex flex-col gap-4 border border-white/5">
            <div className="h-6 bg-white/10 rounded-md w-1/4" />
            <div className="space-y-2">
              <div className="h-4 bg-white/5 rounded-md w-full" />
              <div className="h-4 bg-white/5 rounded-md w-5/6" />
              <div className="h-4 bg-white/5 rounded-md w-4/5" />
            </div>
          </div>
        </div>
        
        {/* Right Side (Stats & Action Panel) */}
        <div className="flex flex-col gap-8">
          <div className="glass-panel rounded-3xl p-8 flex flex-col gap-6 border border-white/5">
            <div className="h-6 bg-white/10 rounded-md w-1/2 mx-auto" />
            <div className="h-10 bg-white/10 rounded-2xl w-full" />
            <div className="h-12 bg-white/15 rounded-2xl w-full" />
          </div>
          
          <div className="glass-panel rounded-3xl p-8 flex flex-col gap-6 border border-white/5">
            <div className="h-6 bg-white/10 rounded-md w-1/3" />
            <div className="space-y-4">
              <div className="h-14 bg-white/5 rounded-2xl w-full" />
              <div className="h-14 bg-white/5 rounded-2xl w-full" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─────────────────────────── Main Researcher Profile Page ───────────────────────────
export default function ResearcherProfile({ navigate, researcherId }) {
  const { user } = useAuth()
  const { promptLogin } = useAuthGate()
  const [researcher, setResearcher] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [followLoading, setFollowLoading] = useState(false)
  const [toast, setToast] = useState(null)

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
        // Sentinel 'me' → profil du chercheur connecté, résolu côté session
        // (évite le mismatch entre user.id numérique et l'id 'me-<id>' du dépôt).
        const res = researcherId === 'me'
          ? await api.researchers.getMe()
          : await api.researchers.getById(researcherId)
        if (active) {
          if (res.success && res.data) {
            setResearcher(res.data)
            const fCount = res.data.followersCount ?? res.data.stars ?? 0
            setFollowersCount(fCount)
            
            // Le backend n'expose pas la liste des abonnés (count seulement) :
            // on ne peut pas déduire l'état « je suis abonné » depuis le détail.
            // Activation optimiste gérée via toggleFollow.
            setIsFollowing(false)
            setError(null)
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
        // Toggle local state
        const updated = res.data
        const nextFollowing = !isFollowing
        setIsFollowing(nextFollowing)
        setFollowersCount(c => nextFollowing ? c + 1 : Math.max(0, c - 1))
        
        // Show success toast
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

  // Check if viewing own profile
  const isOwnProfile = user && researcher && String(researcher.id) === String(user.id)

  // Get custom mock publications list
  const publications = MOCK_PUBLICATIONS[researcher?.id] || []

  return (
    <div className="max-w-[88rem] mx-auto w-full py-24 px-6 md:px-12 lg:px-12 relative min-h-screen">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {isLoading ? (
          <motion.div
            key="profile-skeleton"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <ProfileSkeleton />
          </motion.div>
        ) : error || !researcher ? (
          <motion.div
            key="profile-error"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="max-w-2xl mx-auto w-full py-32 px-6 flex flex-col items-center justify-center text-center gap-8"
          >
            <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 animate-pulse">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-black tracking-tight text-text-primary">Profil Inaccessible</h2>
              <p className="text-sm text-text-secondary max-w-md">
                {error || "Ce chercheur n'est pas ou plus référencé dans l'annuaire de recherche FIERI."}
              </p>
            </div>
            <button
              onClick={() => navigate('researchers')}
              className="px-6 py-3 rounded-2xl text-xs font-bold text-white bg-fieri-blue hover:bg-fieri-blue/90 shadow-lg shadow-fieri-blue/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retourner à l'annuaire
            </button>
          </motion.div>
        ) : (
          /* Page wrapper with smooth motion entry */
          <motion.div
            key="profile-content"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex flex-col gap-10"
          >
        {/* Navigation & Kicker */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('researchers')}
            className="group flex items-center gap-2.5 text-xs font-black tracking-widest uppercase text-text-muted hover:text-fieri-blue transition-colors cursor-pointer w-fit"
            aria-label="Retourner à l'annuaire de la communauté"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Retour à l'annuaire
          </button>
          
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-black tracking-[0.25em] uppercase text-fieri-blue">
              PROFIL ACADÉMIQUE R&D
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-fieri-blue/30" />
            <span className="text-[10px] font-bold text-text-muted uppercase">
              {researcher.pole}
            </span>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT COLUMN: Header & Bio (Spans 2 columns) */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* 1. Header Identity Bento Cell */}
            <div className="glass-panel rounded-3xl p-8 md:p-10 flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden border border-white/5 shadow-xl group">
              {/* Soft cosmic glow background on hover */}
              <div className="absolute -inset-px bg-gradient-to-r from-fieri-blue/5 to-[#8B5CF6]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />
              
              {/* Photo Avatar */}
              <div className="relative shrink-0">
                <img
                  src={researcher.avatar}
                  alt={researcher.name}
                  className="w-28 h-28 md:w-32 md:h-32 rounded-3xl object-cover border-2 border-white/10 group-hover:border-fieri-blue/40 transition-colors shadow-lg"
                />
                {(followersCount > 150) && (
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-xl bg-fieri-blue border border-bg-secondary flex items-center justify-center shadow-md">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </span>
                )}
              </div>

              {/* Bio Meta text */}
              <div className="flex flex-col gap-4 text-center md:text-left flex-grow">
                <div className="space-y-1">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 justify-center md:justify-start">
                    <h1 className="text-2xl md:text-3xl font-black text-text-primary tracking-tight">
                      {researcher.name}
                    </h1>
                    {researcher.publicationsCount >= 10 && (
                      <span className="w-fit mx-auto md:mx-0 inline-flex items-center gap-1 text-[9px] font-black uppercase text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                        <Award className="w-3 h-3 shrink-0" /> Élite R&D
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-fieri-blue tracking-wide">
                    {researcher.role}
                  </p>
                </div>

                <div className="flex flex-col gap-2.5 text-xs text-text-secondary font-medium mt-1">
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <Briefcase className="w-4 h-4 text-text-muted shrink-0" />
                    <span>{researcher.university}</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <Globe className="w-4 h-4 text-text-muted shrink-0" />
                    <span className="capitalize">{researcher.pole}</span>
                  </div>
                </div>

                {/* Specialties Tags */}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-2">
                  {researcher.specialties?.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-bold text-text-primary bg-white/5 border border-white/10 px-3 py-1 rounded-xl shadow-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Biography Bento Cell */}
            <div className="glass-panel rounded-3xl p-8 md:p-10 border border-white/5 shadow-lg relative flex flex-col gap-5">
              <h2 className="text-lg font-black tracking-tight text-text-primary flex items-center gap-2">
                <Activity className="w-5 h-5 text-fieri-blue" />
                Biographie & Recherches
              </h2>
              <div className="h-px bg-white/5 w-full" />
              <p className="text-sm text-text-secondary leading-relaxed font-medium">
                {researcher.bio || "Aucune biographie disponible pour ce chercheur. Les contributions de recherche scientifique au sein de la plateforme FIERI seront publiées très prochainement."}
              </p>
              <p className="text-sm text-text-secondary leading-relaxed font-medium">
                Ses travaux participent activement aux efforts d'indépendance technologique et d'autonomie scientifique locale portés par les clubs académiques FIERI. Ses pôles de prédilection gravitent autour du prototypage physique robuste, du codage bas-niveau résilient et de l'intégration intelligente.
              </p>
            </div>
            
          </div>

          {/* RIGHT COLUMN: Follow Status & Statistics Bento Panel */}
          <div className="flex flex-col gap-8">
            
            {/* 1. Subscription Actions Bento Cell */}
            <div className="glass-panel rounded-3xl p-8 border border-white/5 shadow-xl relative flex flex-col gap-6 overflow-hidden text-center">
              {/* Inner cosmic gradient ring */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-fieri-blue/10 blur-[60px] rounded-full pointer-events-none" />

              {/* Followers Stat Counter */}
              <div className="flex flex-col items-center gap-1 relative z-10">
                <Users className="w-7 h-7 text-fieri-blue mb-1" />
                <span className="text-4xl font-black text-text-primary tracking-tight">
                  {followersCount}
                </span>
                <span className="text-xs font-black tracking-widest text-text-muted uppercase">
                  Abonnés FIERI
                </span>
              </div>

              <div className="h-px bg-white/5 w-full my-1" />

              {/* Follow Toggle Dynamic Button with Gating Matrix */}
              <div className="relative z-10 flex flex-col gap-3">
                {isOwnProfile ? (
                  <div className="py-3 px-4 rounded-2xl bg-fieri-blue/5 border border-fieri-blue/10 text-center">
                    <p className="text-[10px] font-bold text-fieri-blue/70">C'est votre profil</p>
                  </div>
                ) : user ? (
                  // LOGGED IN: Active follow toggle
                  <button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={`w-full py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                      isFollowing
                        ? 'bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400'
                        : 'bg-fieri-blue hover:bg-fieri-blue/90 text-white hover:shadow-[0_0_20px_rgba(108,76,241,0.3)]'
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
                  // ANONYMOUS: Gated button
                  <div className="space-y-3">
                    <button
                      disabled
                      className="w-full py-3.5 rounded-2xl text-xs font-bold bg-white/5 border border-white/5 text-text-muted opacity-60 flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      S'abonner
                    </button>
                    <p className="text-[10px] font-bold text-rose-400 bg-rose-500/5 border border-rose-500/10 py-2 px-3 rounded-xl leading-relaxed">
                      L'abonnement aux flux scientifiques est réservé aux membres connectés de l'alliance FIERI.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Scientific Work Stats Bento Cell */}
            <div className="glass-panel rounded-3xl p-8 border border-white/5 shadow-lg relative flex flex-col gap-5">
              <h3 className="text-sm font-black tracking-widest text-text-muted uppercase flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-fieri-blue" />
                Indicateurs Clés
              </h3>
              
              <div className="flex flex-col gap-4">
                {/* Stat item 1 */}
                <div className="flex justify-between items-center bg-white/3 border border-white/5 p-4 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-fieri-blue/15 flex items-center justify-center text-fieri-blue">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-text-secondary">Publications</span>
                  </div>
                  <span className="text-base font-black text-text-primary">{researcher.publicationsCount}</span>
                </div>

                {/* Stat item 2 */}
                <div className="flex justify-between items-center bg-white/3 border border-white/5 p-4 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                      <Star className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-text-secondary">Projets R&D</span>
                  </div>
                  <span className="text-base font-black text-text-primary">{researcher.projectsCount}</span>
                </div>

                {/* Stat item 3 */}
                <div className="flex justify-between items-center bg-white/3 border border-white/5 p-4 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
                      <Award className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-text-secondary">Votes de confiance</span>
                  </div>
                  <span className="text-base font-black text-text-primary">{researcher.stars}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* BOTTOM ROW: Scientific Publications Bento Section */}
        {publications.length > 0 && (
          <div className="glass-panel rounded-3xl p-8 md:p-10 border border-white/5 shadow-xl relative flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black tracking-tight text-text-primary flex items-center gap-2.5">
                <Newspaper className="w-5 h-5 text-fieri-blue" />
                Publications Récentes de Recherche
              </h3>
              <span className="text-xs font-bold text-text-muted">
                {publications.length} documents répertoriés
              </span>
            </div>
            
            <div className="h-px bg-white/5 w-full" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {publications.map((pub, idx) => (
                <div
                  key={idx}
                  className="bg-white/3 hover:bg-white/5 border border-white/5 hover:border-fieri-blue/20 p-5 rounded-2xl flex flex-col justify-between gap-5 transition-all group/card shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[9px] font-black uppercase tracking-wider text-fieri-blue bg-fieri-blue/10 px-2 py-0.5 rounded-md border border-fieri-blue/10">
                        {pub.year}
                      </span>
                      <span className="text-[10px] font-bold text-text-muted">
                        {pub.citations} Citations
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-text-primary leading-relaxed group-hover/card:text-fieri-blue transition-colors">
                      {pub.title}
                    </h4>
                  </div>
                  
                  <div className="flex justify-between items-center gap-2 pt-2 border-t border-white/5">
                    <span className="text-[10px] font-medium text-text-secondary truncate pr-3">
                      {pub.journal}
                    </span>
                    <a
                      href={pub.link}
                      className="text-text-muted hover:text-fieri-blue transition-colors cursor-pointer shrink-0"
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
    </div>
  )
}
