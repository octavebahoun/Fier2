// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Users,
  Star,
  Sparkles,
  ArrowRight,
  UserCheck
} from 'lucide-react'
import { api } from '../services/api.js'

export default function ResearchersCarousel({ navigate }) {
  const [researchers, setResearchers] = useState([])
  const [loading, setLoading] = useState(true)
  const scrollContainerRef = useRef(null)
  
  // Navigation button visibility states
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  // Fetch researchers
  useEffect(() => {
    let active = true
    const fetchFeatured = async () => {
      try {
        setLoading(true)
        const res = await api.researchers.getAll()
        if (active && res.success) {
          // Sort by publications or stars to highlight "featured" researchers
          const sorted = [...res.data].sort((a, b) => (b.stars || 0) - (a.stars || 0))
          setResearchers(sorted)
        }
      } catch (err) {
        console.error("Error loading researchers for carousel:", err)
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchFeatured()
    return () => {
      active = false
    }
  }, [])

  // Check scroll position to dynamically show/hide arrow buttons
  const checkScrollPosition = () => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    
    // Show left arrow if scrolled away from the very start
    setShowLeftArrow(scrollLeft > 10)
    
    // Show right arrow if there's remaining scrollable content on the right
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 15)
  }

  // Handle scroll trigger
  const handleScroll = () => {
    checkScrollPosition()
  }

  // Update position on window resize
  useEffect(() => {
    const handleResize = () => {
      checkScrollPosition()
    }
    
    window.addEventListener('resize', handleResize)
    // Run initial check once data is loaded
    if (researchers.length > 0) {
      setTimeout(checkScrollPosition, 100)
    }

    return () => window.removeEventListener('resize', handleResize)
  }, [researchers])

  // Scroll function
  const scroll = (direction) => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = 380 // Scroll slightly more than card width
    const targetScroll = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)
    
    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    })
  }

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      scroll('left')
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      scroll('right')
    }
  }

  if (loading) {
    return (
      <div className="w-full py-6 flex gap-6 overflow-hidden animate-pulse">
        {[1, 2, 3].map((n) => (
          <div 
            key={n} 
            className="w-80 md:w-96 shrink-0 glass-panel rounded-3xl p-6 flex flex-col gap-6 border border-white/5"
          >
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 rounded-2xl bg-white/10 shrink-0" />
              <div className="flex flex-col gap-2 flex-grow">
                <div className="h-5 bg-white/10 rounded-md w-2/3" />
                <div className="h-3 bg-white/5 rounded-md w-1/2" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-white/5 rounded-md w-full" />
              <div className="h-3 bg-white/5 rounded-md w-5/6" />
            </div>
            <div className="h-10 bg-white/10 rounded-2xl w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (researchers.length === 0) return null

  return (
    <div className="relative w-full py-6 group/carousel">
      
      {/* Kicker section header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-fieri-blue animate-pulse" />
          <h2 className="text-sm font-black tracking-widest text-text-muted uppercase">
            Membres d'Élite R&D
          </h2>
        </div>

        {/* Desktop Arrow Controls */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            onClick={() => scroll('left')}
            disabled={!showLeftArrow}
            className={`p-2 rounded-xl border border-white/5 backdrop-blur-md transition-all flex items-center justify-center cursor-pointer ${
              showLeftArrow
                ? 'bg-white/5 text-text-primary hover:bg-white/10 hover:border-white/10'
                : 'text-text-muted opacity-30 cursor-not-allowed'
            }`}
            aria-label="Faire défiler vers la gauche"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => scroll('right')}
            disabled={!showRightArrow}
            className={`p-2 rounded-xl border border-white/5 backdrop-blur-md transition-all flex items-center justify-center cursor-pointer ${
              showRightArrow
                ? 'bg-white/5 text-text-primary hover:bg-white/10 hover:border-white/10'
                : 'text-text-muted opacity-30 cursor-not-allowed'
            }`}
            aria-label="Faire défiler vers la droite"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Snap Carousel Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth select-none pb-4 no-scrollbar focus:outline-none focus-visible:ring-1 focus-visible:ring-fieri-blue/30 rounded-2xl"
        role="region"
        aria-label="Carrousel des chercheurs vedettes. Utilisez les touches fléchées pour naviguer."
      >
        {researchers.map((researcher) => {
          const followersCount = researcher.followersCount ?? researcher.stars ?? 0
          
          return (
            <motion.div
              key={researcher.id}
              className="snap-start shrink-0 w-80 md:w-96 glass-panel rounded-3xl p-6 border border-white/5 shadow-lg relative overflow-hidden flex flex-col justify-between gap-5 group cursor-pointer focus-within:border-fieri-blue/40"
              whileHover={{ y: -5, scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              onClick={() => navigate('profile', { researcherId: researcher.id })}
            >
              {/* Subtle hover radial glow behind avatar */}
              <div className="absolute -inset-px bg-gradient-to-r from-fieri-blue/5 to-[#8B5CF6]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl" />
              
              {/* Card Top: Identity */}
              <div className="flex gap-4 items-start relative z-10">
                <div className="relative shrink-0">
                  <img
                    src={researcher.avatar}
                    alt={researcher.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-white/10 group-hover:border-fieri-blue/40 transition-colors"
                  />
                  {followersCount > 150 && (
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg bg-amber-400 border border-bg-secondary flex items-center justify-center shadow-md">
                      <Star className="w-3 h-3 text-bg-primary fill-current" />
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1 overflow-hidden">
                  <h3 className="text-base font-black text-text-primary group-hover:text-fieri-blue transition-colors truncate">
                    {researcher.name}
                  </h3>
                  <span className="text-[10px] font-bold text-fieri-blue tracking-wide uppercase truncate">
                    {researcher.pole}
                  </span>
                  <span className="text-[9px] font-medium text-text-muted truncate">
                    {researcher.university}
                  </span>
                </div>
              </div>

              {/* Card Middle: Bio Snippet */}
              <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed font-medium relative z-10">
                {researcher.bio}
              </p>

              {/* Card Divider */}
              <div className="h-px bg-white/5 w-full relative z-10" />

              {/* Card Bottom: Stats & Button */}
              <div className="flex items-center justify-between relative z-10 gap-3">
                {/* Horizontal Stats */}
                <div className="flex items-center gap-4 text-[10px] text-text-muted font-black uppercase">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-fieri-blue/80" />
                    <span>{researcher.publicationsCount} Pubs</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-400/80" />
                    <span>{followersCount} Abonnés</span>
                  </div>
                </div>

                {/* Glass Button Link */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate('profile', { researcherId: researcher.id })
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-fieri-blue hover:text-fieri-blue/80 transition-colors group/btn cursor-pointer py-1.5 px-3 bg-white/5 rounded-xl border border-white/5 group-hover:border-fieri-blue/20"
                  aria-label={`Consulter le profil de ${researcher.name}`}
                >
                  <span>Voir</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>

            </motion.div>
          )
        })}
      </div>
      
      {/* Hide scrollbar styles in component */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />

    </div>
  )
}
