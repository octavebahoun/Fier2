import { Compass, GraduationCap, LayoutDashboard, ArrowRight } from 'lucide-react';
import FadeInWhenVisible from './FadeInWhenVisible.jsx';

export default function OrgSection({ organisation, navigate }) {
  // Icônes et accents par entité — 2 accents max (engine/ember)
  const getEntityConfig = (index) => {
    switch (index) {
      case 0:
        return {
          icon: <Compass className="w-5.5 h-5.5 text-ember" />,
          badge: 'text-ember border-ember/30 bg-ember-wash',
          cta: 'bg-ember-wash border-ember/30 text-ember hover:bg-ember-wash',
          chip: 'text-ember bg-ember-wash border-ember/25',
        };
      case 1:
        return {
          icon: <GraduationCap className="w-5.5 h-5.5 text-engine" />,
          badge: 'text-engine border-engine/30 bg-engine-wash',
          cta: 'bg-engine-wash border-engine/30 text-engine hover:bg-engine-wash',
          chip: 'text-engine bg-engine-wash border-engine/25',
        };
      case 2:
      default:
        return {
          icon: <LayoutDashboard className="w-5.5 h-5.5 text-engine-deep" />,
          badge: 'text-engine-deep border-engine-deep/30 bg-engine-deep/8',
          cta: 'bg-engine-deep/10 border-engine-deep/30 text-engine-deep hover:bg-engine-deep/20',
          chip: 'text-engine-deep bg-engine-deep/12 border-engine-deep/25',
        };
    }
  };

  const routes = ['cite', 'workshops', 'projects'];

  return (
    <section id="organisation" className="py-24 px-6 md:px-12 lg:px-12 border-b border-border-subtle relative bg-bg-primary">
      <div className="max-w-[92rem] mx-auto w-full">
        {/* Header Block */}
        <div className="max-w-3xl mx-auto mb-16 text-left sm:text-center">
          <FadeInWhenVisible direction="down" delay={0.05}>
            <span className="eyebrow flex items-center gap-3 sm:justify-center">
              <span className="w-8 h-px bg-ember inline-block" aria-hidden="true" />
              {organisation.tag}
              <span className="w-8 h-px bg-ember inline-block" aria-hidden="true" />
            </span>
          </FadeInWhenVisible>

          <FadeInWhenVisible direction="up" delay={0.1}>
            <h2 className="mt-5 text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary leading-tight font-display">
              {organisation.title}
            </h2>
          </FadeInWhenVisible>

          <FadeInWhenVisible direction="up" delay={0.15}>
            <p className="mt-4 text-text-secondary text-base font-light leading-relaxed">
              {organisation.subtitle}
            </p>
          </FadeInWhenVisible>
        </div>

        {/* 3 entités */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {organisation.entities.map((entity, index) => {
            const config = getEntityConfig(index);
            return (
              <FadeInWhenVisible key={entity.id} delay={index * 0.1} direction="up">
                <div
                  onClick={() => navigate(routes[index])}
                  className="glass-panel h-full p-8 rounded-2xl relative overflow-hidden group transition-all duration-300 border border-border-subtle hover:border-border-strong hover:-translate-y-1 cursor-pointer"
                >
                  {/* Référence d'entité (mono) + icône */}
                  <div className="flex items-center justify-between mb-8">
                    <span className={`eyebrow px-3 py-1.5 rounded border uppercase ${config.badge}`}>
                      {entity.id}
                    </span>
                    <div className={`p-2.5 rounded-sm chamfer-sm border transition-transform duration-300 group-hover:scale-110 ${config.chip}`}>
                      {config.icon}
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-text-primary font-display tracking-tight">
                    {entity.name}
                  </h3>

                  <p className="mt-4 text-sm text-text-secondary leading-relaxed">
                    {entity.desc}
                  </p>

                  {/* CTA */}
                  <div className={`mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-sm chamfer-sm border text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${config.cta}`}>
                    <span>Explorer</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
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