import { Target, Cpu, Lightbulb, GraduationCap } from 'lucide-react';
import FadeInWhenVisible from './FadeInWhenVisible.jsx';

export default function VisionSection({ vision }) {
  const getHighlightIcon = (index) => {
    switch (index) {
      case 0:
        return <Cpu className="w-5 h-5 text-engine" />;
      case 1:
        return <Target className="w-5 h-5 text-ember" />;
      case 2:
      default:
        return <Lightbulb className="w-5 h-5 text-engine-deep" />;
    }
  };

  return (
    <section id="vision" className="py-24 px-6 md:px-12 lg:px-12 border-b border-border-subtle bg-bg-primary relative">
      <div className="max-w-[92rem] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

        {/* Colonne gauche : le pitch */}
        <div className="lg:col-span-6 flex flex-col items-start text-left">
          <FadeInWhenVisible direction="left" delay={0.05}>
            <span className="eyebrow flex items-center gap-3">
              <span className="w-8 h-px bg-ember inline-block" aria-hidden="true" />
              {vision.tag}
            </span>
          </FadeInWhenVisible>

          <FadeInWhenVisible direction="up" delay={0.1}>
            <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary leading-tight font-display">
              {vision.title}
            </h2>
          </FadeInWhenVisible>

          <FadeInWhenVisible direction="up" delay={0.15}>
            <blockquote className="relative mt-8 glass-panel p-8 rounded-2xl border border-border-subtle">
              <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
                « {vision.text} »
              </p>

              <footer className="mt-7 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-sm chamfer-sm border border-border-subtle bg-bg-tertiary flex items-center justify-center text-engine">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold uppercase tracking-widest text-text-primary">FIERI Scientific Board</div>
                  <div className="eyebrow mt-0.5">Research Leadership Initiative</div>
                </div>
              </footer>
            </blockquote>
          </FadeInWhenVisible>
        </div>

        {/* Colonne droite : les 3 facettes */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {vision.highlights.map((highlight, index) => (
            <FadeInWhenVisible key={index} delay={index * 0.12} direction="right">
              <div className="flex gap-5 p-6 rounded-2xl border border-border-subtle bg-bg-secondary hover:border-border-strong transition-all duration-300 group">
                <div className="shrink-0 w-11 h-11 rounded-sm chamfer-sm bg-bg-tertiary border border-border-subtle flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  {getHighlightIcon(index)}
                </div>
                <div className="flex flex-col text-left justify-center">
                  <h3 className="text-base font-extrabold text-text-primary font-display tracking-tight">
                    {highlight.title}
                  </h3>
                  <p className="mt-1 text-sm text-text-secondary leading-relaxed font-light">
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