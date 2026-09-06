import { useState } from 'react';
import {
  Globe2, Building2, Landmark, Factory, Banknote, FlaskConical, Handshake,
  ArrowRight, ChevronLeft, ChevronRight,
} from 'lucide-react';
import FadeInWhenVisible from './FadeInWhenVisible.jsx';
import PartnerModal from './PartnerModal.jsx';
import { useCarrousel, PISTE } from './useCarrousel.js';

/**
 * Chaque type de partenaire porte son icône. Le badge s'écrit toujours de la
 * même façon — un contour, un aplat teinté, le libellé : le système n'admet que
 * deux accents, et six couleurs de badge en auraient inventé quatre. C'est le
 * libellé et l'icône qui distinguent, pas la couleur.
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

/**
 * PartnersSection — la mise en vedette demandée.
 *
 * « Un peu comme le format du journal, on peut défiler et tout avec possibilité
 * d'en savoir plus sur le partenariat. » C'est donc un carrousel, exactement
 * celui du Journal — même mécanique, extraite dans `useCarrousel` plutôt que
 * recopiée une troisième fois — posé sur sa propre surface pour que la section
 * ne défile pas comme les autres.
 */
export default function PartnersSection({ partenaires }) {
  const [choisi, setChoisi] = useState(null);
  const { pisteRef, largeurCarte, defiler, liaisons, aBouge } = useCarrousel();

  /** Un relâchement après glissement n'est pas un clic sur la carte. */
  const ouvrir = (partner, Icon) => {
    if (aBouge()) return;
    setChoisi({ partner, Icon });
  };

  return (
    <section
      id="partenaires"
      className="relative border-y border-border-strong bg-bg-secondary px-6 py-24 md:px-12"
    >
      <div className="mx-auto w-full max-w-[92rem]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <FadeInWhenVisible direction="left" delay={0.05}>
            <span className="eyebrow flex items-center gap-3">
              <span className="inline-block h-px w-8 bg-ember" aria-hidden="true" />
              {partenaires.tag}
            </span>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-text-primary md:text-4xl">
              {partenaires.title}
            </h2>
            {partenaires.description && (
              <p className="texte-justifie mt-3 max-w-xl text-base font-light leading-relaxed text-text-secondary">
                {partenaires.description}
              </p>
            )}
          </FadeInWhenVisible>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => defiler(-1)}
              aria-label="Partenaires précédents"
              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center border border-border-strong text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => defiler(1)}
              aria-label="Partenaires suivants"
              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center border border-border-strong text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div ref={pisteRef} {...liaisons} className={PISTE}>
          {partenaires.logos.map((partner, index) => {
            const Icon = TYPE_ICONS[partner.type] || Globe2;
            // Une carte ne s'ouvre que si la fiche a quelque chose à dire.
            const ouvrable = Boolean(partner.description || partner.apport);
            return (
              <article
                key={index}
                style={{ width: largeurCarte }}
                className="chamfer-sm chamfer-shadow group flex shrink-0 snap-center select-none flex-col gap-5 border border-border-strong bg-bg-primary px-7 py-7 transition-colors hover:border-engine"
              >
                <div className="flex items-start gap-4">
                  <div className="chamfer-xs flex h-14 w-14 shrink-0 items-center justify-center border border-engine bg-engine-wash">
                    <Icon className="h-6 w-6 text-engine" aria-hidden="true" />
                  </div>
                  <span className="min-w-0 flex-1 font-display text-lg font-extrabold leading-snug text-text-primary transition-colors group-hover:text-engine">
                    {partner.name}
                  </span>
                </div>

                {/* Le badge : ce que ce partenaire apporte. L'icône est déjà
                    portée par la pastille ci-dessus, elle ne se répète pas. */}
                <span className="chamfer-xs inline-flex w-fit items-center border border-engine bg-engine-wash px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-engine">
                  {partner.type}
                </span>

                {partner.description && (
                  <p className="texte-justifie line-clamp-3 text-sm font-light leading-relaxed text-text-secondary">
                    {partner.description}
                  </p>
                )}

                {ouvrable && (
                  <button
                    type="button"
                    onClick={() => ouvrir(partner, Icon)}
                    className="mt-auto inline-flex min-h-11 w-fit cursor-pointer items-center gap-2 text-sm font-bold text-engine transition-colors hover:text-engine-deep"
                  >
                    En savoir plus
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">sur {partner.name}</span>
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </div>

      <PartnerModal
        partner={choisi?.partner ?? null}
        icon={choisi?.Icon}
        onClose={() => setChoisi(null)}
      />
    </section>
  );
}
