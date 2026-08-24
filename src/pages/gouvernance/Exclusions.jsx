import { useCallback, useEffect, useState } from 'react'
import { UserX, ShieldCheck, Loader2 } from 'lucide-react'
import api from '../../services/api.js'
import PageHeader from '../../components/ui/PageHeader.jsx'
import SectionCard from '../../components/ui/SectionCard.jsx'
import StatePanel from '../../components/ui/StatePanel.jsx'
import { useToast } from '../../components/ui/Toast.jsx'
import { useUniversityScope } from './useUniversityScope.js'
import UniversitySelector from './UniversitySelector.jsx'
import { champ, etiquette, nomComplet, formatDateFr } from '../espace-cite/shared.jsx'

/**
 * Exclusions — trancher les demandes de retrait déposées par les responsables.
 *
 * Une décision irréversible : le refus demande un motif, transmis au
 * demandeur. Le motif est saisi avant la décision, pas après.
 */
export default function Exclusions() {
  const { notify } = useToast()
  const scope = useUniversityScope()
  const { universityId, besoinSelecteur } = scope

  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [motifs, setMotifs] = useState({})

  const load = useCallback(async () => {
    if (!universityId) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.governance.listDeletionRequests(universityId)
      setRequests(res?.success && Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      setRequests([])
      setError(err?.serverMessage || err?.message || "Les demandes n'ont pas pu être chargées.")
    } finally {
      setLoading(false)
    }
  }, [universityId])

  useEffect(() => { load() }, [load])

  const trancher = async (membre, approuve) => {
    if (busyId) return
    const motif = approuve ? '' : (motifs[membre.id] || '').trim()
    if (!approuve && !motif) {
      return notify('Indiquez au responsable pourquoi la demande est rejetée.', 'warning')
    }
    setBusyId(membre.id)
    try {
      const res = await api.governance.confirmDeletion(membre.id, approuve, motif)
      if (!res?.success) throw new Error(res?.message)
      notify(
        approuve
          ? `Exclusion de ${nomComplet(membre)} validée — compte archivé.`
          : `Demande rejetée — l’accès de ${nomComplet(membre)} est maintenu.`,
        approuve ? 'success' : 'info',
      )
      setMotifs((m) => { const copie = { ...m }; delete copie[membre.id]; return copie })
      await load()
    } catch (err) {
      notify(err?.serverMessage || err?.message || "La décision n'a pas pu être enregistrée.", 'error')
    } finally {
      setBusyId(null)
    }
  }

  if (besoinSelecteur && !universityId) {
    return <UniversitySelector scope={scope} titre="Demandes d’exclusion" />
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader
        tag="Gouvernance"
        icon={UserX}
        title="Demandes d’exclusion"
        description="Les retraits de membre demandés par les responsables de club. Valider archive le compte."
      />

      <SectionCard
        icon={UserX}
        title="En attente de décision"
        subtitle={requests.length ? `${requests.length} demande${requests.length > 1 ? 's' : ''}` : undefined}
        accent="var(--color-ember)"
      >
        {loading ? (
          <StatePanel state="loading" />
        ) : error ? (
          <StatePanel state="error" message={error} onRetry={load} />
        ) : requests.length === 0 ? (
          <StatePanel
            state="empty"
            icon={ShieldCheck}
            message="Aucune demande d’exclusion en attente."
          />
        ) : (
          <ul className="flex flex-col gap-4">
            {requests.map((m) => (
              <li key={m.id} className="flex flex-col gap-3 border border-border-subtle bg-bg-primary px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-text-primary">{nomComplet(m)}</p>
                  <p className="text-sm text-text-muted">
                    {m.email || 'Adresse non renseignée'} · demandé le {formatDateFr(m.deletionRequestedAt || m.updatedAt)}
                  </p>
                  {m.deletionReason && (
                    <p className="mt-2 border-l-2 border-border-strong pl-3 text-sm italic text-text-secondary">
                      « {m.deletionReason} »
                    </p>
                  )}
                </div>

                <div>
                  <label className={etiquette} htmlFor={`motif-${m.id}`}>
                    Motif du rejet
                  </label>
                  <input
                    id={`motif-${m.id}`}
                    type="text"
                    value={motifs[m.id] || ''}
                    onChange={(e) => setMotifs({ ...motifs, [m.id]: e.target.value })}
                    placeholder="Transmis au responsable qui a fait la demande"
                    className={champ}
                  />
                  <p className="mt-1 text-sm text-text-muted">
                    Nécessaire pour rejeter. Inutile pour valider.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => trancher(m, true)}
                    disabled={busyId === m.id}
                    className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 border border-danger bg-danger-wash px-4 text-sm font-bold text-danger transition-colors hover:bg-danger-wash disabled:opacity-50"
                  >
                    {busyId === m.id ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <UserX className="h-4 w-4" aria-hidden="true" />}
                    Valider l’exclusion
                  </button>
                  <button
                    type="button"
                    onClick={() => trancher(m, false)}
                    disabled={busyId === m.id}
                    className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 border border-border-strong px-4 text-sm font-bold text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary disabled:opacity-50"
                  >
                    Rejeter la demande
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
