import React, { useEffect, useState } from 'react';
import { Calendar, User, Clock, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../services/api.js';
import FadeInWhenVisible from './FadeInWhenVisible.jsx';

export default function WorkshopsSection({ navigate }) {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWorkshops = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.workshops.getAll();
      if (res.success) {
        setWorkshops(res.data.slice(0, 3));
      }
    } catch (err) {
      setError("Impossible de charger les ateliers pour le moment.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.workshops.getAll();
        if (res.success && active) {
          setWorkshops(res.data.slice(0, 3));
        }
      } catch (err) {
        if (active) setError("Impossible de charger les ateliers pour le moment.");
      } finally {
        if (active) setLoading(false);
      }
    };
    fetch();
    return () => { active = false; };
  }, []);

  return (
    <section id="workshops-section" className="py-24 px-6 md:px-12 lg:px-24 border-b border-border-subtle bg-bg-secondary/10 relative overflow-hidden">
      {/* Cosmic ambient halos */}
      <div className="absolute top-[30%] left-[80%] w-[35vw] h-[35vw] rounded-full bg-radial from-fieri-blue/18 to-transparent blur-[90px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-radial from-accent-primary/12 to-transparent blur-[110px] pointer-events-none z-0" />

      <div className="max-w-[92rem] mx-auto w-full relative z-10">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <FadeInWhenVisible direction="left" delay={0.05}>
            <div className="inline-flex items-center gap-2 bg-accent-primary/10 border border-accent-primary/30 px-3.5 py-1 rounded-full mb-4">
              <BookOpen className="w-3.5 h-3.5 text-accent-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-text-primary">
                07 — ATELIERS TECHNIQUES
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary leading-tight">
              Nos prochains bootcamps & ateliers
            </h2>
          </FadeInWhenVisible>
          
          <FadeInWhenVisible direction="right" delay={0.1}>
            <button 
              onClick={() => navigate('workshops')}
              className="mt-6 md:mt-0 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-black bg-transparent border border-border-subtle hover:border-accent-primary text-text-secondary hover:text-text-primary hover:bg-white/5 px-6 py-3 rounded-full transition-all duration-350 cursor-pointer"
            >
              <span>Voir tout le catalogue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </FadeInWhenVisible>
        </div>

        {/* Loading skeleton or Cards grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6.5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="glass-panel h-80 rounded-2xl animate-pulse bg-bg-secondary/40 border border-border-subtle/60" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
              <span className="text-red-400 text-xl font-black">!</span>
            </div>
            <p className="text-text-secondary text-sm font-light mb-4">{error}</p>
            <button
              onClick={fetchWorkshops}
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-black bg-accent-primary/10 border border-accent-primary/30 text-accent-primary px-5 py-2.5 rounded-full hover:bg-accent-primary/20 transition-all cursor-pointer"
            >
              Réessayer
            </button>
          </div>
        ) : workshops.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-secondary text-sm font-light">Aucun atelier programmé pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6.5">
            {workshops.map((work, index) => (
              <FadeInWhenVisible key={work.id} delay={index * 0.08} direction="up">
                <div 
                  onClick={() => navigate('workshops')}
                  className="glass-panel h-full p-7.5 rounded-2xl relative overflow-hidden group transition-all duration-350 border border-border-subtle hover:border-accent-primary/35 hover:bg-bg-secondary/40 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between"
                >
                  {/* Subtle inner card decoration */}
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-accent-primary/60 to-accent-secondary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-350" />

                  <div>
                    {/* Top Row: Level tag + Spaces left */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[9px] font-black uppercase tracking-widest bg-accent-primary/10 border border-accent-primary/25 text-accent-primary px-3 py-1 rounded-full">
                        {work.level}
                      </span>
                      <span className="text-[10px] font-bold text-text-muted">
                        Places : <strong className="text-accent-secondary">{work.placesLeft}</strong>/{work.totalPlaces}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-extrabold text-text-primary mb-4.5 group-hover:text-accent-primary transition-colors leading-snug">
                      {work.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-text-secondary font-light leading-relaxed mb-6 line-clamp-3">
                      {work.desc}
                    </p>
                  </div>

                  {/* Metadata block */}
                  <div className="border-t border-border-subtle/50 pt-5 mt-auto flex flex-col gap-2.5">
                    <div className="flex items-center gap-2.5 text-xs text-text-secondary">
                      <User className="w-4 h-4 text-text-muted shrink-0" />
                      <span className="truncate">Instructeur : <strong className="text-text-primary font-medium">{work.instructor}</strong></span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-text-secondary mt-1">
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-text-muted shrink-0" />
                        <span>{work.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium text-accent-secondary">
                        <Clock className="w-3.5 h-3.5 text-text-muted shrink-0" />
                        <span>{work.duration}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </FadeInWhenVisible>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
