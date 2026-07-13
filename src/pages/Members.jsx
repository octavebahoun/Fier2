// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Users,
  ChevronDown,
  BookOpen,
  Layers,
  Star,
  ExternalLink,
  RefreshCw,
  Award,
  Sparkles
} from 'lucide-react'
import { api } from '../services/api.js'
import ResearchersCarousel from '../components/ResearchersCarousel.jsx'

// ─────────────────────────── Skeleton Loader Component ───────────────────────────
function MemberCardSkeleton() {
  return (
    <motion.div
      animate={{ opacity: [0.3, 0.7, 0.3] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      className="glass-panel rounded-3xl p-6 flex flex-col gap-6 border border-white/5"
    >
      <div className="flex gap-4 items-start">
        <div className="w-16 h-16 rounded-2xl bg-white/10 shrink-0" />
        <div className="flex flex-col gap-2 flex-grow">
          <div className="h-5 bg-white/10 rounded-md w-3/4" />
          <div className="h-4 bg-white/5 rounded-md w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-white/5 rounded-md w-full" />
        <div className="h-3 bg-white/5 rounded-md w-5/6" />
      </div>
      <div className="h-px bg-white/5" />
      <div className="flex flex-wrap gap-2">
        <div className="h-6 bg-white/15 rounded-full w-16" />
        <div className="h-6 bg-white/10 rounded-full w-20" />
      </div>
      <div className="flex justify-between items-center gap-3 pt-2">
        <div className="h-8 bg-white/10 rounded-xl w-24" />
        <div className="h-8 bg-white/5 rounded-lg w-20" />
      </div>
    </motion.div>
  )
}

// ─────────────────────────── Members Annuaire Page ───────────────────────────
export default function Members({ navigate }) {
  const [researchers, setResearchers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters State
  const [searchQuery, setSearchQuery] = useState('')
  const [poleFilter, setPoleFilter] = useState('Toutes')
  const [universityFilter, setUniversityFilter] = useState('Toutes')

  // Load community researchers
  useEffect(() => {
    let active = true
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await api.researchers.getAll()
        if (active) {
          if (response.success) {
            setResearchers(response.data || [])
          } else {
            setError(response.message || 'Erreur lors du chargement des données.')
          }
        }
      } catch (err) {
        if (active) {
          setError('Impossible de se connecter au serveur.')
          console.error(err)
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }
    fetchData()
    return () => {
      active = false
    }
  }, [])

  // Dynamic values extraction for filters (derived directly from researchers)
  const availablePoles = ['Toutes', ...new Set(researchers.map(r => r.pole).filter(Boolean))]
  const availableUniversities = ['Toutes', ...new Set(researchers.map(r => r.university || 'Université Polytechnique de Fieri').filter(Boolean))]

  // Derived state: interactive filtering (No cascading useEffect hook, purely derived in render)
  const filteredResearchers = researchers.filter((researcher) => {
    // 1. Text Search matching name (case-insensitive, handles accents and first/last names)
    const matchesSearch = researcher.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .includes(
        searchQuery
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
      )

    // 2. Discipline/Pôle filter matching
    const matchesPole = poleFilter === 'Toutes' || researcher.pole === poleFilter

    // 3. Institution/Université filter matching (handling safe fallbacks if missing)
    const university = researcher.university || 'Université Polytechnique de Fieri'
    const matchesUniversity = universityFilter === 'Toutes' || university === universityFilter

    return matchesSearch && matchesPole && matchesUniversity
  })

  // Quick reset for all interactive filters
  const handleResetFilters = () => {
    setSearchQuery('')
    setPoleFilter('Toutes')
    setUniversityFilter('Toutes')
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  }

  return (
    <div className="max-w-[88rem] mx-auto w-full py-24 px-6 md:px-12 lg:px-12 relative blueprint-grid min-h-screen">
      {/* Background Star Radial Aura */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[30rem] halo-radial pointer-events-none opacity-50 z-0" />

      {/* Page Header */}
      <div className="flex flex-col gap-4 mb-16 max-w-2xl relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-fieri-blue/10 border border-fieri-blue/20 text-fieri-blue">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black tracking-[0.25em] uppercase text-fieri-blue">
            COMMUNAUTÉ R&D
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight">
          Annuaire des <br />
          <span className="text-gradient-blue">Chercheurs & Spécialistes</span>
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed max-w-xl">
          Découvrez les profils R&D, explorez leurs pôles de spécialité scientifique et initiez des collaborations transversales à fort impact.
        </p>
      </div>

      {/* Researchers Carousel section */}
      <div className="relative z-10 mb-12">
        <ResearchersCarousel navigate={navigate} />
      </div>

      {/* Filter Interactive Dashboard */}
      <div className="glass-panel rounded-3xl p-5 md:p-6 mb-12 flex flex-col gap-4 relative z-10 shadow-xl border border-white/5">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
          
          {/* Text input search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Rechercher un chercheur par nom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-text-primary focus:outline-none focus:border-fieri-blue/40 focus:ring-1 focus:ring-fieri-blue/30 transition-all placeholder:text-text-muted font-medium"
              aria-label="Rechercher par nom"
            />
          </div>

          {/* Discipline (Pôle) Selector */}
          <div className="relative w-full lg:w-64">
            <select
              value={poleFilter}
              onChange={(e) => setPoleFilter(e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-text-primary focus:outline-none focus:border-fieri-blue/40 transition-colors appearance-none cursor-pointer font-medium"
              aria-label="Filtrer par discipline"
            >
              <option value="Toutes" className="bg-bg-secondary text-text-primary">Toutes disciplines</option>
              {availablePoles.filter(p => p !== 'Toutes').map((p) => (
                <option key={p} value={p} className="bg-bg-secondary text-text-primary">
                  {p}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          </div>

          {/* Institution (Université) Selector */}
          <div className="relative w-full lg:w-72">
            <select
              value={universityFilter}
              onChange={(e) => setUniversityFilter(e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-text-primary focus:outline-none focus:border-fieri-blue/40 transition-colors appearance-none cursor-pointer font-medium"
              aria-label="Filtrer par université ou institution"
            >
              <option value="Toutes" className="bg-bg-secondary text-text-primary">Toutes institutions</option>
              {availableUniversities.filter(u => u !== 'Toutes').map((u) => (
                <option key={u} value={u} className="bg-bg-secondary text-text-primary">
                  {u}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          </div>

          {/* Clear Filter Button */}
          {(searchQuery !== '' || poleFilter !== 'Toutes' || universityFilter !== 'Toutes') && (
            <button
              onClick={handleResetFilters}
              className="px-5 py-3 rounded-2xl text-xs font-bold text-fieri-blue bg-fieri-blue/10 hover:bg-fieri-blue/20 transition-all flex items-center justify-center gap-2 cursor-pointer grow lg:grow-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Réinitialiser
            </button>
          )}
        </div>

        {/* Dynamic status count bar */}
        {!isLoading && !error && (
          <div className="flex justify-between items-center text-xs text-text-muted px-1">
            <span>
              {filteredResearchers.length === researchers.length
                ? `${researchers.length} spécialistes R&D répertoriés`
                : `${filteredResearchers.length} résultats sur ${researchers.length} chercheurs`
              }
            </span>
            {filteredResearchers.length > 0 && (
              <span className="flex items-center gap-1.5 font-semibold text-fieri-blue">
                <Sparkles className="w-3.5 h-3.5" />
                Indexation dynamique FIERI
              </span>
            )}
          </div>
        )}
      </div>

      {/* Error State Banner */}
      {error && (
        <div className="glass-panel border-rose-500/20 bg-rose-500/5 text-rose-400 rounded-3xl p-6 mb-12 flex items-center gap-4 relative z-10">
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 shrink-0">
            <Award className="w-6 h-6 rotate-180" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-text-primary">Une erreur est survenue</h3>
            <p className="text-xs text-text-secondary mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Main Grid Content */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {isLoading ? (
            /* LOADING SKELETON GRID */
            <motion.div
              key="skeletons"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <MemberCardSkeleton />
              <MemberCardSkeleton />
              <MemberCardSkeleton />
            </motion.div>
          ) : filteredResearchers.length > 0 ? (
            /* MEMBERS CARDS GRID */
            <motion.div
              key="results"
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.2,
                    ease: "easeInOut",
                    staggerChildren: 0.05
                  }
                },
                exit: {
                  opacity: 0,
                  y: -12,
                  transition: { duration: 0.2, ease: "easeInOut" }
                }
              }}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredResearchers.map((r) => {
                const university = r.university || 'Université Polytechnique de Fieri'
                const specialties = r.specialties || [r.pole || 'Recherche']
                
                return (
                  <motion.div
                    key={r.id}
                    variants={cardVariants}
                    className="glass-panel rounded-3xl p-6 flex flex-col gap-6 relative group overflow-hidden cursor-default border border-white/5"
                    style={{ contentVisibility: 'auto' }}
                  >
                    {/* Corner gradient glow halo (UX-DR3) */}
                    <div className="absolute inset-0 halo-radial opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl" />

                    {/* Member Info Header */}
                    <div className="flex gap-4 items-start relative z-10">
                      <div className="relative group shrink-0">
                        <img
                          src={r.avatar}
                          alt={r.name}
                          className="w-16 h-16 rounded-2xl object-cover border border-white/10 group-hover:border-fieri-blue/40 transition-colors"
                          loading="lazy"
                        />
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg bg-fieri-blue border border-bg-secondary flex items-center justify-center text-[10px] text-white font-black shadow-md">
                          {r.stars > 200 ? '★' : '👤'}
                        </span>
                      </div>
                      
                      <div className="flex flex-col gap-1 min-w-0">
                        <h2 className="text-base font-extrabold text-text-primary tracking-tight truncate">
                          {r.name}
                        </h2>
                        <span className="text-xs text-text-secondary font-medium leading-tight line-clamp-2">
                          {r.role}
                        </span>
                      </div>
                    </div>

                    {/* Researcher Bio */}
                    <p className="text-xs text-text-muted leading-relaxed line-clamp-3 relative z-10 pr-2">
                      {r.bio}
                    </p>

                    <div className="h-px bg-white/5 relative z-10" />

                    {/* Tags & Specialties (Badges) */}
                    <div className="flex flex-wrap gap-1.5 relative z-10">
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-fieri-blue bg-fieri-blue/10 px-2.5 py-1 rounded-full border border-fieri-blue/20">
                        <Layers className="w-3 h-3 shrink-0" />
                        {r.pole}
                      </span>
                      {specialties.map((spec) => (
                        <span
                          key={spec}
                          className="inline-flex text-[10px] font-semibold text-text-secondary bg-white/5 px-2.5 py-1 rounded-full border border-white/5 truncate max-w-32"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>

                    {/* Academic Indicators & Navigation */}
                    <div className="flex justify-between items-center gap-4 mt-auto pt-2 relative z-10">
                      
                      {/* Metric widgets row */}
                      <div className="flex items-center gap-4">
                        {/* Publications widget */}
                        <div className="flex items-center gap-1.5 text-text-muted" title={`${r.publicationsCount} publications`}>
                          <BookOpen className="w-3.5 h-3.5 text-fieri-blue/70" />
                          <span className="text-xs font-bold text-text-secondary">{r.publicationsCount}</span>
                        </div>
                        {/* Projets widget */}
                        <div className="flex items-center gap-1.5 text-text-muted" title={`${r.projectsCount} projets`}>
                          <Award className="w-3.5 h-3.5 text-amber-500/70" />
                          <span className="text-xs font-bold text-text-secondary">{r.projectsCount}</span>
                        </div>
                        {/* Stars widget */}
                        <div className="flex items-center gap-1.5 text-text-muted" title={`${r.stars} votes de confiance`}>
                          <Star className="w-3.5 h-3.5 text-yellow-500/70 fill-yellow-500/10" />
                          <span className="text-xs font-bold text-text-secondary">{r.stars}</span>
                        </div>
                      </div>

                      {/* Action Button: Navigate to Public Profile */}
                      <button
                        onClick={() => navigate('profile', { researcherId: r.id })}
                        className="flex items-center gap-1.5 text-xs font-bold text-fieri-blue hover:text-fieri-blue/80 transition-colors group/btn cursor-pointer py-1.5 px-3 bg-white/5 rounded-xl border border-white/5 hover:border-fieri-blue/20"
                      >
                        Profil
                        <ExternalLink className="w-3 h-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-200" />
                      </button>
                    </div>

                    {/* Academic Institution Footer Label */}
                    <div className="text-[9px] text-text-muted/65 italic border-t border-white/5 pt-2 flex items-center gap-1 relative z-10">
                      <span>Membre académique :</span>
                      <span className="font-bold text-text-muted">{university}</span>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          ) : (
            /* EMPTY SEARCH STATE (UX-DR7) */
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass-panel rounded-3xl p-12 text-center max-w-lg mx-auto flex flex-col items-center gap-6 border border-white/5 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-rose-500/5 blur-3xl pointer-events-none -z-10" />
              
              {/* Scientific Broken Circuit SVG Line Artwork (UX-DR7) */}
              <div className="w-24 h-24 text-rose-500/30 flex items-center justify-center relative bg-rose-500/5 rounded-full border border-rose-500/10 mb-2">
                <svg className="w-16 h-16 stroke-current stroke-[1.5] fill-none" viewBox="0 0 100 100">
                  <path d="M10,50 L35,50 L45,30 L55,70 L65,50 L90,50" strokeDasharray="4 3" />
                  <circle cx="50" cy="50" r="12" className="stroke-[2] text-rose-500/70" />
                  <path d="M43,43 L57,57 M57,43 L43,57" className="stroke-[2.5]" />
                  {/* Floating floating electron nodes */}
                  <circle cx="20" cy="50" r="3" className="fill-current text-rose-500/40" />
                  <circle cx="80" cy="50" r="3" className="fill-current text-rose-500/40" />
                </svg>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-extrabold text-text-primary tracking-tight">
                  Aucun chercheur ne correspond à vos filtres
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed max-w-sm">
                  Le système d'indexation n'a trouvé aucun profil correspondant. Veuillez modifier vos termes de recherche ou réinitialiser vos filtres scientifiques.
                </p>
              </div>

              <button
                onClick={handleResetFilters}
                className="px-6 py-3 rounded-2xl text-xs font-bold text-white bg-fieri-blue hover:bg-fieri-blue/90 shadow-lg shadow-fieri-blue/20 hover:shadow-xl hover:shadow-fieri-blue/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Réinitialiser la recherche
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
