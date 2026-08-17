import { Globe2, Building2, Landmark, Factory, Banknote, FlaskConical } from 'lucide-react';
import FadeInWhenVisible from './FadeInWhenVisible.jsx';

const TYPE_ICONS = {
  'Université partenaire': Building2,
  'Partenaire technologique': FlaskConical,
  'Partenaire industriel': Factory,
  'Soutien institutionnel': Landmark,
  'Soutien financier': Banknote,
  'Partenaire d\'expérimentation': Globe2
};

export default function PartnersSection({ partenaires }) {
  return (
    <section id="partenaires" className="py-24 px-6 md:px-12 lg:px-12 border-b border-border-subtle bg-bg-primary relative">
      <div className="max-w-[92rem] mx-auto w-full">
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <FadeInWhenVisible direction="down" delay={0.05}>
            <span className="eyebrow flex items-center gap-3 justify-center">
              <span className="w-8 h-px bg-ember inline-block" aria-hidden="true" />
              {partenaires.tag}
              <span className="w-8 h-px bg-ember inline-block" aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-2xl md:text-3xl font-extrabold tracking-tight text-text-primary font-display">
              {partenaires.title}
            </h2>
            <p className="text-text-secondary text-sm font-light mt-3 max-w-xl mx-auto">
              Ils soutiennent et accélèrent l'excellence scientifique et technologique du FIERI.
            </p>
          </FadeInWhenVisible>
        </div>

        {/* Grille statique des partenaires commerciaux (aucun défilement automatique) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {partenaires.logos.map((partner, index) => {
            const Icon = TYPE_ICONS[partner.type] || Globe2;
            return (
              <FadeInWhenVisible key={index} delay={index * 0.06} direction="up">
                <div className="glass-panel h-full px-7 py-6 rounded-2xl border border-border-subtle hover:border-border-strong transition-all duration-300 flex items-center gap-4 select-none cursor-default group">
                  <div className="w-11 h-11 rounded-sm chamfer-sm flex items-center justify-center bg-bg-tertiary border border-border-subtle shrink-0 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5 text-engine" />
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-sm font-black text-text-primary group-hover:text-engine transition-colors truncate">
                      {partner.name}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                      {partner.type}
                    </span>
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
