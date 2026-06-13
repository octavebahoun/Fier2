import React from 'react';
import { Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import FadeInWhenVisible from './FadeInWhenVisible.jsx';

export default function DiscoverSection({ decouvrir, navigate }) {
  return (
    <section id="decouvrir" className="py-24 px-6 md:px-12 lg:px-24 border-b border-border-subtle relative overflow-hidden bg-bg-primary dot-grid">
      {/* Glow Ambient Spots */}
      <div className="absolute top-[20%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-radial from-fieri-blue/20 to-transparent blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-radial from-accent-secondary/15 to-transparent blur-[100px] pointer-events-none z-0" />

      <div className="max-w-[92rem] mx-auto w-full relative z-10 flex flex-col items-center text-center">

        {/* Badge de navigation centré */}
        <FadeInWhenVisible direction="up" delay={0.05}>
          <div className="inline-flex items-center gap-2 bg-accent-primary/10 border border-accent-primary/30 px-3.5 py-1 rounded-full mb-6">
            <Compass className="w-3.5 h-3.5 text-accent-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-text-primary">
              {decouvrir.tag}
            </span>
          </div>
        </FadeInWhenVisible>

        {/* Titre principal centré */}
        <FadeInWhenVisible direction="up" delay={0.1}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary leading-tight mb-8 max-w-4xl mx-auto">
            {decouvrir.title}
          </h2>
        </FadeInWhenVisible>

        {/* Description centrée */}
        <FadeInWhenVisible direction="up" delay={0.15}>
          <p className="text-base md:text-lg text-text-secondary font-light leading-relaxed max-w-2xl mb-10 mx-auto">
            {decouvrir.description}
          </p>
        </FadeInWhenVisible>

        {/* Bouton d'action centré */}
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
    </section>
  );
}