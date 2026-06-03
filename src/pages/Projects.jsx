import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Sparkles, TrendingUp, ArrowRight, 
  Coins, Users, BookOpen, Star, Plus, 
  Layers, Lightbulb, Compass, Award
} from 'lucide-react';
import { mockDb } from '../services/mockDb';

export default function Projects({ navigate }) {
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    // Load initial list from database
    setProjects(mockDb.projects.getAll());
  }, []);

  // Filter projects by both text query and status
  const filteredProjects = projects.filter(p => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.technologies && p.technologies.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      (p.clubName && p.clubName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'active') return matchesSearch && p.status === 'Actif';
    if (activeFilter === 'rd') return matchesSearch && p.status === 'En Phase de R&D';
    return matchesSearch;
  });

  // Stagger variants for the Bento Grid entry animation
  const gridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="max-w-[88rem] mx-auto w-full py-24 px-6 md:px-12 lg:px-24 flex flex-col gap-12 relative min-h-screen">
      
      {/* Decorative cosmic glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-fieri-blue/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header section with neat design */}
      <div className="flex flex-col gap-4 max-w-3xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 px-3 py-1 rounded-full bg-fieri-blue/10 border border-fieri-blue/20 text-fieri-blue text-xs font-bold w-fit"
        >
          <Sparkles className="w-3.5 h-3.5 text-fieri-blue animate-pulse" />
          <span>PORTFOLIO TECHNOLOGIQUE R&D</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-text-secondary to-fieri-blue bg-clip-text text-transparent leading-tight"
        >
          Hub de Recherche & Projets Innovants
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-text-secondary text-sm md:text-base leading-relaxed"
        >
          Découvrez la bento grid de nos initiatives majeures de recherche appliquée. 
          Suivez les jalons en temps réel, soutenez financièrement les laboratoires et collaborez sur des technologies de rupture.
        </motion.p>
      </div>

      {/* Filter and Search Bar Row */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="flex flex-col md:flex-row gap-4 items-center justify-between glass-panel border border-white/5 rounded-2xl p-4 relative z-10"
      >
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Rechercher un projet, une technologie..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/3 border border-white/5 focus:border-fieri-blue/30 rounded-xl py-2.5 pl-11 pr-4 text-xs text-text-primary placeholder:text-text-muted focus:outline-none transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button 
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all shrink-0 cursor-pointer ${
              activeFilter === 'all' 
                ? 'bg-fieri-blue border-fieri-blue text-white shadow-lg shadow-fieri-blue/10' 
                : 'bg-white/3 border-white/5 text-text-secondary hover:text-text-primary'
            }`}
          >
            Tous les projets
          </button>
          <button 
            onClick={() => setActiveFilter('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all shrink-0 cursor-pointer ${
              activeFilter === 'active' 
                ? 'bg-fieri-blue border-fieri-blue text-white shadow-lg shadow-fieri-blue/10' 
                : 'bg-white/3 border-white/5 text-text-secondary hover:text-text-primary'
            }`}
          >
            Actifs
          </button>
          <button 
            onClick={() => setActiveFilter('rd')}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all shrink-0 cursor-pointer ${
              activeFilter === 'rd' 
                ? 'bg-fieri-blue border-fieri-blue text-white shadow-lg shadow-fieri-blue/10' 
                : 'bg-white/3 border-white/5 text-text-secondary hover:text-text-primary'
            }`}
          >
            En R&D
          </button>
        </div>
      </motion.div>

      {/* Bento Grid layout */}
      <div className="relative z-10">
        {filteredProjects.length > 0 ? (
          <motion.div 
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {filteredProjects.map((p, index) => {
              // Asymmetric Bento layout rule: First element is highlighted (colspan 2)
              const isFeatured = index === 0 && searchQuery === '' && activeFilter === 'all';
              const budgetGoal = p.budgetGoal || 10000;
              const budgetPercentage = Math.min(100, Math.round((p.budgetRaised / budgetGoal) * 100));

              return (
                <motion.div
                  key={p.id}
                  variants={cardVariants}
                  className={`${
                    isFeatured ? 'md:col-span-2 flex-col md:flex-row' : 'col-span-1 flex-col'
                  } group relative glass-panel rounded-3xl overflow-hidden border border-white/5 bg-[#0d1120]/60 backdrop-blur-xl transition-all cursor-pointer flex min-h-[380px]`}
                  whileHover={{ 
                    y: -4, 
                    boxShadow: "0 0 30px rgba(59, 130, 246, 0.15)",
                    borderColor: "rgba(59, 130, 246, 0.3)"
                  }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  onClick={() => navigate('project-detail', { projectId: p.id })}
                >
                  {/* Radial accent glow visible on card hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-fieri-blue/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  {/* Card Cover Image */}
                  <div className={`relative overflow-hidden border-white/5 shrink-0 ${
                    isFeatured 
                      ? 'md:w-[42%] w-full h-48 md:h-full border-b md:border-b-0 md:border-r' 
                      : 'w-full h-44 border-b'
                  }`}>
                    {p.image && (
                      <img 
                        src={p.image} 
                        alt={p.title} 
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d1120] via-transparent to-transparent opacity-70 pointer-events-none" />
                    {isFeatured && (
                      <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-transparent via-transparent to-[#0d1120] opacity-80 pointer-events-none" />
                    )}
                  </div>

                  {/* Card Content Wrapper */}
                  <div className={`flex flex-col justify-between flex-grow ${
                    isFeatured ? 'p-6 md:p-8' : 'p-6'
                  }`}>
                    
                    <div className="space-y-5 relative z-10">
                      {/* Status badge & stars count */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
                            p.status === 'Actif'
                              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/10'
                              : 'text-amber-400 bg-amber-500/10 border-amber-500/10'
                          }`}>
                            {p.status}
                          </span>
                          {isFeatured && (
                            <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md text-fieri-blue bg-fieri-blue/10 border-fieri-blue/10 flex items-center gap-1">
                              <Award className="w-2.5 h-2.5 animate-bounce" />
                              À la Une
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 text-text-secondary group-hover:text-amber-400 transition-colors">
                          <Star className={`w-3.5 h-3.5 ${p.starred ? 'fill-amber-400 text-amber-400' : ''}`} />
                          <span className="text-[10px] font-bold">{p.stars}</span>
                        </div>
                      </div>

                      {/* Main textual representation */}
                      <div className="space-y-2">
                        <h3 className={`font-black tracking-tight text-text-primary group-hover:text-fieri-blue transition-colors leading-tight ${
                          isFeatured ? 'text-2xl md:text-3xl' : 'text-lg'
                        }`}>
                          {p.title}
                        </h3>
                        <p className="text-[11px] md:text-xs text-text-secondary leading-relaxed line-clamp-3">
                          {p.summary}
                        </p>
                      </div>

                      {/* Technologies tags list */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {p.technologies.slice(0, isFeatured ? 7 : 4).map((tech, idx) => (
                          <span key={idx} className="text-[9px] font-black text-text-muted bg-white/5 border border-white/5 px-2 py-0.5 rounded-md">
                            {tech}
                          </span>
                        ))}
                        {p.technologies.length > (isFeatured ? 7 : 4) && (
                          <span className="text-[9px] font-black text-fieri-blue bg-fieri-blue/5 border border-fieri-blue/10 px-2 py-0.5 rounded-md">
                            +{p.technologies.length - (isFeatured ? 7 : 4)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progressive budget and team footer */}
                    <div className="space-y-4 pt-5 mt-6 border-t border-white/5 relative z-10">
                      
                      {/* Budget indicator bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-bold text-text-secondary">
                          <span className="flex items-center gap-1.5">
                            <Coins className="w-3.5 h-3.5 text-fieri-blue" />
                            {p.supportersCount} soutiens fictifs
                          </span>
                          <span>{p.budgetRaised} $ / {budgetGoal} $ ({budgetPercentage}%)</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-fieri-blue to-indigo-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${budgetPercentage}%` }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                      </div>

                      {/* Author block and visual Explore link */}
                      <div className="flex justify-between items-center gap-4">
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={p.author.avatar} 
                            alt={p.author.name}
                            className="w-7 h-7 rounded-full border border-white/10 object-cover" 
                          />
                          <div>
                            <h4 className="text-[10px] font-bold text-text-primary line-clamp-1">{p.author.name}</h4>
                            <p className="text-[8px] text-text-muted">{p.author.role}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-fieri-blue group-hover:translate-x-1 transition-transform">
                          Détails
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>

                    </div>

                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          /* Empty state */
          <div className="text-center py-20 glass-panel border border-white/5 rounded-3xl flex flex-col items-center justify-center gap-4 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-text-muted">
              <Compass className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-black text-text-primary">Aucun projet trouvé</h3>
              <p className="text-xs text-text-secondary mt-1">Ajustez vos termes de recherche ou sélectionnez un autre filtre.</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
