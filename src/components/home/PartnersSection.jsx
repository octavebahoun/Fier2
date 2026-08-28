import {
  Globe2, Building2, Landmark, Factory, Banknote, FlaskConical, Handshake,
} from 'lucide-react';
import FadeInWhenVisible from './FadeInWhenVisible.jsx';

/**
 * Chaque type de partenaire porte son icône. Le badge s'écrit toujours de la
 * même façon — un contour, un aplat teinté, l'icône du type : le système
 * n'admet que deux accents, et six couleurs de badge en auraient inventé
 * quatre. C'est le libellé et l'icône qui distinguent, pas la couleur.
 *
 * La table est le vocabulaire disponible : un partenaire dont le type n'y
 * figure pas garde l'icône générique plutôt que de disparaître.
 */
const TYPE_ICONS = {
  'Université partenaire': Building2,
  'Partenaire technologique': FlaskConical,
  'Partenaire industriel': Factory,
  'Partenaire commercial': Handshake,
  'Soutien institutionnel': Landmark,
  'Soutien financier': Banknote,
  "Partenaire d'expérimentation": Globe2,
};

export default function PartnersSection({ partenaires }) {
  return (
    <section
      id="partenaires"
      className="relative border-b border-border-subtle bg-bg-primary px-6 py-24 md:px-12"
    >
      <div className="mx-auto w-full max-w-[92rem]">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <FadeInWhenVisible direction="down" delay={0.05}>
            <span className="eyebrow flex items-center justify-center gap-3">
              <span className="inline-block h-px w-8 bg-ember" aria-hidden="true" />
              {partenaires.tag}
              <span className="inline-block h-px w-8 bg-ember" aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-text-primary md:text-3xl">
              {partenaires.title}
            </h2>
            {partenaires.description && (
              <p className="mx-auto mt-3 max-w-xl text-sm font-light text-text-secondary">
                {partenaires.description}
              </p>
            )}
          </FadeInWhenVisible>
        </div>

        {/* Grille statique (aucun défilement automatique). */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {partenaires.logos.map((partner, index) => {
            const Icon = TYPE_ICONS[partner.type] || Globe2;
            return (
              <FadeInWhenVisible key={index} delay={index * 0.06} direction="up">
                <article className="chamfer-sm chamfer-shadow group flex h-full select-none flex-col gap-4 border border-border-strong bg-bg-secondary px-7 py-6 transition-colors hover:border-engine">
                  <div className="flex items-start gap-4">
                    <div className="chamfer-xs flex h-11 w-11 shrink-0 items-center justify-center border border-engine bg-engine-wash">
                      <Icon className="h-5 w-5 text-engine" aria-hidden="true" />
                    </div>
                    <span className="min-w-0 flex-1 text-base font-extrabold leading-snug text-text-primary transition-colors group-hover:text-engine">
                      {partner.name}
                    </span>
                  </div>

                  {/* Le badge : ce que ce partenaire apporte. L'icône est déjà
                      portée par la pastille ci-dessus, elle ne se répète pas. */}
                  <span className="chamfer-xs mt-auto inline-flex w-fit items-center border border-engine bg-engine-wash px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-engine">
                    {partner.type}
                  </span>
                </article>
              </FadeInWhenVisible>
            );
          })}
        </div>
      </div>
    </section>
  );
}
