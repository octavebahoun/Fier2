import React from 'react';
import { Activity, Cpu, Globe2, Award, Shield } from 'lucide-react';
import FadeInWhenVisible from './FadeInWhenVisible.jsx';

export default function MissionsSection({ mission }) {
  // Map icons and colors
  const getPillarConfig = (index) => {
    switch (index) {
      case 0:
        return {
          icon: <Activity className="w-5.5 h-5.5 text-[#E8640C]" />,
          bgClass: "bg-[#E8640C]/8 border-[#E8640C]/20 shadow-[0_0_15px_rgba(232,100,12,0.08)]",
          glowClass: "from-[#E8640C]/12 to-transparent"
        };
      case 1:
        return {
          icon: <Cpu className="w-5.5 h-5.5 text-[#1B6FD8]" />,
          bgClass: "bg-[#1B6FD8]/8 border-[#1B6FD8]/20 shadow-[0_0_15px_rgba(27,111,216,0.08)]",
          glowClass: "from-[#1B6FD8]/12 to-transparent"
        };
      case 2:
        return {
          icon: <Globe2 className="w-5.5 h-5.5 text-[#00E5FF]" />,
          bgClass: "bg-[#00E5FF]/8 border-[#00E5FF]/20 shadow-[0_0_15px_rgba(0,229,255,0.08)]",
          glowClass: "from-[#00E5FF]/12 to-transparent"
        };
      case 3:
      default:
        return {
          icon: <Award className="w-5.5 h-5.5 text-[#FFB800]" />,
          bgClass: "bg-[#FFB800]/8 border-[#FFB800]/20 shadow-[0_0_15px_rgba(255,184,0,0.08)]",
          glowClass: "from-[#FFB800]/12 to-transparent"
        };
    }
  };

  return (
    <section id="missions" className="py-24 px-6 md:px-12 lg:px-24 border-b border-border-subtle bg-bg-secondary/15 relative overflow-hidden">
      {/* Background radial cosmic glows */}
      <div className="absolute top-[25%] right-[15%] w-[45vw] h-[45vw] rounded-full bg-radial from-fieri-blue/15 to-transparent blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[25%] left-[15%] w-[45vw] h-[45vw] rounded-full bg-radial from-accent-tertiary/12 to-transparent blur-[120px] pointer-events-none z-0" />

      <div className="max-w-[92rem] mx-auto w-full relative z-10">
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <FadeInWhenVisible direction="down" delay={0.05}>
            <div className="inline-flex items-center gap-2 bg-accent-primary/10 border border-accent-primary/30 px-3.5 py-1 rounded-full mb-4">
              <Shield className="w-3.5 h-3.5 text-accent-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-text-primary">
                {mission.tag}
              </span>
            </div>
          </FadeInWhenVisible>

          <FadeInWhenVisible direction="up" delay={0.1}>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary leading-tight">
              {mission.title}
            </h2>
          </FadeInWhenVisible>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6.5">
          {mission.pillars.map((pillar, index) => {
            const config = getPillarConfig(index);
            return (
              <FadeInWhenVisible key={index} delay={index * 0.08} direction="up">
                <div className="glass-panel h-full p-8 rounded-2xl relative overflow-hidden group transition-all duration-350 border border-border-subtle hover:border-transparent hover:bg-bg-secondary/40 hover:-translate-y-1.5 shadow-md flex flex-col justify-start">
                  
                  {/* Internal ambient corner glow */}
                  <div className={`absolute -bottom-12 -right-12 w-28 h-28 rounded-full bg-radial ${config.glowClass} blur-[25px] transition-all duration-350 pointer-events-none`} />

                  {/* Icon Block */}
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-6.5 group-hover:scale-110 transition-transform duration-350 ${config.bgClass}`}>
                    {config.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-extrabold mb-3.5 text-text-primary group-hover:text-text-primary/95 transition-colors">
                    {pillar.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-light group-hover:text-text-secondary/95 transition-colors">
                    {pillar.desc}
                  </p>
                </div>
              </FadeInWhenVisible>
            );
          })}
        </div>
      </div>
    </section>
  );
}
