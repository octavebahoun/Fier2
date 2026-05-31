import React from 'react';
import { Layers } from 'lucide-react';
import FadeInWhenVisible from './FadeInWhenVisible.jsx';

export default function EcosystemSection({ decouvrir }) {
  return (
    <section id="decouvrir" className="py-24 px-6 md:px-12 lg:px-24 border-b border-border-subtle dot-grid relative">
      {/* Glow Spots */}
      <div className="absolute top-1/2 left-10 w-96 h-96 rounded-full bg-radial from-accent-primary/24 to-transparent blur-[100px] pointer-events-none" />
      <div className="absolute top-[10%] right-[5%] w-[40vw] h-[40vw] max-w-[450px] rounded-full bg-radial from-fieri-blue/26 to-transparent blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] left-[5%] w-[40vw] h-[40vw] max-w-[450px] rounded-full bg-radial from-accent-secondary/18 to-transparent blur-[120px] pointer-events-none z-0" />

      <div className="max-w-[92rem] mx-auto w-full relative z-10">
        <FadeInWhenVisible direction="left">
          <div className="text-xs font-bold tracking-[0.2em] text-accent-primary mb-3 uppercase">{decouvrir.tag}</div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            {decouvrir.title} <span className="text-accent-tertiary">— {decouvrir.subtitle}</span>
          </h2>
          <p className="text-text-secondary text-base md:text-lg font-light max-w-3xl mb-16 leading-relaxed">
            {decouvrir.description}
          </p>
        </FadeInWhenVisible>

        {/* Bento Grid Entities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {decouvrir.entities.map((entity, index) => (
            <FadeInWhenVisible key={entity.id} delay={index * 0.1} direction="up">
              <div className="glass-panel h-full p-8 rounded-xl relative overflow-hidden group transition-all duration-300 shadow-md">
                
                {/* Glowing halo in card background */}
                <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-radial from-accent-primary/26 to-transparent blur-[30px] group-hover:from-accent-primary/20 transition-all duration-300" />
                
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-bold tracking-widest text-accent-secondary bg-bg-secondary px-3 py-1 rounded-full border border-border-subtle shadow-sm uppercase">
                    {entity.id}
                  </span>
                  <Layers className="w-5 h-5 text-accent-primary opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
                </div>
                
                <h3 className="text-xl font-bold mb-4 text-text-primary group-hover:text-accent-primary transition-colors">
                  {entity.name}
                </h3>
                
                <p className="text-sm text-text-secondary font-light leading-relaxed">
                  {entity.desc}
                </p>
              </div>
            </FadeInWhenVisible>
          ))}
        </div>
      </div>
    </section>
  );
}
