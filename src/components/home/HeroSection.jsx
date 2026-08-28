import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import couverture from '../../assets/hero.webp'

/**
 * Hero — couverture pleine section.
 *
 * L'illustration de droite (une fiche d'échantillon inventée de toutes pièces :
 * « Rover SLAM autonome, phase 3/5 ») a laissé place à une photographie de la
 * plateforme. Elle occupe toute la section ; le texte se pose dessus, à gauche.
 *
 * Les trois chiffres qui vivaient ici en dur — 5000+ membres, 120+ projets,
 * 30+ partenaires — ont disparu : ils sont un sous-ensemble exact de la section
 * Statistiques rendue juste en dessous, qui les lit dans `landing.json`. Le
 * visiteur les voyait donc deux fois à trois secondes d'intervalle.
 *
 * Le contraste du texte est porté par `.hero-cover` (src/index.css), qui
 * redéfinit localement les tokens d'encre : la photo est sombre dans les deux
 * thèmes, le libellé reste clair dans les deux.
 */
export default function HeroSection({ hero, navigate }) {
  const shouldReduceMotion = useReducedMotion()

  const fadeUp = (delay) => ({
    initial: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] },
  })

  return (
    <section
      id="hero"
      className="hero-cover relative flex min-h-[92vh] items-center overflow-hidden border-b border-border-subtle"
    >
      {/* La couverture. `alt` vide : la photographie illustre le propos, elle
          ne le porte pas — le titre juste à côté le dit déjà. */}
      <img
        src={couverture}
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="hero-cover__voile absolute inset-0" aria-hidden="true" />

      <div className="relative z-10 mx-auto w-full max-w-[92rem] px-6 pt-28 pb-20 md:px-12">
        <div className="flex max-w-2xl flex-col items-start text-left">
          <motion.div {...fadeUp(0.05)}>
            <span className="eyebrow flex items-center gap-3">
              <span className="inline-block h-px w-8 bg-ember" aria-hidden="true" />
              {hero.eyebrow}
            </span>
          </motion.div>

          <motion.h1
            {...fadeUp(0.12)}
            className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-text-primary sm:text-5xl lg:text-6xl"
          >
            {hero.title}
          </motion.h1>

          <motion.p
            {...fadeUp(0.2)}
            className="mt-6 text-base leading-relaxed text-text-secondary md:text-lg"
          >
            {hero.description}
          </motion.p>

          <motion.div
            {...fadeUp(0.28)}
            className="mt-10 flex flex-col items-stretch gap-3.5 sm:flex-row sm:items-center"
          >
            <button
              onClick={() => navigate('auth')}
              className="chamfer-sm inline-flex h-12 cursor-pointer items-center justify-center gap-2.5 bg-engine px-7 text-sm font-bold text-on-accent transition-colors hover:bg-engine-deep"
            >
              {hero.ctaPrimary}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              onClick={() => navigate('projects')}
              className="chamfer-sm inline-flex h-12 cursor-pointer items-center justify-center gap-2.5 border border-border-strong px-7 text-sm text-text-secondary transition-colors hover:border-engine hover:text-text-primary"
            >
              {hero.ctaSecondary}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </motion.div>

          <motion.div {...fadeUp(0.36)} className="mt-12 flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-ember animate-pulse-live" aria-hidden="true" />
            <span className="eyebrow">{hero.badge}</span>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
