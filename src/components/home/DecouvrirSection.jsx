import FadeInWhenVisible from './FadeInWhenVisible.jsx';

/**
 * « Nous découvrir » — ce qu'est la FIERI, dit par elle.
 *
 * Le bloc existait dans `landing.json` depuis le début et n'était rendu nulle
 * part : personne ne lisait ce texte. Il porte maintenant la présentation
 * officielle, et il est enfin affiché.
 *
 * ── Un seul bloc, dans un cadre ───────────────────────────────────────────
 * Le client : « vous n'avez pas besoin d'aller à la ligne avant de continuer,
 * tout en un bloc ». Les trois paragraphes de `landing.json` restent trois
 * entrées — c'est la forme du contenu, et elle sert à l'édition — mais ils se
 * lisent d'un trait, séparés par une espace et non par un alinéa.
 *
 * Le cadre est celui des autres sections de l'accueil : bordure franche,
 * surface secondaire, coins chanfreinés. Le texte cesse de flotter sur le fond.
 */
export default function DecouvrirSection({ decouvrir }) {
  if (!decouvrir?.paragraphes?.length) return null;

  return (
    <section
      id="decouvrir"
      className="relative border-b border-border-subtle bg-bg-primary px-6 py-24 md:px-12"
    >
      <div className="mx-auto w-full max-w-3xl">
        <FadeInWhenVisible direction="down" delay={0.05}>
          <span className="eyebrow flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-ember" aria-hidden="true" />
            {decouvrir.tag}
          </span>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-text-primary md:text-4xl">
            {decouvrir.title}
          </h2>
        </FadeInWhenVisible>

        <FadeInWhenVisible delay={0.08} direction="up">
          <div className="chamfer-sm chamfer-shadow mt-8 border border-border-strong bg-bg-secondary p-7 md:p-9">
            <p className="texte-justifie text-base leading-relaxed text-text-secondary">
              {decouvrir.paragraphes.join(' ')}
            </p>
          </div>
        </FadeInWhenVisible>
      </div>
    </section>
  );
}
