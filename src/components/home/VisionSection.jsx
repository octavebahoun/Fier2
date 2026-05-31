import React from 'react';
import { Target, Cpu, Lightbulb, GraduationCap } from 'lucide-react';
import FadeInWhenVisible from './FadeInWhenVisible.jsx';

export default function VisionSection({ vision }) {
  // Config for highlight icons
  const getHighlightIcon = (index) => {
    switch (index) {
      case 0:
        return <Cpu className="w-5 h-5 text-accent-primary animate-pulse" />;
      case 1:
        return <Target className="w-5 h-5 text-accent-secondary" />;
      case 2:
      default:
        return <Lightbulb className="w-5 h-5 text-accent-tertiary" />;
    }
  };

  return (
    <section id="vision" className="py-24 px-6 md:px-12 lg:px-24 border-b border-border-subtle dot-grid relative overflow-hidden bg-bg-primary">
      {/* Glow spots */}
      <div className="absolute top-[40%] left-[20%] w-[45vw] h-[45vw] rounded-full bg-radial from-fieri-blue/18 to-transparent blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-radial from-accent-tertiary/12 to-transparent blur-[100px] pointer-events-none z-0" />

      <div className="max-w-[92rem] mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12.5 items-center">
        
        {/* Left Column: Vision Pitch (Main Text block inside premium glass panel) */}
        <div className="lg:col-span-6 flex flex-col items-start text-left">
          <FadeInWhenVisible direction="left" delay={0.05}>
            <div className="inline-flex items-center gap-2 bg-accent-tertiary/15 border border-accent-tertiary/35 px-3.5 py-1 rounded-full mb-6">
              <Target className="w-3.5 h-3.5 text-accent-tertiary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-text-primary">
                {vision.tag}
              </span>
            </div>
          </FadeInWhenVisible>

          <FadeInWhenVisible direction="up" delay={0.1}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary leading-tight mb-8">
              {vision.title}
            </h2>
          </FadeInWhenVisible>

          <FadeInWhenVisible direction="up" delay={0.15}>
            <div className="relative glass-panel p-8 sm:p-9 rounded-2xl border border-border-subtle bg-bg-secondary/20 shadow-[0_12px_45px_rgba(0,0,0,0.3)] overflow-hidden">
              {/* Soft decorative glow */}
              <div className="absolute -top-12 -left-12 w-28 h-28 rounded-full bg-radial from-accent-tertiary/20 to-transparent blur-[25px]" />
              
              <p className="text-base sm:text-lg text-text-secondary leading-relaxed font-light relative z-10 italic">
                "{vision.text}"
              </p>
              
              <div className="flex items-center gap-3.5 mt-7 relative z-10">
                <div className="w-10 h-10 rounded-full border border-border-subtle bg-bg-secondary flex items-center justify-center text-accent-tertiary">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase tracking-widest text-text-primary">FIERI Scientific Board</div>
                  <div className="text-[9px] text-text-muted">Research Leadership Initiative</div>
                </div>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>

        {/* Right Column: Dynamic Timeline / Highlights Cards */}
        <div className="lg:col-span-6 flex flex-col gap-6.5">
          {vision.highlights.map((highlight, index) => (
            <FadeInWhenVisible key={index} delay={index * 0.12} direction="right">
              <div className="flex gap-5.5 p-6 rounded-2xl border border-border-subtle bg-bg-secondary/15 hover:bg-bg-secondary/40 hover:border-accent-primary/20 transition-all duration-350 shadow-sm group">
                
                {/* Floating Icon box with glow */}
                <div className="shrink-0 w-11 h-11 rounded-xl bg-bg-secondary border border-border-subtle flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:border-transparent transition-all duration-350 relative overflow-hidden">
                  <div className="absolute inset-0 bg-radial from-accent-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  {getHighlightIcon(index)}
                </div>

                <div className="flex flex-col text-left justify-center">
                  <h3 className="text-base font-extrabold text-text-primary group-hover:text-accent-primary transition-colors mb-2">
                    {highlight.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary font-light leading-relaxed">
                    {highlight.desc}
                  </p>
                </div>

              </div>
            </FadeInWhenVisible>
          ))}
        </div>

      </div>
    </section>
  );
}
