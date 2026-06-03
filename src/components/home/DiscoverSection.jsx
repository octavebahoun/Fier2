import React from 'react';
import { Compass, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import FadeInWhenVisible from './FadeInWhenVisible.jsx';

export default function DiscoverSection({ decouvrir, navigate }) {
  return (
    <section id="decouvrir" className="py-24 px-6 md:px-12 lg:px-24 border-b border-border-subtle relative overflow-hidden bg-bg-primary dot-grid">
      {/* Glow Ambient Spots */}
      <div className="absolute top-[20%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-radial from-fieri-blue/20 to-transparent blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-radial from-accent-secondary/15 to-transparent blur-[100px] pointer-events-none z-0" />

      <div className="max-w-[92rem] mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Side: Copywriting Content */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          <FadeInWhenVisible direction="left" delay={0.05}>
            <div className="inline-flex items-center gap-2 bg-accent-primary/10 border border-accent-primary/30 px-3.5 py-1 rounded-full mb-6">
              <Compass className="w-3.5 h-3.5 text-accent-primary animate-[spin_10s_linear_infinite]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-text-primary">
                {decouvrir.tag}
              </span>
            </div>
          </FadeInWhenVisible>

          <FadeInWhenVisible direction="up" delay={0.1}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary leading-tight mb-8">
              {decouvrir.title}
            </h2>
          </FadeInWhenVisible>

          <FadeInWhenVisible direction="up" delay={0.15}>
            <p className="text-base md:text-lg text-text-secondary font-light leading-relaxed max-w-2xl mb-10">
              {decouvrir.description}
            </p>
          </FadeInWhenVisible>

          <FadeInWhenVisible direction="up" delay={0.2}>
            <button 
              onClick={() => {
                const element = document.getElementById('organisation');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group flex items-center justify-center gap-2.5 text-[10px] uppercase tracking-widest font-black bg-accent-primary/10 hover:bg-accent-primary/20 border border-accent-primary/45 hover:border-accent-primary text-text-primary px-8 py-3.5 rounded-full transition-all duration-350 cursor-pointer shadow-[0_0_20px_rgba(27,111,216,0.08)] hover:shadow-[0_0_25px_rgba(27,111,216,0.18)]"
            >
              <span>{decouvrir.cta}</span>
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              >
                ↓
              </motion.span>
            </button>
          </FadeInWhenVisible>

        </div>

        {/* Right Side: High-End Premium Tech Schematic / Glassmorphic Globe */}
        <div className="lg:col-span-5 flex justify-center items-center relative">
          <FadeInWhenVisible direction="right" delay={0.1}>
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full border border-border-subtle/60 flex items-center justify-center bg-bg-secondary/15 backdrop-blur-[3px] shadow-[0_12px_45px_rgba(0,0,0,0.4)] group overflow-hidden">
              {/* Inner glowing core */}
              <div className="absolute w-24 h-24 rounded-full bg-radial from-fieri-blue/40 to-transparent blur-[25px] animate-pulse" />
              
              {/* Rotating cyber-circuit circles */}
              <motion.div 
                className="absolute inset-4 rounded-full border border-dashed border-accent-primary/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
              />
              <motion.div 
                className="absolute inset-12 rounded-full border border-accent-secondary/25 border-t-transparent"
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              />
              <motion.div 
                className="absolute inset-20 rounded-full border border-dashed border-accent-tertiary/20"
                animate={{ rotate: 180 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              />

              {/* Glowing particles or coordinate rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 200 200" className="w-[75%] h-[75%] text-text-primary/15 opacity-60">
                  <line x1="100" y1="0" x2="100" y2="200" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4,4" />
                  <line x1="0" y1="100" x2="200" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4,4" />
                  <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="0.5" fill="none" />
                  <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="0.5" fill="none" />
                  <circle cx="100" cy="100" r="20" stroke="currentColor" strokeWidth="0.5" fill="none" />
                </svg>
              </div>

              {/* Float badge */}
              <div className="absolute top-[20%] right-[15%] bg-bg-secondary border border-accent-secondary/35 text-[9px] font-black uppercase tracking-wider text-accent-secondary px-3 py-1.5 rounded-md shadow-lg flex items-center gap-1.5 animate-bounce">
                <Sparkles className="w-3 h-3 text-accent-secondary animate-pulse" />
                R&D Lab
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </div>
    </section>
  );
}
