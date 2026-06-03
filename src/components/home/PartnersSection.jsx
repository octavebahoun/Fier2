import React from 'react';
import { Globe2 } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import FadeInWhenVisible from './FadeInWhenVisible.jsx';

export default function PartnersSection({ partenaires }) {
  const shouldReduceMotion = useReducedMotion();
  // Duplicate logos array to make a seamless infinite loop scrolling effect
  const duplicatedLogos = [...partenaires.logos, ...partenaires.logos, ...partenaires.logos];

  return (
    <section id="partenaires" className="py-20 px-6 md:px-12 lg:px-24 border-b border-border-subtle bg-bg-secondary/5 relative overflow-hidden">
      {/* Glow ambient background spot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[25vw] rounded-full bg-radial from-accent-primary/6 to-transparent blur-[120px] pointer-events-none z-0" />

      <div className="max-w-[92rem] mx-auto w-full relative z-10">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <FadeInWhenVisible direction="down" delay={0.05}>
            <div className="inline-flex items-center gap-2 bg-accent-primary/10 border border-accent-primary/30 px-3.5 py-1 rounded-full mb-3.5">
              <Globe2 className="w-3.5 h-3.5 text-accent-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-text-primary">
                {partenaires.tag}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-text-primary">
              {partenaires.title}
            </h2>
          </FadeInWhenVisible>
        </div>

        {/* Seamless Infinite Loop Horizontal Ticker Container */}
        <div className="w-full relative py-4 overflow-hidden mask-fade-horizontal">
          <motion.div 
            className="flex items-center gap-6.5 w-max"
            animate={shouldReduceMotion ? {} : { x: [0, -1200] }}
            transition={{
              repeat: Infinity,
              duration: 35,
              ease: "linear"
            }}
          >
            {duplicatedLogos.map((partner, index) => (
              <div 
                key={index}
                className="glass-panel shrink-0 px-8 py-5.5 rounded-2xl border border-border-subtle/70 bg-bg-secondary/20 hover:bg-bg-secondary/40 hover:border-accent-primary/20 transition-all duration-350 shadow-sm flex flex-col items-start gap-1 select-none cursor-default group"
              >
                {/* Glowing decoration inside element */}
                <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full bg-radial from-accent-primary/12 to-transparent blur-[20px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <span className="text-sm font-black text-text-primary group-hover:text-accent-primary transition-colors">
                  {partner.name}
                </span>
                
                <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted">
                  {partner.type}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  );
}
