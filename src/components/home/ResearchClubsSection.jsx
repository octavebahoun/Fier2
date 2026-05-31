import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Zap, Flame, Layers, Binary, Atom, Award, ChevronRight, ArrowRight } from 'lucide-react';
import FadeInWhenVisible from './FadeInWhenVisible.jsx';
import ClubBackgroundMotif from './ClubBackgroundMotif.jsx';

// Maps club kicker to direct styling accent or icon
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

export default function ResearchClubsSection({ clubs, navigate }) {
  const [activeClubIndex, setActiveClubIndex] = useState(0);

  return (
    <section id="clubs" className="py-24 px-6 md:px-12 lg:px-24 border-b border-border-subtle bg-bg-secondary/10 relative">
      {/* Glow Spots */}
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] rounded-full bg-radial from-accent-primary/24 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute top-[15%] left-[10%] w-[45vw] h-[45vw] max-w-[550px] rounded-full bg-radial from-fieri-blue/28 to-transparent blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[15%] right-[10%] w-[45vw] h-[45vw] max-w-[550px] rounded-full bg-radial from-accent-secondary/22 to-transparent blur-[120px] pointer-events-none z-0" />
      
      <div className="max-w-[92rem] mx-auto w-full relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <FadeInWhenVisible direction="left">
            <span className="text-xs font-bold tracking-[0.2em] text-accent-primary uppercase">{clubs.tag}</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-3">
              {clubs.title}
            </h2>
          </FadeInWhenVisible>
        </div>

        {/* Desktop Layout: Split Navigation and Panel */}
        <div className="hidden lg:grid grid-cols-12 gap-8 items-stretch">
          
          {/* Left menu selection */}
          <div className="col-span-4 flex flex-col gap-3">
            {clubs.items.map((club, index) => (
              <button
                key={index}
                onClick={() => setActiveClubIndex(index)}
                className={`w-full text-left p-5 rounded-xl border transition-all duration-300 cursor-pointer ${
                  activeClubIndex === index 
                    ? 'bg-bg-secondary border-accent-primary shadow-lg shadow-black/25 text-text-primary' 
                    : 'bg-transparent border-border-subtle text-text-secondary hover:border-accent-primary/30 hover:bg-bg-secondary/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${activeClubIndex === index ? 'bg-accent-primary/20 text-accent-primary' : 'bg-bg-secondary text-text-secondary'}`}>
                    {getClubIcon(club.kicker)}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-accent-secondary">{club.kicker}</div>
                    <div className="text-sm font-bold truncate max-w-[200px]">{club.title}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Right showcase panel */}
          <div className="col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeClubIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="h-full bg-bg-secondary/60 backdrop-blur-md border border-border-subtle p-8 rounded-2xl relative overflow-hidden flex flex-col justify-between"
              >
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-radial from-accent-primary/26 to-transparent blur-[50px] pointer-events-none" />
                
                {/* Background scientific motif */}
                <ClubBackgroundMotif kicker={clubs.items[activeClubIndex].kicker} />

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-bold tracking-widest text-accent-secondary uppercase">
                      LAB_RECHERCHE_0{activeClubIndex + 1}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
                    <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase">
                      {clubs.items[activeClubIndex].kicker}
                    </span>
                  </div>

                  <h3 className="text-2xl font-extrabold text-text-primary mb-6">
                    {clubs.items[activeClubIndex].title}
                  </h3>

                  <p className="text-base text-text-secondary font-light leading-relaxed mb-8">
                    {clubs.items[activeClubIndex].desc}
                  </p>

                  {/* Divisions & Activities */}
                  <div className="grid grid-cols-2 gap-6 mb-8 border-t border-b border-border-subtle/50 py-6">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-accent-primary mb-3">Divisions de Recherche</div>
                      <ul className="space-y-2">
                        {clubs.items[activeClubIndex].divisions.map((div, i) => (
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
                          {clubs.items[activeClubIndex].projetPhare}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
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
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Layout: Expandable Card Accordion Stack */}
        <div className="lg:hidden space-y-4">
          {clubs.items.map((club, index) => (
            <div 
              key={index}
              className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                activeClubIndex === index 
                  ? 'bg-bg-secondary border-accent-primary' 
                  : 'bg-bg-secondary/40 border-border-subtle'
              }`}
            >
              <button
                onClick={() => setActiveClubIndex(index)}
                className="w-full text-left p-5 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-bg-primary text-accent-primary">
                    {getClubIcon(club.kicker)}
                  </div>
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-accent-secondary">{club.kicker}</div>
                    <div className="text-sm font-bold text-text-primary">{club.title}</div>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 text-text-secondary transition-transform ${activeClubIndex === index ? 'rotate-90' : ''}`} />
              </button>

              {activeClubIndex === index && (
                <div className="px-5 pb-5 border-t border-border-subtle/50 pt-4 bg-bg-secondary/20 relative overflow-hidden">
                  {/* Background scientific motif */}
                  <div className="absolute -bottom-16 -right-16 w-52 h-52 opacity-[0.08] pointer-events-none z-0">
                    <ClubBackgroundMotif kicker={club.kicker} />
                  </div>
                  <p className="text-xs text-text-secondary font-light leading-relaxed mb-4">{club.desc}</p>
                  
                  <div className="text-[9px] font-bold uppercase tracking-wider text-accent-primary mb-2">Divisions</div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {club.divisions.map((div, i) => (
                      <span key={i} className="text-[10px] bg-bg-primary border border-border-subtle px-2 py-1 rounded">
                        {div}
                      </span>
                    ))}
                  </div>

                  <div className="text-[9px] font-bold uppercase tracking-wider text-accent-primary mb-2">Projet Phare</div>
                  <div className="text-xs text-text-primary font-medium bg-bg-primary/80 border border-border-subtle p-3 rounded-lg leading-relaxed mb-4">
                    {club.projetPhare}
                  </div>

                  <button
                    onClick={() => navigate('clubs')}
                    className="w-full py-2.5 rounded-lg bg-accent-primary text-text-primary text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Consulter les Projets R&D
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
