import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, ArrowUpRight } from 'lucide-react'

/**
 * Hero — le message d'accueil, sans image.
 *
 * Trois choses ont disparu, dans cet ordre :
 *   • la fiche d'échantillon inventée (« Rover SLAM autonome, phase 3/5 ») ;
 *   • la photographie qui l'avait remplacée — « j'ai remarqué c'était plus
 *     simple et joli sans image » ; elle reviendra quand la vraie photo
 *     existera ;
 *   • le fil « FIERI — RECHERCHE APPLIQUÉE · LAB → MARKET », qui annonçait le
 *     titre sans rien lui ajouter.
 *
 * Reste le texte, deux boutons, et de l'air. La grille de fond revient : sans
 * image, la section a besoin de sa texture.
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
      className="relative flex min-h-[78vh] items-center overflow-hidden border-b border-border-subtle px-6 pt-28 pb-20 md:px-12"
    >
      <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />

      <div className="relative z-10 mx-auto w-full max-w-[92rem]">
        <div className="flex max-w-3xl flex-col items-start text-left">
          <motion.h1
            {...fadeUp(0.05)}
            className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-text-primary sm:text-5xl lg:text-6xl"
          >
            {hero.title}
          </motion.h1>

          <motion.p
            {...fadeUp(0.14)}
            className="mt-6 max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg"
          >
            {hero.description}
          </motion.p>

          <motion.div
            {...fadeUp(0.22)}
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
        </div>
      </div>
    </section>
  )
}
