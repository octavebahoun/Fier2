import { Activity, Cpu, Globe2, Award } from 'lucide-react';
import FadeInWhenVisible from './FadeInWhenVisible.jsx';

export default function MissionsSection({ mission }) {
  // 2 accents max : ember en premier (chaleur), engine ensuite.
  const getPillarConfig = (index) => {
    switch (index) {
      case 0:
        return { icon: <Activity className="w-5.5 h-5.5 text-ember" />, chip: 'bg-ember-wash border-ember/25' };
      case 1:
        return { icon: <Cpu className="w-5.5 h-5.5 text-engine" />, chip: 'bg-engine-wash border-engine/25' };
      case 2:
        return { icon: <Globe2 className="w-5.5 h-5.5 text-engine-deep" />, chip: 'bg-engine-deep/12 border-engine-deep/25' };
      case 3:
      default:
        return { icon: <Award className="w-5.5 h-5.5 text-ember-soft" />, chip: 'bg-ember-soft/12 border-ember-soft/25' };
    }
  };

  return (
    <section id="missions" className="py-24 px-6 md:px-12 lg:px-12 border-b border-border-subtle bg-bg-primary relative">
      <div className="max-w-[92rem] mx-auto w-full">
        {/* Header Block */}
        <div className="max-w-3xl mx-auto mb-16 text-left sm:text-center">
          <FadeInWhenVisible direction="down" delay={0.05}>
            <span className="eyebrow flex items-center gap-3 sm:justify-center">
              <span className="w-8 h-px bg-ember inline-block" aria-hidden="true" />
              {mission.tag}
              <span className="w-8 h-px bg-ember inline-block" aria-hidden="true" />
            </span>
          </FadeInWhenVisible>

          <FadeInWhenVisible direction="up" delay={0.1}>
            <h2 className="mt-5 text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary leading-tight font-display">
              {mission.title}
            </h2>
          </FadeInWhenVisible>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mission.pillars.map((pillar, index) => {
            const config = getPillarConfig(index);
            return (
              <FadeInWhenVisible key={index} delay={index * 0.08} direction="up">
                <div className="glass-panel h-full p-7 rounded-2xl border border-border-subtle hover:border-border-strong transition-all duration-300 flex flex-col justify-start">
                  {/* Icon Block (chanfreiné) */}
                  <div className={`w-12 h-12 rounded-sm chamfer-sm border flex items-center justify-center mb-6 ${config.chip}`}>
                    {config.icon}
                  </div>

                  <h3 className="text-lg font-extrabold text-text-primary font-display tracking-tight">
                    {pillar.title}
                  </h3>

                  <p className="mt-3 text-sm text-text-secondary leading-relaxed font-light">
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