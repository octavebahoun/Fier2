import { useCallback, useEffect, useState } from 'react'
import { Award, Loader2, Search, Trash2, UserRound } from 'lucide-react'
import api from '../services/api.js'
import PageHeader from '../components/ui/PageHeader.jsx'
import SectionCard from '../components/ui/SectionCard.jsx'
import StatePanel from '../components/ui/StatePanel.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { champ, etiquette, boutonPrimaire, nomComplet } from './espace-cite/shared.jsx'

/**
 * Badges d'honneur — attribuer et retirer.
 *
 * C'est le vrai droit du MENTOR, et il n'avait aucune interface : ni
 * `POST /badges/award` (`badge:award`) ni `DELETE /badges/:id`
 * (`badge:revoke`) n'étaient appelés nulle part. Le tableau de bord proposait
 * bien « Attribuer un badge », mais le raccourci menait aux Challenges, où
 * `BADGE_TYPES` ne sert qu'à choisir la récompense d'un défi. Le raccourci
 * pointe désormais ici.
 *
 * ── Une personne à la fois ────────────────────────────────────────────────
 * On cherche quelqu'un, on voit ce qu'il a déjà, puis on ajoute ou on retire.
 * Attribuer un badge sans voir les précédents, c'est en poser deux fois le
 * même ; retirer sans savoir qui l'a donné, c'est défaire à l'aveugle.
 */

export default function Badges() {
  const { notify } = useToast()
  const { user, BADGE_TYPES } = useAuth()

  const [recherche, setRecherche] = useState('')
  const [resultats, setResultats] = useState([])
  const [rechercheEnCours, setRechercheEnCours] = useState(false)
  const [rechercheError, setRechercheError] = useState(null)

  const [choisi, setChoisi] = useState(null)
  const [badges, setBadges] = useState([])
  const [badgesLoading, setBadgesLoading] = useState(false)
  const [badgesError, setBadgesError] = useState(null)

  const [type, setType] = useState('')
  const [attribution, setAttribution] = useState(false)
  const [retrait, setRetrait] = useState(null)

  const chercher = async (e) => {
    e.preventDefault()
    if (rechercheEnCours) return
    setRechercheEnCours(true)
    setRechercheError(null)
    try {
      const res = await api.members.list({ search: recherche.trim(), limit: 12 })
      if (!res?.success) throw new Error(res?.message)
      setResultats(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      setResultats([])
      setRechercheError(err?.serverMessage || err?.message || "L'annuaire n'a pas pu être interrogé.")
    } finally {
      setRechercheEnCours(false)
    }
  }

  const chargerBadges = useCallback(async () => {
    if (!choisi?.id) { setBadges([]); return }
    setBadgesLoading(true)
    setBadgesError(null)
    try {
      const res = await api.badges.getByUser(choisi.id)
      if (!res?.success) throw new Error(res?.message)
      setBadges(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      setBadges([])
      setBadgesError(err?.serverMessage || err?.message || "Les badges n'ont pas pu être lus.")
    } finally {
      setBadgesLoading(false)
    }
  }, [choisi?.id])

  useEffect(() => { chargerBadges() }, [chargerBadges])

  const attribuer = async (e) => {
    e.preventDefault()
    if (attribution || !choisi) return
    if (!type) return notify('Choisissez le badge à attribuer.', 'warning')
    if (badges.some((b) => b.badgeType === type)) {
      return notify(`${nomComplet(choisi)} porte déjà le badge ${type}.`, 'warning')
    }

    setAttribution(true)
    try {
      const res = await api.badges.award(choisi.id, nomComplet(choisi), type, nomComplet(user))
      if (!res?.success) throw new Error(res?.message)
      notify(`Badge ${type} attribué à ${nomComplet(choisi)}.`, 'success')
      setType('')
      await chargerBadges()
    } catch (err) {
      notify(err?.serverMessage || err?.message || "Le badge n'a pas pu être attribué.", 'error')
    } finally {
      setAttribution(false)
    }
  }

  const retirerBadge = async (badge) => {
    if (retrait) return
    setRetrait(badge.id)
    try {
      const res = await api.badges.revoke(badge.id)
      if (!res?.success) throw new Error(res?.message)
      notify(`Badge ${badge.badgeType} retiré.`, 'success')
      await chargerBadges()
    } catch (err) {
      notify(err?.serverMessage || err?.message || "Le badge n'a pas pu être retiré.", 'error')
    } finally {
      setRetrait(null)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <PageHeader
        tag="Encadrement"
        icon={Award}
        title="Badges d’honneur"
        description="Distinguez un membre que vous encadrez, ou retirez une distinction posée par erreur."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[24rem_1fr]">
        <SectionCard icon={Search} title="Choisir un membre" subtitle="Nom, prénom ou adresse">
          <form onSubmit={chercher} className="flex flex-col gap-3">
            <div>
              <label className={etiquette} htmlFor="bg-recherche">Rechercher</label>
              <div className="flex gap-2">
                <input
                  id="bg-recherche"
                  type="search"
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  placeholder="Ex : Diallo"
                  className={champ}
                />
                <button
                  type="submit"
                  disabled={rechercheEnCours}
                  aria-label="Lancer la recherche"
                  className="inline-flex min-h-11 w-11 shrink-0 cursor-pointer items-center justify-center border border-border-strong text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary disabled:opacity-50"
                >
                  {rechercheEnCours
                    ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    : <Search className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
            </div>
          </form>

          {rechercheError ? (
            <p className="mt-3 text-sm text-danger" role="alert">{rechercheError}</p>
          ) : resultats.length === 0 ? (
            <p className="mt-3 text-sm text-text-muted">
              Cherchez une personne pour voir ses distinctions.
            </p>
          ) : (
            <ul className="mt-3 flex max-h-96 flex-col gap-1.5 overflow-y-auto">
              {resultats.map((m) => {
                const actif = choisi?.id === m.id
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => setChoisi(m)}
                      aria-pressed={actif}
                      className={`flex min-h-11 w-full cursor-pointer items-center gap-2 border px-3 py-2 text-left transition-colors ${
                        actif
                          ? 'border-engine bg-engine-wash'
                          : 'border-border-subtle bg-bg-primary hover:bg-bg-tertiary'
                      }`}
                    >
                      <UserRound className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-text-primary">
                          {nomComplet(m)}
                        </span>
                        <span className="block truncate text-sm text-text-muted">{m.role}</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          icon={Award}
          title={choisi ? nomComplet(choisi) : 'Distinctions'}
          subtitle={choisi ? 'Badges portés et attribution' : 'Choisissez d’abord un membre'}
          accent="var(--color-ember)"
        >
          {!choisi ? (
            <StatePanel
              state="empty"
              icon={Award}
              message="Sélectionnez une personne à gauche pour voir ses badges et lui en attribuer un."
            />
          ) : (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="mb-3 text-sm font-bold text-text-primary">Badges portés</h3>
                {badgesLoading ? (
                  <StatePanel state="loading" />
                ) : badgesError ? (
                  <StatePanel state="error" message={badgesError} onRetry={chargerBadges} />
                ) : badges.length === 0 ? (
                  <p className="text-sm text-text-muted">Aucun badge pour l’instant.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {badges.map((b) => (
                      <li
                        key={b.id}
                        className="flex flex-wrap items-center justify-between gap-3 border border-border-subtle bg-bg-primary px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <span className="chamfer-xs inline-flex items-center border border-engine bg-engine-wash px-2 py-0.5 text-xs font-extrabold uppercase tracking-wider text-engine">
                            {b.badgeType}
                          </span>
                          <p className="mt-1 truncate text-sm text-text-muted">
                            Attribué par {b.awardedBy || 'un mentor'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => retirerBadge(b)}
                          disabled={retrait === b.id}
                          className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 border border-border-strong px-3 text-sm font-semibold text-text-secondary transition-colors hover:border-danger hover:text-danger disabled:opacity-50"
                        >
                          {retrait === b.id
                            ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                            : <Trash2 className="h-4 w-4" aria-hidden="true" />}
                          Retirer
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <form onSubmit={attribuer} className="flex flex-col gap-3 border-t border-border-subtle pt-5">
                <div>
                  <label className={etiquette} htmlFor="bg-type">Attribuer un badge</label>
                  <select
                    id="bg-type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className={`${champ} cursor-pointer`}
                  >
                    <option value="">Choisir une distinction…</option>
                    {(BADGE_TYPES || []).map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" disabled={attribution} className={boutonPrimaire}>
                  {attribution
                    ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    : <Award className="h-4 w-4" aria-hidden="true" />}
                  {attribution ? 'Attribution…' : 'Attribuer'}
                </button>
              </form>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
