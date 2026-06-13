import React from 'react';
import { Award, Cpu, Calendar, ChevronRight } from 'lucide-react';
import FadeInWhenVisible from './FadeInWhenVisible.jsx';
import WireframeSVG from './WireframeSVG.jsx';

export default function EventsSection({ evenements, navigate }) {
  return (
    <section id="evenements" className="py-24 px-6 md:px-12 lg:px-24 border-b border-border-subtle dot-grid relative">
      {/* Glow Spots */}
      <div className="absolute top-1/2 left-[15%] -translate-y-1/2 w-[35vw] h-[35vw] max-w-[450px] rounded-full bg-radial from-fieri-blue/24 to-transparent blur-[110px] pointer-events-none z-0" />
      <div className="absolute top-1/2 right-[15%] -translate-y-1/2 w-[35vw] h-[35vw] max-w-[450px] rounded-full bg-radial from-accent-tertiary/18 to-transparent blur-[110px] pointer-events-none z-0" />

      <div className="max-w-[92rem] mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <FadeInWhenVisible direction="down">
            <span className="text-xs font-bold tracking-[0.2em] text-accent-primary uppercase">{evenements.tag}</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-3 text-text-primary">
              {evenements.title}
            </h2>
          </FadeInWhenVisible>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {evenements.blocks.map((block, index) => {
            const cardAccents = [
              { color: '#E8640C', tag: 'CONCOURS · OUVERT', icon: <Award className="w-4 h-4 text-accent-primary" />, wireframe: 'cube', code: 'CHALLENGE_C01' },
              { color: '#1B6FD8', tag: 'WORKSHOP · BIENTÔT', icon: <Cpu className="w-4 h-4 text-accent-secondary" />, wireframe: 'radar', code: 'WORKSHOP_W05' },
              { color: '#10B981', tag: 'CONFÉRENCE · ACTIF', icon: <Calendar className="w-4 h-4 text-accent-tertiary" />, wireframe: 'tetrahedron', code: 'MEETUP_M02' }
            ];
            const curAccent = cardAccents[index];

            return (
              <FadeInWhenVisible key={index} delay={index * 0.08} direction="up">
                <div className="group/card relative h-full rounded-2xl border border-border-subtle bg-bg-secondary/20 backdrop-blur-md p-6 flex flex-col justify-between overflow-hidden shadow-md transition-all duration-300 hover:border-accent-primary/30 hover:bg-bg-secondary/45 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
                  {/* Glowing radial inside card */}
                  <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-radial from-accent-primary/18 to-transparent blur-[40px] pointer-events-none group-hover/card:scale-110 transition-transform duration-500" />

                  {/* Flashy corner wireframe element */}
                  {/* <WireframeSVG type={curAccent.wireframe} accentColor={curAccent.color} /> */}

                  <div>
                    {/* Header line inside card */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest border bg-bg-primary/50 border-border-subtle/80 text-text-secondary">
                        {curAccent.tag}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-bg-primary border border-border-subtle/80 flex items-center justify-center group-hover/card:border-accent-primary/40 transition-colors shadow-sm">
                        {curAccent.icon}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-extrabold tracking-tight text-text-primary uppercase group-hover/card:text-accent-primary transition-colors leading-snug mb-3">
                      {block.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-text-secondary font-light leading-relaxed mb-6 max-w-[85%]">
                      {block.description}
                    </p>
                  </div>

                  {/* Card Bottom Meta and Buttons */}
                  <div className="flex items-center justify-between mt-auto border-t border-border-subtle/30 pt-4 relative z-10">
                    <span className="text-[9px] font-mono text-text-muted uppercase">
                      {curAccent.code}
                    </span>

                    <button
                      onClick={() => navigate('events')}
                      className="group/btn inline-flex items-center gap-1 text-xs font-bold text-accent-primary hover:text-accent-primary/80 cursor-pointer"
                    >
                      {block.ctaLabel}
                      <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
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
