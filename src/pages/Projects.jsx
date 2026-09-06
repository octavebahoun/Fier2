import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion';
import { 
  Search, Sparkles,  ArrowRight, 
  Coins,   Star,  
  Compass, Award
} from 'lucide-react';
import { api } from '../services/api';
import StatePanel from '../components/ui/StatePanel.jsx';

export default function Projects({ navigate }) {
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.projects.getAll();
      if (!res?.success) throw new Error(res?.message);
      setProjects(res.data || []);
    } catch (err) {
      // « Aucun projet » et « projets illisibles » sont deux écrans différents.
      setProjects([]);
      setError(err?.serverMessage || err?.message || "Les projets n'ont pas pu être chargés.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

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
    <div className="max-w-[88rem] mx-auto w-full py-24 px-6 md:px-12 lg:px-12 flex flex-col gap-12 relative min-h-screen">
      
      {/* Header section with neat design */}
      <div className="flex flex-col gap-4 max-w-3xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3 w-fit"
        >
          <span className="w-8 h-px bg-ember inline-block" aria-hidden="true" />
          <span className="eyebrow flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-engine" />
            PORTFOLIO TECHNOLOGIQUE R&D
          </span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary font-display leading-tight"
        >
          Hub de Recherche & <span className="text-gradient-cosmic">Projets Innovants</span>
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
        className="flex flex-col md:flex-row gap-4 items-center justify-between glass-panel border border-border-subtle chamfer-sm p-4 relative z-10"
      >
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input aria-label="Rechercher un projet, une technologie" 
            type="text" 
            placeholder="Rechercher un projet, une technologie..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg-secondary border border-border-subtle focus:border-engine rounded-xl py-2.5 pl-11 pr-4 text-xs text-text-primary placeholder:text-text-muted focus:outline-none transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button 
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all shrink-0 cursor-pointer ${
              activeFilter === 'all' 
                ? 'bg-engine border-engine text-on-accent shadow-lg' 
                : 'bg-bg-secondary border-border-subtle text-text-secondary hover:text-text-primary'
            }`}
          >
            Tous les projets
          </button>
          <button 
            onClick={() => setActiveFilter('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all shrink-0 cursor-pointer ${
              activeFilter === 'active' 
                ? 'bg-engine border-engine text-on-accent shadow-lg' 
                : 'bg-bg-secondary border-border-subtle text-text-secondary hover:text-text-primary'
            }`}
          >
            Actifs
          </button>
          <button 
            onClick={() => setActiveFilter('rd')}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all shrink-0 cursor-pointer ${
              activeFilter === 'rd' 
                ? 'bg-engine border-engine text-on-accent shadow-lg' 
                : 'bg-bg-secondary border-border-subtle text-text-secondary hover:text-text-primary'
            }`}
          >
            En R&D
          </button>
        </div>
      </motion.div>

      {/* Bento Grid layout */}
      <div className="relative z-10">
        {loading ? (
          <StatePanel state="loading" />
        ) : error ? (
          <StatePanel state="error" message={error} onRetry={loadProjects} />
        ) : filteredProjects.length > 0 ? (
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
                  } group relative glass-panel chamfer overflow-hidden transition-all cursor-pointer flex min-h-[380px]`}
                  whileHover={{ 
                    y: -4, 
                    boxShadow: "0 0 30px rgba(59, 130, 246, 0.15)",
                    borderColor: "rgba(59, 130, 246, 0.3)"
                  }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  onClick={() => navigate('project-detail', { projectId: p.id })}
                >
                  {/* Card Cover Image */}
                  <div className={`relative overflow-hidden border-border-subtle shrink-0 ${
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
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary via-transparent to-transparent opacity-70 pointer-events-none" />
                    {isFeatured && (
                      <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-transparent via-transparent to-bg-secondary opacity-80 pointer-events-none" />
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
                          <span className={`text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
                            p.status === 'Actif'
                              ? 'text-success bg-success-wash border-success'
                              : 'text-warning bg-warning-wash border-warning'
                          }`}>
                            {p.status}
                          </span>
                          {isFeatured && (
                            <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md text-engine bg-engine-wash border-engine flex items-center gap-1">
                              <Award className="w-2.5 h-2.5 animate-bounce" />
                              À la Une
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 text-text-secondary group-hover:text-warning transition-colors">
                          <Star className={`w-3.5 h-3.5 ${p.starred ? 'fill-warning text-warning' : ''}`} />
                          <span className="text-xs font-bold">{p.stars}</span>
                        </div>
                      </div>

                      {/* Main textual representation */}
                      <div className="space-y-2">
                        <h3 className={`font-extrabold tracking-tight text-text-primary group-hover:text-engine transition-colors leading-tight ${
                          isFeatured ? 'text-2xl md:text-3xl' : 'text-lg'
                        }`}>
                          {p.title}
                        </h3>
                        <p className="text-xs md:text-xs text-text-secondary leading-relaxed line-clamp-3">
                          {p.summary}
                        </p>
                      </div>

                      {/* Technologies tags list */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {p.technologies.slice(0, isFeatured ? 7 : 4).map((tech, idx) => (
                          <span key={idx} className="text-xs font-extrabold text-text-muted bg-bg-tertiary border border-border-subtle px-2 py-0.5 rounded-md">
                            {tech}
                          </span>
                        ))}
                        {p.technologies.length > (isFeatured ? 7 : 4) && (
                          <span className="text-xs font-extrabold text-engine bg-engine-wash border border-engine px-2 py-0.5 rounded-md">
                            +{p.technologies.length - (isFeatured ? 7 : 4)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progressive budget and team footer */}
                    <div className="space-y-4 pt-5 mt-6 border-t border-border-subtle relative z-10">
                      
                      {/* Budget indicator bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs font-bold text-text-secondary">
                          <span className="flex items-center gap-1.5">
                            <Coins className="w-3.5 h-3.5 text-engine" />
                            {p.supportersCount} soutien(s)
                          </span>
                          <span>{p.budgetRaised} $ / {budgetGoal} $ ({budgetPercentage}%)</span>
                        </div>
                        <div className="w-full h-1 bg-bg-tertiary rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-engine to-engine-deep rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${budgetPercentage}%` }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                      </div>

                      {/* Author block and visual Explore link */}
                      <div className="flex justify-between items-center gap-4">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-full bg-engine-wash border border-border-subtle flex items-center justify-center text-xs font-extrabold text-engine shrink-0">
                            {p.author ? p.author.charAt(0).toUpperCase() : '?'}
                          </span>
                          <span className="text-xs font-bold text-text-primary line-clamp-1">{p.author}</span>
                        </div>

                        <div className="flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-engine group-hover:translate-x-1 transition-transform">
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
          <div className="text-center py-20 glass-panel border border-border-subtle chamfer flex flex-col items-center justify-center gap-4 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-bg-tertiary flex items-center justify-center text-text-muted">
              <Compass className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-text-primary">Aucun projet trouvé</h3>
              <p className="text-xs text-text-secondary mt-1">Ajustez vos termes de recherche ou sélectionnez un autre filtre.</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
