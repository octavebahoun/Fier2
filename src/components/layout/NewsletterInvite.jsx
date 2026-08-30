import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, X, Loader2, Check } from 'lucide-react'
import api from '../../services/api.js'

/**
 * L'invitation à s'abonner, au premier passage.
 *
 * « Comme les cookies quand on se connecte une première fois sur un site » —
 * donc en bas, discrète, et fermable d'un geste. Elle ne bloque rien : la page
 * reste lisible et utilisable derrière, ce qui la distingue d'une modale.
 *
 * Elle ne revient pas. Trois choses la font taire pour de bon, et la décision
 * vit dans le navigateur de la personne :
 *   • un abonnement réussi,
 *   • une fermeture explicite,
 *   • un compte connecté — on ne demande pas son adresse à quelqu'un qui l'a
 *     déjà donnée en s'inscrivant.
 *
 * Le délai de dix secondes n'est pas un effet : accueillir un visiteur par une
 * demande avant même qu'il ait lu une ligne, c'est lui demander de payer avant
 * d'entrer.
 */

const CLE = 'fieri_newsletter_invite'
const DELAI_MS = 10000

/** Le stockage local peut être refusé (navigation privée, réglages). */
const lu = () => {
  try {
    return localStorage.getItem(CLE)
  } catch {
    return null
  }
}
const ecrit = (valeur) => {
  try {
    localStorage.setItem(CLE, valeur)
  } catch {
    /* Sans stockage, l'invitation reparaîtra : c'est le moindre mal. */
  }
}

export default function NewsletterInvite({ user }) {
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [error, setError] = useState(null)
  const [abonne, setAbonne] = useState(false)

  useEffect(() => {
    if (user || lu()) return
    const t = setTimeout(() => setVisible(true), DELAI_MS)
    return () => clearTimeout(t)
  }, [user])

  const fermer = () => {
    setVisible(false)
    ecrit('ferme')
  }

  const envoyer = async (e) => {
    e.preventDefault()
    setError(null)
    if (!email.includes('@')) {
      setError('Veuillez entrer une adresse e-mail valide.')
      return
    }
    setEnvoi(true)
    try {
      const res = await api.newsletter.subscribe(email.trim(), 'banniere')
      if (!res?.success) throw new Error(res?.message)
      setAbonne(true)
      ecrit('abonne')
      setTimeout(() => setVisible(false), 2200)
    } catch (err) {
      setError(err?.serverMessage || err?.message || "L'abonnement n'a pas pu être enregistré.")
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          role="region"
          aria-label="Invitation à recevoir la lettre d’information"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="chamfer-sm chamfer-shadow fixed bottom-4 left-4 right-4 z-40 border border-border-strong bg-bg-secondary p-5 sm:left-auto sm:right-6 sm:w-[26rem]"
        >
          <button
            type="button"
            onClick={fermer}
            aria-label="Fermer l’invitation"
            className="absolute right-2 top-2 inline-flex h-11 w-11 cursor-pointer items-center justify-center text-text-muted transition-colors hover:text-text-primary"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="flex items-start gap-3 pr-10">
            <div className="chamfer-xs flex h-10 w-10 shrink-0 items-center justify-center border border-engine bg-engine-wash">
              <Mail className="h-4 w-4 text-engine" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="font-display text-base font-extrabold leading-snug text-text-primary">
                Ne rien manquer de la FIERI
              </p>
              <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                Une lettre par mois : les projets qui aboutissent, les appels à
                participation et les prochaines formations.
              </p>
            </div>
          </div>

          {abonne ? (
            <p
              role="status"
              aria-live="polite"
              className="mt-4 flex items-center gap-2 border border-success bg-success-wash px-3 py-2 text-sm font-semibold text-success"
            >
              <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
              C’est noté, merci.
            </p>
          ) : (
            <form onSubmit={envoyer} className="mt-4 flex flex-col gap-2">
              <label className="sr-only" htmlFor="invite-newsletter-email">
                Votre adresse e-mail
              </label>
              <div className="flex gap-2">
                <input
                  id="invite-newsletter-email"
                  name="inviteNewsletterEmail"
                  type="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  aria-invalid={!!error}
                  aria-describedby={error ? 'invite-newsletter-error' : undefined}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError(null) }}
                  className={`min-h-11 min-w-0 flex-grow border px-3 text-sm text-text-primary placeholder:text-text-muted ${
                    error ? 'border-danger' : 'border-border-strong focus-visible:border-engine'
                  } bg-bg-primary outline-none`}
                />
                <button
                  type="submit"
                  disabled={envoi}
                  className="chamfer-xs inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 bg-engine px-4 text-sm font-bold text-on-accent transition-colors hover:bg-engine-deep disabled:opacity-50"
                >
                  {envoi && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  {envoi ? 'Envoi…' : 'M’abonner'}
                </button>
              </div>
              {error && (
                <span id="invite-newsletter-error" className="text-sm text-danger" role="alert">
                  {error}
                </span>
              )}
            </form>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
