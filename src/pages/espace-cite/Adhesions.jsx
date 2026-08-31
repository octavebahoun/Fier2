import { useCallback, useEffect, useState } from 'react'
import { UserPlus, Check, X, Phone } from 'lucide-react'
import api from '../../services/api.js'
import PageHeader from '../../components/ui/PageHeader.jsx'
import SectionCard from '../../components/ui/SectionCard.jsx'
import StatePanel from '../../components/ui/StatePanel.jsx'
import { useToast } from '../../components/ui/Toast.jsx'
import { useClubSpace, shouldShowClubPicker } from './useClubSpace.js'
import { ClubPicker, nomComplet, formatDateFr } from './shared.jsx'

/**
 * Adhésions — une file d'attente, deux décisions.
 *
 * L'écran ne fait que ça. Quand la file est vide, il le dit et n'affiche rien
 * d'autre : c'est le signe qu'il n'y a rien à faire ici aujourd'hui.
 */
export default function Adhesions() {
  const { notify } = useToast()
  const { clubs, clubsLoading, clubId, club, setClubId, canSupervise } = useClubSpace()

  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async () => {
    if (!clubId) { setRequests([]); return }
    setLoading(true)
    setError(null)
    try {
      const res = await api.memberships.getPendingRequests(clubId)
      setRequests(res?.success && Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      setRequests([])
      setError(
        err?.status === 403
          ? "Vous n'êtes pas responsable de ce club."
          : (err?.serverMessage || err?.message || "Les demandes n'ont pas pu être chargées."),
      )
    } finally {
      setLoading(false)
    }
  }, [clubId])

  useEffect(() => { load() }, [load])

  const decider = async (req, accepte) => {
    if (busyId) return
    setBusyId(req.id)
    // Retrait optimiste : la décision est prise, la file se vide sous l'œil.
    const avant = requests
    setRequests((list) => list.filter((r) => r.id !== req.id))
    try {
      const res = accepte
        ? await api.memberships.approve(req.id)
        : await api.memberships.reject(req.id, 'Candidature non retenue')
      if (!res?.success) throw new Error(res?.message)
      notify(
        accepte
          ? `${nomComplet(req.user)} rejoint ${club?.name || 'le club'}.`
          : `Candidature de ${nomComplet(req.user)} refusée.`,
        accepte ? 'success' : 'info',
      )
    } catch (err) {
      setRequests(avant)
      notify(err?.serverMessage || err?.message || "La décision n'a pas pu être enregistrée.", 'error')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader
        tag="Espace CITE"
        icon={UserPlus}
        title="Adhésions à valider"
        description={`Candidatures en attente pour ${club?.name || 'votre club'}.`}
      >
        {shouldShowClubPicker({ canSupervise, clubs }) && (
          <div className="mt-4">
            <ClubPicker clubs={clubs} clubId={clubId} onChange={setClubId} loading={clubsLoading} />
          </div>
        )}
      </PageHeader>

      <SectionCard
        icon={UserPlus}
        title="En attente"
        subtitle={requests.length ? `${requests.length} candidature${requests.length > 1 ? 's' : ''}` : undefined}
        accent="var(--color-ember)"
      >
        {loading ? (
          <StatePanel state="loading" />
        ) : error ? (
          <StatePanel state="error" message={error} onRetry={load} />
        ) : requests.length === 0 ? (
          <StatePanel
            state="empty"
            icon={Check}
            message="Aucune candidature en attente. Les nouvelles demandes apparaîtront ici."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {requests.map((req) => (
              <li
                key={req.id}
                className="flex flex-col gap-3 border border-border-subtle bg-bg-primary px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary">{nomComplet(req.user)}</p>
                  <p className="text-sm text-text-muted">
                    {req.user?.email || 'Adresse non renseignée'} · demandé le {formatDateFr(req.createdAt)}
                  </p>

                  {/* Ce sur quoi la decision se prend. La file n'affichait
                      qu'un nom : accepter ou refuser tenait de la devinette. */}
                  {req.contact && (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-text-secondary">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-engine" aria-hidden="true" />
                      {req.contact}
                    </p>
                  )}
                  {req.motivation && (
                    <p className="mt-2 border-l-2 border-border-strong pl-3 text-sm leading-relaxed text-text-secondary">
                      {req.motivation}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => decider(req, true)}
                    disabled={busyId === req.id}
                    className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 border border-success bg-success-wash px-4 text-sm font-bold text-success transition-colors hover:bg-success-wash disabled:opacity-50 sm:flex-none"
                  >
                    <Check className="h-4 w-4" aria-hidden="true" /> Accepter
                  </button>
                  <button
                    type="button"
                    onClick={() => decider(req, false)}
                    disabled={busyId === req.id}
                    className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 border border-border-strong px-4 text-sm font-bold text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary disabled:opacity-50 sm:flex-none"
                  >
                    <X className="h-4 w-4" aria-hidden="true" /> Refuser
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  )
}
