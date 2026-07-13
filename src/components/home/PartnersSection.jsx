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
    <section id="partenaires" className="py-24 px-6 md:px-12 lg:px-12 border-b border-border-subtle bg-bg-secondary/5 relative overflow-hidden">
      {/* Glow ambient background spot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[25vw] rounded-full bg-radial from-accent-primary/8 to-transparent blur-[120px] pointer-events-none z-0" />

      <div className="max-w-[92rem] mx-auto w-full relative z-10">
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <FadeInWhenVisible direction="down" delay={0.05}>
            <div className="inline-flex items-center gap-2 bg-accent-primary/10 border border-accent-primary/30 px-3.5 py-1 rounded-full mb-3.5">
              <Globe2 className="w-3.5 h-3.5 text-accent-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-text-primary">
                {partenaires.tag}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-text-primary">
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
                <div className="glass-panel h-full px-7 py-6 rounded-2xl border border-border-subtle/70 bg-bg-secondary/20 hover:bg-bg-secondary/40 hover:border-accent-primary/30 transition-all duration-350 shadow-sm flex items-center gap-4 select-none cursor-default group">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-accent-primary/10 border border-accent-primary/20 shrink-0 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5 text-accent-primary" />
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-sm font-black text-text-primary group-hover:text-accent-primary transition-colors truncate">
                      {partner.name}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted">
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
