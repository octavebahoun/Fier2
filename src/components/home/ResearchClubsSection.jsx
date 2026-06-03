import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Zap, Flame, Layers, Binary, Atom, Award, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import FadeInWhenVisible from './FadeInWhenVisible.jsx';
import ClubBackgroundMotif from './ClubBackgroundMotif.jsx';

const getClubIcon = (kicker) => {
  switch (kicker) {
    case 'Robotique et Automatisation':
      return <Cpu className="w-5 h-5 text-accent-primary" />;
    case 'Informatique Industrielle & IoT':
      return <Zap className="w-5 h-5 text-accent-secondary" />;
    case 'Éco-Énergie & Climatisation':
      return <Flame className="w-5 h-5 text-accent-tertiary" />;
    case 'Construction 4.0':
      return <Layers className="w-5 h-5 text-accent-primary" />;
    case 'Intelligence Artificielle':
      return <Binary className="w-5 h-5 text-accent-secondary" />;
    case 'Innovation Tech & Entrepreneuriat':
      return <Atom className="w-5 h-5 text-accent-tertiary" />;
    default:
      return <Cpu className="w-5 h-5 text-accent-primary" />;
  }
};

const slideVariants = {
  enter: (direction) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction > 0 ? -300 : 300, opacity: 0 })
};

export default function ResearchClubsSection({ clubs, navigate }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);
  const total = clubs.items.length;

  const goTo = useCallback((index) => {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  }, [activeIndex]);

  const next = useCallback(() => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (isPaused || total <= 1) return;
    intervalRef.current = setInterval(next, 1000);
    return () => clearInterval(intervalRef.current);
  }, [isPaused, next, total]);

  const club = clubs.items[activeIndex];

  return (
    <section
      id="clubs"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="py-24 px-6 md:px-12 lg:px-24 border-b border-border-subtle bg-bg-secondary/10 relative"
    >
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] rounded-full bg-radial from-accent-primary/24 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute top-[15%] left-[10%] w-[45vw] h-[45vw] max-w-[550px] rounded-full bg-radial from-fieri-blue/28 to-transparent blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[15%] right-[10%] w-[45vw] h-[45vw] max-w-[550px] rounded-full bg-radial from-accent-secondary/22 to-transparent blur-[120px] pointer-events-none z-0" />

      <div className="max-w-[92rem] mx-auto w-full relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <FadeInWhenVisible direction="left">
            <span className="text-xs font-bold tracking-[0.2em] text-accent-primary uppercase">{clubs.tag}</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-3">
              {clubs.title}
            </h2>
          </FadeInWhenVisible>
        </div>

          {/* Carousel */}
          <div className="relative max-w-5xl mx-auto">
            {/* Slide area */}
            <div className="overflow-hidden rounded-2xl border border-border-subtle/80 shadow-xl shadow-black/20">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={activeIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-bg-secondary/90 backdrop-blur-xl border border-white/5 p-6 md:p-10 rounded-2xl relative overflow-hidden"
                >
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-radial from-accent-primary/26 to-transparent blur-[50px] pointer-events-none" />

                <ClubBackgroundMotif kicker={club.kicker} />

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-bg-primary border border-border-subtle">
                      {getClubIcon(club.kicker)}
                    </div>
                    <span className="text-[10px] font-bold tracking-widest text-accent-secondary uppercase">
                      LAB_RECHERCHE_{String(activeIndex + 1).padStart(2, '0')}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
                    <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase">
                      {club.kicker}
                    </span>
                  </div>

                  <h3 className="text-xl md:text-2xl font-extrabold text-text-primary mb-4">
                    {club.title}
                  </h3>

                  <p className="text-sm md:text-base text-text-secondary font-light leading-relaxed mb-6 max-w-3xl">
                    {club.desc}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 border-t border-b border-border-subtle/50 py-6">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-accent-primary mb-3">Divisions de Recherche</div>
                      <ul className="space-y-2">
                        {club.divisions.map((div, i) => (
                          <li key={i} className="text-xs text-text-secondary flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-accent-secondary" />
                            {div}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-accent-primary mb-3">Projet Phare Actuel</div>
                      <div className="p-3.5 rounded-lg bg-bg-primary/60 border border-border-subtle/55 flex items-start gap-2.5">
                        <Award className="w-4 h-4 text-accent-secondary shrink-0 mt-0.5" />
                        <div className="text-xs text-text-primary font-medium leading-relaxed">
                          {club.projetPhare}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => navigate('clubs')}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent-primary text-text-primary text-xs font-bold hover:bg-accent-primary/95 transition-all shadow-md cursor-pointer"
                    >
                      Consulter les Projets R&D
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] text-text-muted font-mono uppercase">
                      fieri // internal_rd_division
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation arrows */}
          {total > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-bg-secondary/80 border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-secondary backdrop-blur-md transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-bg-secondary/80 border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-secondary backdrop-blur-md transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Dots */}
        {total > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {clubs.items.map((_, index) => (
              <button
                key={index}
                onClick={() => goTo(index)}
                className={`rounded-full transition-all duration-300 cursor-pointer ${
                  index === activeIndex
                    ? 'w-8 h-2 bg-accent-primary'
                    : 'w-2 h-2 bg-border-subtle hover:bg-text-muted'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}