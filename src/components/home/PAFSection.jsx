import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import FadeInWhenVisible from './FadeInWhenVisible.jsx';

export default function PAFSection({ paf, navigate }) {
  return (
    <section className="py-24 px-6 md:px-12 lg:px-24 border-b border-border-subtle relative">
      <div className="max-w-[92rem] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left intro text */}
          <div className="lg:col-span-5">
            <FadeInWhenVisible direction="left">
              <span className="text-xs font-bold tracking-[0.2em] text-accent-primary uppercase">{paf.tag}</span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-3 mb-6">
                {paf.title}
              </h2>
              <p className="text-text-secondary text-base font-light leading-relaxed mb-8">
                {paf.description}
              </p>
              <button
                onClick={() => navigate('workshops')}
                className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent-primary text-text-primary text-xs font-bold hover:bg-accent-primary/95 transition-all shadow-md cursor-pointer"
              >
                Découvrir les ateliers du PAF
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </FadeInWhenVisible>
          </div>

          {/* Right features checklist */}
          <div className="lg:col-span-7 space-y-6">
            {paf.features.map((feature, index) => (
              <FadeInWhenVisible key={index} delay={index * 0.1} direction="right">
                <div className="bg-bg-secondary/40 backdrop-blur-md p-6 rounded-xl border border-border-subtle hover:border-accent-primary/20 transition-all flex items-start gap-4 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-text-primary mb-1">{feature.title}</h3>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-light">{feature.desc}</p>
                  </div>
                </div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
