import { motion, useReducedMotion } from 'framer-motion'

/**
 * SectionCard — le bloc de contenu de l'espace connecté.
 *
 * Deux copies divergentes vivaient dans EspaceCITE et Gouvernance. Les écrans
 * issus du découpage en héritent tous d'une seule.
 *
 * Sur le mouvement : l'élévation au survol a disparu. Un panneau de lecture
 * n'est pas un bouton — le faire bouger sous le curseur suggérait une
 * interaction qui n'existe pas.
 */
export default function SectionCard({
  icon: Icon,
  title,
  subtitle,
  accent = 'var(--color-engine)',
  actions,
  children,
  className = '',
}) {
  const reduced = useReducedMotion()

  return (
    <motion.section
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col border border-border-strong bg-bg-secondary ${className}`}
    >
      <header className="flex items-start justify-between gap-4 border-b border-border-subtle px-5 py-4">
        <div className="flex min-w-0 items-start gap-3">
          {Icon && (
            <span
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border"
              style={{ borderColor: accent, color: accent }}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
          )}
          <div className="min-w-0">
            <h2 className="font-display text-base font-bold leading-snug text-text-primary">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-text-secondary">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </header>
      <div className="flex-1 px-5 py-4">{children}</div>
    </motion.section>
  )
}
