import React from 'react';
import { Activity, Cpu, Globe2, Award } from 'lucide-react';
import FadeInWhenVisible from './FadeInWhenVisible.jsx';

export default function PillarsSection({ mission }) {
  return (
    <section className="py-24 px-6 md:px-12 lg:px-24 border-b border-border-subtle bg-bg-secondary/20 relative">
      {/* Glow Spots */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] max-w-[600px] rounded-full bg-radial from-fieri-blue/26 to-transparent blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55vw] h-[55vw] max-w-[650px] rounded-full bg-radial from-accent-primary/24 to-transparent blur-[130px] pointer-events-none z-0" />
      
      <div className="max-w-[92rem] mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <FadeInWhenVisible direction="down">
            <span className="text-xs font-bold tracking-[0.2em] text-accent-primary uppercase">{mission.tag}</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-3 text-text-primary">
              {mission.title}
            </h2>
          </FadeInWhenVisible>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mission.pillars.map((pillar, index) => (
            <FadeInWhenVisible key={index} delay={index * 0.08} direction="up">
              <div className="h-full bg-bg-secondary/40 backdrop-blur-md p-6 rounded-xl border border-border-subtle hover:border-accent-primary/30 transition-all duration-300 hover:-translate-y-1 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary mb-5">
                  {index === 0 && <Activity className="w-5 h-5" />}
                  {index === 1 && <Cpu className="w-5 h-5" />}
                  {index === 2 && <Globe2 className="w-5 h-5" />}
                  {index === 3 && <Award className="w-5 h-5" />}
                </div>
                <h3 className="text-lg font-bold mb-3 text-text-primary">{pillar.title}</h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-light">{pillar.desc}</p>
              </div>
            </FadeInWhenVisible>
          ))}
        </div>
      </div>
    </section>
  );
}
