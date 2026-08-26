import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import SpecimenCard from './SpecimenCard.jsx'

const HERO_STATS = [
  { value: '5000+', label: 'membres actifs' },
  { value: '120+', label: 'projets réalisés' },
  { value: '30+', label: 'partenaires industriels' },
]

/**
 * Hero — identité « La Preuve ».
 * Éditorial à gauche (titre Exo, annotation mono, CTA chanfreinés),
 * signature SpecimenCard à droite. Pas d'image photo, pas de circuit néon.
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
      className="relative min-h-[92vh] flex items-center pt-28 pb-20 px-6 md:px-12 lg:px-12 border-b border-border-subtle overflow-hidden"
    >
      {/* Texture de fond discrète */}
      <div className="absolute inset-0 blueprint-grid opacity-60 pointer-events-none" />
      <div className="max-w-[92rem] mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-10 items-center">
        {/* ── Colonne éditoriale ── */}
        <div className="flex flex-col items-start text-left max-w-xl">
          <motion.div {...fadeUp(0.05)}>
            <span className="eyebrow flex items-center gap-3">
              <span className="w-8 h-px bg-ember inline-block" aria-hidden="true" />
              {hero.eyebrow}
            </span>
          </motion.div>

          <motion.h1
            {...fadeUp(0.12)}
            className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-text-primary leading-[1.05] font-display"
          >
            {hero.title}
          </motion.h1>

          <motion.p
            {...fadeUp(0.2)}
            className="mt-6 text-base md:text-lg text-text-secondary leading-relaxed"
          >
            {hero.description}
          </motion.p>

          {/* CTA */}
          <motion.div {...fadeUp(0.28)} className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
            <button
              onClick={() => navigate('auth')}
              className="inline-flex items-center justify-center gap-2.5 h-12 px-7 chamfer-sm bg-engine text-on-accent text-sm font-bold transition-colors hover:bg-engine-deep cursor-pointer"
            >
              {hero.ctaPrimary}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              onClick={() => navigate('projects')}
              className="inline-flex items-center justify-center gap-2.5 h-12 px-7 chamfer-sm border border-border-strong text-text-secondary hover:text-text-primary hover:border-engine/60 transition-colors cursor-pointer"
            >
              {hero.ctaSecondary}
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </motion.div>

          {/* Preuve rapide */}
          <motion.div {...fadeUp(0.36)} className="mt-14 flex items-center gap-8">
            {HERO_STATS.map((stat, i) => (
              <div key={stat.label} className="flex flex-col gap-0.5">
                <span className="text-2xl font-bold text-text-primary font-mono tracking-tight">
                  {stat.value}
                </span>
                <span className="text-sm text-text-muted">
                  {stat.label}
                </span>
                {i < HERO_STATS.length - 1 && <span className="hidden" aria-hidden="true" />}
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Signature : étiquette d'échantillon ── */}
        <div className="relative flex justify-center lg:justify-end">
          <SpecimenCard />
        </div>
      </div>

      {/* Badge "lab-to-market" en bas à droite */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.6 }}
        className="hidden lg:flex absolute bottom-8 right-12 items-center gap-2.5"
        aria-hidden="true"
      >
        <span className="w-2 h-2 rounded-full bg-ember animate-pulse-live" />
        <span className="eyebrow">{hero.badge}</span>
      </motion.div>
    </section>
  )
}