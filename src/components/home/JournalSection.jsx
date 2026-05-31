import React from 'react';
import { Clock, ArrowRight, ChevronRight } from 'lucide-react';
import FadeInWhenVisible from './FadeInWhenVisible.jsx';

export default function JournalSection({ actualites, navigate }) {
  return (
    <section className="py-24 px-6 md:px-12 lg:px-24 border-b border-border-subtle bg-bg-secondary/20 relative">
      {/* Glow Spots */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] max-w-[600px] rounded-full bg-radial from-fieri-blue/26 to-transparent blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55vw] h-[55vw] max-w-[650px] rounded-full bg-radial from-accent-primary/24 to-transparent blur-[130px] pointer-events-none z-0" />
      
      <div className="max-w-[92rem] mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16">
          <FadeInWhenVisible direction="left">
            <span className="text-xs font-bold tracking-[0.2em] text-accent-primary uppercase">{actualites.tag}</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-3">
              {actualites.title}
            </h2>
          </FadeInWhenVisible>
          <button
            onClick={() => navigate('news')}
            className="mt-4 sm:mt-0 inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary hover:underline cursor-pointer"
          >
            Consulter tout le journal
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {actualites.items.map((item, index) => (
            <FadeInWhenVisible key={index} delay={index * 0.08} direction="up">
              <article className="glass-panel h-full rounded-xl border border-border-subtle overflow-hidden flex flex-col justify-between shadow-sm">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4 text-[10px] text-text-muted font-mono uppercase">
                    <Clock className="w-3 h-3 text-accent-secondary" />
                    {item.date}
                  </div>
                  <h3 className="text-base font-bold text-text-primary mb-3 line-clamp-2 hover:text-accent-primary transition-colors">
                    {item.titre}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-light line-clamp-3">
                    {item.extrait}
                  </p>
                </div>
                <div className="px-6 pb-6 pt-2">
                  <button
                    onClick={() => navigate('news')}
                    className="text-xs font-semibold text-accent-primary hover:text-accent-primary/80 inline-flex items-center gap-1 cursor-pointer"
                  >
                    Lire l'article
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            </FadeInWhenVisible>
          ))}
        </div>
      </div>
    </section>
  );
}
