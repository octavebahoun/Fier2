import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight } from 'lucide-react';
import FadeInWhenVisible from './FadeInWhenVisible.jsx';
import heroBg from '../../assets/hero.webp';

export default function HeroSection({ hero, navigate }) {
  return (
    <section id="hero" className="relative min-h-[92vh] flex items-center justify-center pt-24 px-6 md:px-12 lg:px-24 blueprint-grid border-b border-border-subtle overflow-hidden">
      {/* Vignette gradients to ensure extreme readability & premium cosmic ambiance */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/75 to-bg-primary/35 z-0" />
      <div className="absolute inset-0 bg-radial from-transparent via-bg-primary/10 to-bg-primary/90 z-0" />

      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.55] mix-blend-screen"
        style={{ backgroundImage: `url(${heroBg})` }}
      />

      {/* Glow Halos representing Laboratory Atmosphere */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] rounded-full bg-radial from-accent-primary/30 to-transparent blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-10 right-10 w-[30vw] h-[30vw] rounded-full bg-radial from-accent-tertiary/18 to-transparent blur-[80px] pointer-events-none z-0" />
      <div className="absolute top-[40%] left-[20%] w-[35vw] h-[35vw] rounded-full bg-radial from-fieri-blue/24 to-transparent blur-[90px] pointer-events-none z-0" />

      {/* Circulating Energy Lines (Parametric Circuit Motifs in Background) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60 z-0">
        <svg width="100%" height="100%" className="absolute inset-0">
          {/* Pulsating Glowing Circuit Paths */}
          <path className="circuit-trace-1" d="M -50 150 L 200 150 L 250 200 L 400 200 L 450 150 L 700 150" stroke="#1B6FD8" strokeWidth="1.2" fill="none" style={{ filter: 'drop-shadow(0 0 4px #1B6FD8)' }} />
          <path className="circuit-trace-2" d="M 1200 600 L 1000 600 L 950 550 L 700 550" stroke="#E8640C" strokeWidth="1.0" fill="none" style={{ filter: 'drop-shadow(0 0 4px #E8640C)' }} />

          {/* Added circuit path 3 (Upper Right) */}
          <path className="circuit-trace-1" d="M 1100 80 L 1250 80 L 1300 130 L 1450 130" stroke="#1B6FD8" strokeWidth="1.0" fill="none" style={{ filter: 'drop-shadow(0 0 3px #1B6FD8)' }} />
          {/* Added circuit path 4 (Middle Left) */}
          <path className="circuit-trace-2" d="M -20 500 L 150 500 L 200 450 L 350 450" stroke="#E8640C" strokeWidth="1.1" fill="none" style={{ filter: 'drop-shadow(0 0 3px #E8640C)' }} />

          {/* Expanded terminal node junctions with neon shadows */}
          <circle cx="200" cy="150" r="3" fill="#1B6FD8" className="animate-pulse" style={{ filter: 'drop-shadow(0 0 6px #1B6FD8)' }} />
          <circle cx="450" cy="150" r="3" fill="#1B6FD8" className="animate-pulse" style={{ filter: 'drop-shadow(0 0 6px #1B6FD8)' }} />
          <circle cx="950" cy="550" r="3" fill="#E8640C" className="animate-pulse" style={{ filter: 'drop-shadow(0 0 6px #E8640C)' }} />
          <circle cx="1250" cy="80" r="2.5" fill="#1B6FD8" className="animate-pulse" style={{ filter: 'drop-shadow(0 0 5px #1B6FD8)' }} />
          <circle cx="150" cy="500" r="3" fill="#E8640C" className="animate-pulse" style={{ filter: 'drop-shadow(0 0 6px #E8640C)' }} />
        </svg>
      </div>

      <div className="max-w-[92rem] mx-auto w-full relative z-10 flex flex-col items-center text-center">
        {/* Lab-to-Market Tag */}
        <FadeInWhenVisible direction="down" delay={0.05} duration={0.8}>
          <div className="inline-flex items-center gap-2 bg-accent-primary/10 border border-accent-primary/30 px-4 py-1.5 rounded-full mb-8 shadow-[0_0_20px_rgba(27,111,216,0.15)]">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-primary"></span>
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-text-primary">
              {hero.badge}
            </span>
          </div>
        </FadeInWhenVisible>

        {/* Hero title without glowing text effect */}
        <FadeInWhenVisible direction="up" delay={0.1} duration={0.8}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl text-text-primary leading-[1.1] mb-6">
            {hero.title}
          </h1>
        </FadeInWhenVisible>

        {/* Technical Description */}
        <FadeInWhenVisible direction="up" delay={0.15} duration={0.8}>
          <p className="text-sm md:text-base text-text-secondary max-w-3xl leading-relaxed mb-12 font-light">
            {hero.description}
          </p>
        </FadeInWhenVisible>

        {/* Dual Actions CTA */}
        <FadeInWhenVisible direction="up" delay={0.2} duration={0.8}>
          <div className="flex flex-col sm:flex-row items-center gap-4.5 justify-center">
            <button
              onClick={() => navigate('auth')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-black bg-fieri-blue border border-transparent text-white px-8 py-3.5 rounded-full hover:bg-fieri-blue/90 shadow-[0_4px_20px_rgba(27,111,216,0.35)] hover:shadow-[0_4px_25px_rgba(27,111,216,0.5)] hover:-translate-y-0.5 transition-all duration-350 cursor-pointer"
            >
              {hero.ctaPrimary}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => navigate('cite-integration')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-black bg-transparent border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-white/5 px-8 py-3.5 rounded-full hover:-translate-y-0.5 transition-all duration-350 cursor-pointer"
            >
              {hero.ctaSecondary}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </FadeInWhenVisible>
      </div>
    </section>
  );
}
