import FadeInWhenVisible from './FadeInWhenVisible.jsx';

/**
 * Notre vision — une phrase et un paragraphe.
 *
 * La colonne de droite portait trois blocs — Souveraineté, Impact local,
 * Lab-to-Market — que le client a demandé de retirer. Avec eux partent la
 * signature « FIERI Scientific Board · Research Leadership Initiative », qui
 * attribuait le propos à une instance dont rien n'atteste l'existence.
 *
 * Reste une seule colonne : ce n'est pas un tableau de bord, c'est une
 * déclaration. Elle se lit d'un trait.
 */
export default function VisionSection({ vision }) {
  return (
    <section
      id="vision"
      className="relative border-b border-border-subtle bg-bg-primary px-6 py-24 md:px-12"
    >
      <div className="mx-auto w-full max-w-3xl">
        <FadeInWhenVisible direction="left" delay={0.05}>
          <span className="eyebrow flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-ember" aria-hidden="true" />
            {vision.tag}
          </span>
        </FadeInWhenVisible>

        <FadeInWhenVisible direction="up" delay={0.1}>
          <h2 className="mt-5 font-display text-3xl font-extrabold leading-tight tracking-tight text-text-primary sm:text-4xl md:text-5xl">
            {vision.title}
          </h2>
        </FadeInWhenVisible>

        <FadeInWhenVisible direction="up" delay={0.15}>
          <p className="texte-justifie mt-8 text-base leading-relaxed text-text-secondary sm:text-lg">
            {vision.text}
          </p>
        </FadeInWhenVisible>
      </div>
    </section>
  );
}
