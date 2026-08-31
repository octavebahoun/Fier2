import { useCallback, useEffect, useState } from 'react'
import { ClipboardCheck, Check, Loader2, Users } from 'lucide-react'
import api from '../../services/api.js'
import PageHeader from '../../components/ui/PageHeader.jsx'
import SectionCard from '../../components/ui/SectionCard.jsx'
import StatePanel from '../../components/ui/StatePanel.jsx'
import { useToast } from '../../components/ui/Toast.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useUniversityScope } from './useUniversityScope.js'
import UniversitySelector from './UniversitySelector.jsx'
import { formatDateFr } from '../espace-cite/shared.jsx'

/**
 * Recensements — l'historique des effectifs déclarés par les clubs.
 *
 * `GET /universities/:id/census-history` (`census:read`) n'était affiché nulle
 * part : les responsables de club soumettaient leurs effectifs dans le vide.
 * `POST /universities/:id/validate-census/:censusId` (`census:validate`)
 * n'avait pas davantage de bouton — la table déclarait le droit, le secrétariat
 * ne pouvait pas l'exercer.
 *
 * Deux postes lisent, un seul valide : le chef universitaire supervise, le
 * secrétariat consolide. Le bouton n'apparaît donc que pour qui peut valider,
 * et jamais sur un recensement déjà validé — le serveur le refuserait.
 */

const ETAT = {
  SUBMITTED: { label: 'À valider', className: 'border-warning text-warning' },
  VALIDATED: { label: 'Validé', className: 'border-success text-success' },
}

export default function Recensements() {
  const { notify } = useToast()
  const { can } = useAuth()
  const scope = useUniversityScope()
  const { universityId, besoinSelecteur } = scope

  const peutValider = can('census:validate', { universityId })

  const [censuses, setCensuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const charger = useCallback(async () => {
    if (!universityId) { setCensuses([]); setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const res = await api.clubSpace.censusHistory(universityId)
      if (!res?.success) throw new Error(res?.message)
      setCensuses(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      setCensuses([])
      setError(
        err?.status === 403
          ? "Votre poste ne donne pas accès aux recensements de cette université."
          : (err?.serverMessage || err?.message || "L'historique n'a pas pu être chargé."),
      )
    } finally {
      setLoading(false)
    }
  }, [universityId])

  useEffect(() => { charger() }, [charger])

  const valider = async (census) => {
    if (busyId) return
    setBusyId(census.id)
    try {
      const res = await api.clubSpace.validateCensus(universityId, census.id)
      if (!res?.success) throw new Error(res?.message)
      notify(`Recensement de ${census.clubName} validé.`, 'success')
      await charger()
    } catch (err) {
      notify(err?.serverMessage || err?.message || "Le recensement n'a pas pu être validé.", 'error')
    } finally {
      setBusyId(null)
    }
  }

  if (besoinSelecteur && !universityId) {
    return <UniversitySelector scope={scope} titre="Recensements des clubs" />
  }

  const aValider = censuses.filter((c) => c.status !== 'VALIDATED').length

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <PageHeader
        tag="Gouvernance"
        icon={ClipboardCheck}
        title="Recensements des clubs"
        description="Les effectifs déclarés par les clubs de l’université, du plus récent au plus ancien."
      />

      <SectionCard
        icon={ClipboardCheck}
        title="Historique"
        subtitle={
          censuses.length
            ? `${censuses.length} déclaration${censuses.length > 1 ? 's' : ''}${aValider ? ` · ${aValider} à valider` : ''}`
            : undefined
        }
      >
        {loading ? (
          <StatePanel state="loading" />
        ) : error ? (
          <StatePanel state="error" message={error} onRetry={charger} />
        ) : censuses.length === 0 ? (
          <StatePanel
            state="empty"
            icon={ClipboardCheck}
            message="Aucun recensement déclaré. Ils apparaîtront ici dès qu’un club soumettra ses effectifs."
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {censuses.map((c) => {
              const etat = ETAT[c.status] || { label: c.status || '—', className: 'border-border-strong text-text-muted' }
              const valide = c.status === 'VALIDATED'
              return (
                <li
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-3 border border-border-subtle bg-bg-primary px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-text-primary">{c.clubName}</p>
                      <span className={`border px-2 py-0.5 text-xs font-bold ${etat.className}`}>
                        {etat.label}
                      </span>
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-text-muted">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" aria-hidden="true" />
                        {c.memberCount} membre{c.memberCount > 1 ? 's' : ''}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>déclaré par {c.submittedBy} le {formatDateFr(c.createdAt)}</span>
                      {valide && c.validatedAt && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>validé le {formatDateFr(c.validatedAt)}</span>
                        </>
                      )}
                    </p>
                  </div>

                  {peutValider && !valide && (
                    <button
                      type="button"
                      onClick={() => valider(c)}
                      disabled={busyId === c.id}
                      className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 border border-success bg-success-wash px-4 text-sm font-bold text-success transition-colors hover:bg-success-wash disabled:opacity-50"
                    >
                      {busyId === c.id
                        ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        : <Check className="h-4 w-4" aria-hidden="true" />}
                      Valider
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </SectionCard>
    </div>
  )
}
