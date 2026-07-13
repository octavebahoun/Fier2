import React from 'react';
import FadeInWhenVisible from './FadeInWhenVisible.jsx';
import AnimatedCounter from './AnimatedCounter.jsx';

export default function StatsSection({ stats }) {
  return (
    <section id="stats" className="py-16 px-6 md:px-12 lg:px-12 border-b border-border-subtle dot-grid relative">
      {/* Glow Spots */}
      <div className="absolute top-[20%] left-[20%] w-[35vw] h-[35vw] max-w-[400px] rounded-full bg-radial from-fieri-blue/24 to-transparent blur-[90px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[20%] w-[35vw] h-[35vw] max-w-[400px] rounded-full bg-radial from-accent-secondary/18 to-transparent blur-[90px] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/2 via-transparent to-accent-tertiary/2 pointer-events-none" />
      
      <div className="max-w-[92rem] mx-auto w-full relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.items.map((stat, index) => (
            <FadeInWhenVisible key={index} delay={index * 0.08} direction="up">
              <div className="text-center p-6 rounded-2xl bg-bg-secondary/20 hover:bg-bg-secondary/50 border border-transparent hover:border-accent-primary/20 transition-all duration-300 hover:-translate-y-1 group">
                <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-accent-secondary mb-2 tracking-tight transition-colors duration-300 group-hover:text-[#FFB800] drop-shadow-[0_0_15px_rgba(245,166,35,0.06)]">
                  <AnimatedCounter value={stat.value} />
                </div>
                <div className="text-xs sm:text-sm text-text-secondary uppercase tracking-widest font-semibold transition-colors duration-300 group-hover:text-text-primary">
                  {stat.label}
                </div>
              </div>
            </FadeInWhenVisible>
          ))}
        </div>
      </div>
    </section>
  );
}
