import FadeInWhenVisible from './FadeInWhenVisible.jsx';

/**
 * « Nous découvrir » — ce qu'est la FIERI, dit par elle.
 *
 * Le bloc existait dans `landing.json` depuis le début et n'était rendu nulle
 * part : personne ne lisait ce texte. Il porte maintenant la présentation
 * officielle, et il est enfin affiché.
 *
 * Trois paragraphes, une colonne : c'est de la lecture, pas une grille de
 * cartes. Le premier porte l'ambition, les deux autres la mettent au sol.
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

        <div className="mt-8 text-base leading-relaxed text-text-secondary">
          <FadeInWhenVisible delay={0.08} direction="up">
            {decouvrir.paragraphes.map((paragraphe, index) => (
              <p key={index} className={`texte-justifie${index > 0 ? ' indent-8' : ''}`}>
                {paragraphe}
              </p>
            ))}
          </FadeInWhenVisible>
        </div>
      </div>
    </section>
  );
}
