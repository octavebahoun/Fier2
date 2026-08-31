import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Star } from 'lucide-react'

/**
 * La demande d'adhésion à un club — avec ce qu'il faut pour y répondre.
 *
 * Jusqu'ici, demander à rejoindre un club envoyait `clubId` et rien d'autre :
 * la table ne portait que l'identifiant du membre et un statut. Le responsable
 * qui devait accepter ou refuser voyait donc un nom, seul. Le client l'a dit
 * ainsi : « le nom seul ne permet vraiment pas, son contact… ».
 *
 * Deux champs, pas dix. Une motivation — pourquoi ce club — et un moyen de
 * joindre la personne. Le reste (parcours, filière) est déjà dans son compte ;
 * le redemander ici ferait un formulaire que personne ne remplit.
 *
 * Le moyen de contact est explicite plutôt que déduit de l'adresse du compte :
 * la plupart des échanges se font sur WhatsApp, et l'adresse d'inscription
 * n'est pas toujours celle qu'on relève.
 */
export default function DemandeAdhesionModal({
  club,
  icon: Icon = Star,
  onSubmit,
  onCancel,
  envoi = false,
}) {
  const [motivation, setMotivation] = useState('')
  const [contact, setContact] = useState('')
  const [error, setError] = useState(null)

  if (!club) return null

  const nom = club.kicker || club.name || 'ce club'

  const envoyer = (e) => {
    e.preventDefault()
    if (envoi) return
    if (motivation.trim().length < 10) {
      setError('Dites en quelques mots ce qui vous amène : le responsable décide avec ça.')
      return
    }
    if (!contact.trim()) {
      setError('Indiquez un moyen de vous joindre.')
      return
    }
    setError(null)
    onSubmit({ motivation: motivation.trim(), contact: contact.trim() })
  }

  const champ =
    'min-h-11 w-full border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:border-engine focus-visible:outline-none'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-scrim p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Demander à rejoindre ${nom}`}
        className="chamfer chamfer-shadow relative max-h-[90vh] w-full max-w-md overflow-y-auto border border-border-strong bg-bg-secondary p-8"
      >
        <div className="mb-6 flex items-center gap-4">
          <div className="chamfer-sm flex h-14 w-14 shrink-0 items-center justify-center border border-engine bg-engine-wash">
            <Icon className="h-7 w-7 text-engine" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-engine">Rejoindre</p>
            <h2 className="text-lg font-extrabold leading-snug text-text-primary">{nom}</h2>
          </div>
        </div>

        <form onSubmit={envoyer} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-secondary" htmlFor="adh-motivation">
              Pourquoi ce club ?
            </label>
            <textarea
              id="adh-motivation"
              rows={4}
              required
              value={motivation}
              onChange={(e) => { setMotivation(e.target.value); if (error) setError(null) }}
              placeholder="Ce qui vous intéresse, ce que vous savez déjà faire, ce que vous cherchez à apprendre."
              className={`${champ} min-h-28 py-2 leading-relaxed`}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-secondary" htmlFor="adh-contact">
              Comment vous joindre ?
            </label>
            <input
              id="adh-contact"
              type="text"
              required
              value={contact}
              onChange={(e) => { setContact(e.target.value); if (error) setError(null) }}
              placeholder="Ex : +229 01 23 45 67 (WhatsApp)"
              className={champ}
            />
            <p className="mt-1 text-sm text-text-muted">
              Numéro, WhatsApp ou adresse — ce que vous relevez le plus.
            </p>
          </div>

          <div className="border border-border-strong bg-bg-tertiary p-4 text-sm leading-relaxed text-text-secondary">
            <p className="mb-1.5 font-bold text-text-primary">En demandant votre adhésion, vous vous engagez à :</p>
            <ul className="list-disc space-y-1 pl-4">
              <li>Participer activement aux activités et réunions du club.</li>
              <li>Respecter les membres et le règlement intérieur.</li>
            </ul>
          </div>

          {error && (
            <p role="alert" className="border border-danger bg-danger-wash px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="min-h-11 flex-1 cursor-pointer border border-border-strong bg-bg-secondary text-sm font-bold text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={envoi}
              className="chamfer-xs inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 bg-engine text-sm font-bold text-on-accent transition-colors hover:bg-engine-deep disabled:opacity-50"
            >
              {envoi && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {envoi ? 'Envoi…' : 'Soumettre la demande'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
