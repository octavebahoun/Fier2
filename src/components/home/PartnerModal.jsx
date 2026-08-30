import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

/**
 * La fiche d'un partenaire.
 *
 * La grille ne disait que deux choses — un nom, un type. « On doit avoir la
 * possibilité d'en savoir plus sur le partenaire » : la fiche répond aux deux
 * questions qui restaient, ce qu'il EST et ce qu'il APPORTE.
 *
 * Elle ne s'ouvre que sur un partenaire dont le contenu existe : une fiche vide
 * vaut moins qu'une carte qui ne s'ouvre pas.
 *
 * Le voile est `bg-scrim`, la seule translucidité assumée du système — on doit
 * voir que la page est toujours là, derrière.
 */
export default function PartnerModal({ partner, icon: Icon, onClose }) {
  const panneau = useRef(null)
  const fermeture = useRef(null)

  // Échap ferme, et le corps ne défile plus derrière.
  useEffect(() => {
    if (!partner) return
    const auClavier = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', auClavier)
    const defilement = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', auClavier)
      document.body.style.overflow = defilement
    }
  }, [partner, onClose])

  // Le focus entre dans la fiche : sans cela, la tabulation continue derrière
  // le voile, sur des cartes que l'on ne voit plus.
  useEffect(() => {
    if (partner) fermeture.current?.focus()
  }, [partner])

  return (
    <AnimatePresence>
      {partner && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-scrim p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
        >
          <motion.div
            ref={panneau}
            role="dialog"
            aria-modal="true"
            aria-labelledby="fiche-partenaire-nom"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="chamfer chamfer-shadow relative w-full max-w-lg border border-border-strong bg-bg-secondary p-7"
          >
            <button
              ref={fermeture}
              type="button"
              onClick={onClose}
              aria-label="Fermer la fiche du partenaire"
              className="absolute right-4 top-4 inline-flex h-11 w-11 cursor-pointer items-center justify-center border border-border-strong text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="flex items-start gap-4 pr-14">
              <div className="chamfer-xs flex h-14 w-14 shrink-0 items-center justify-center border border-engine bg-engine-wash">
                {Icon && <Icon className="h-6 w-6 text-engine" aria-hidden="true" />}
              </div>
              <div className="min-w-0 flex-1">
                <h2
                  id="fiche-partenaire-nom"
                  className="font-display text-xl font-extrabold leading-snug tracking-tight text-text-primary"
                >
                  {partner.name}
                </h2>
                <span className="chamfer-xs mt-2 inline-flex w-fit items-center border border-engine bg-engine-wash px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-engine">
                  {partner.type}
                </span>
              </div>
            </div>

            <hr className="my-6 border-border-subtle" />

            <div className="flex flex-col gap-5">
              {partner.description && (
                <section>
                  <h3 className="eyebrow mb-2">Qui c’est</h3>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    {partner.description}
                  </p>
                </section>
              )}
              {partner.apport && (
                <section>
                  <h3 className="eyebrow mb-2">Ce qu’il apporte à la FIERI</h3>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    {partner.apport}
                  </p>
                </section>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
