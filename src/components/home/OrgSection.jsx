import React from 'react';
import { Compass, GraduationCap, LayoutDashboard, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import FadeInWhenVisible from './FadeInWhenVisible.jsx';

export default function OrgSection({ organisation, navigate }) {
  // Map icons and accent glow classes per entity
  const getEntityConfig = (index) => {
    switch (index) {
      case 0:
        return {
          icon: <Compass className="w-5.5 h-5.5 text-[#E8640C]" />,
          accentClass: "group-hover:border-[#E8640C]/50 shadow-[0_0_30px_rgba(232,100,12,0.03)]",
          glowClass: "from-[#E8640C]/24 to-transparent",
          badgeColor: "text-[#E8640C] border-[#E8640C]/25"
        };
      case 1:
        return {
          icon: <GraduationCap className="w-5.5 h-5.5 text-[#1B6FD8]" />,
          accentClass: "group-hover:border-[#1B6FD8]/50 shadow-[0_0_30px_rgba(27,111,216,0.03)]",
          glowClass: "from-[#1B6FD8]/24 to-transparent",
          badgeColor: "text-[#1B6FD8] border-[#1B6FD8]/25"
        };
      case 2:
        default:
        return {
          icon: <LayoutDashboard className="w-5.5 h-5.5 text-[#FFB800]" />,
          accentClass: "group-hover:border-[#FFB800]/50 shadow-[0_0_30px_rgba(255,184,0,0.03)]",
          glowClass: "from-[#FFB800]/24 to-transparent",
          badgeColor: "text-[#FFB800] border-[#FFB800]/25"
        };
    }
  };

  return (
    <section id="organisation" className="py-24 px-6 md:px-12 lg:px-24 border-b border-border-subtle relative bg-bg-primary dot-grid">
      {/* Background Ambience halos */}
      <div className="absolute top-[35%] left-[50%] -translate-x-1/2 w-[60vw] h-[30vw] rounded-full bg-radial from-accent-primary/8 to-transparent blur-[120px] pointer-events-none z-0" />

      <div className="max-w-[92rem] mx-auto w-full relative z-10">
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <FadeInWhenVisible direction="down" delay={0.05}>
            <div className="inline-flex items-center gap-2 bg-accent-secondary/10 border border-accent-secondary/30 px-3.5 py-1 rounded-full mb-4">
              <Sparkles className="w-3.5 h-3.5 text-accent-secondary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-text-primary">
                {organisation.tag}
              </span>
            </div>
          </FadeInWhenVisible>

          <FadeInWhenVisible direction="up" delay={0.1}>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-text-primary leading-tight">
              {organisation.title}
            </h2>
          </FadeInWhenVisible>

          <FadeInWhenVisible direction="up" delay={0.15}>
            <p className="text-text-secondary text-sm md:text-base font-light leading-relaxed">
              {organisation.subtitle}
            </p>
          </FadeInWhenVisible>
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6.5">
          {organisation.entities.map((entity, index) => {
            const config = getEntityConfig(index);
            return (
              <FadeInWhenVisible key={entity.id} delay={index * 0.1} direction="up">
                <div
                  onClick={() => {
                    const routes = ['cite', 'workshops', 'projects'];
                    navigate(routes[index]);
                  }}
                  className={`glass-panel h-full p-8 rounded-2xl relative overflow-hidden group transition-all duration-350 border border-border-subtle hover:bg-bg-secondary/40 ${config.accentClass} hover:-translate-y-1.5 cursor-pointer`}>
                  
                  {/* Cyber glow ambient element inside card */}
                  <div className={`absolute -top-16 -right-16 w-36 h-36 rounded-full bg-radial ${config.glowClass} blur-[35px] group-hover:blur-[25px] transition-all duration-300 pointer-events-none`} />

                  {/* Top card bar: Entity index + Icon */}
                  <div className="flex items-center justify-between mb-8">
                    <span className={`text-[9px] font-black tracking-widest bg-bg-secondary px-3 py-1.5 rounded-full border uppercase ${config.badgeColor} shadow-inner`}>
                      {entity.id}
                    </span>
                    <div className="p-2.5 rounded-xl bg-bg-secondary border border-border-subtle/80 group-hover:scale-110 group-hover:border-transparent transition-all duration-350 shadow-sm">
                      {config.icon}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-extrabold mb-4 text-text-primary transition-colors group-hover:text-text-primary/90">
                    {entity.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-text-secondary font-light leading-relaxed mb-6 group-hover:text-text-secondary/95 transition-colors">
                    {entity.desc}
                  </p>
                  
                  {/* CTA link */}
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 mb-4 cursor-pointer border ${
                    index === 0
                      ? 'bg-[#E8640C]/15 border-[#E8640C]/30 text-[#E8640C] hover:bg-[#E8640C]/25'
                      : index === 1
                      ? 'bg-[#1B6FD8]/15 border-[#1B6FD8]/30 text-[#1B6FD8] hover:bg-[#1B6FD8]/25'
                      : 'bg-[#FFB800]/15 border-[#FFB800]/30 text-[#FFB800] hover:bg-[#FFB800]/25'
                  }`}>
                    <span>Explorer</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>

                  {/* Bottom active circuit path detail */}
                  <div className="w-full h-[1px] bg-border-subtle group-hover:bg-accent-primary/20 relative mt-auto">
                    <div className="absolute top-0 left-0 w-0 h-full bg-accent-primary group-hover:w-full transition-all duration-700 ease-out" />
                  </div>
                </div>
              </FadeInWhenVisible>
            );
          })}
        </div>
      </div>
    </section>
  );
}
