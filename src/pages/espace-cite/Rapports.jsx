import { useCallback, useEffect, useState } from 'react'
import { FileText, Users, Send, Loader2, Inbox } from 'lucide-react'
import api from '../../services/api.js'
import PageHeader from '../../components/ui/PageHeader.jsx'
import SectionCard from '../../components/ui/SectionCard.jsx'
import StatePanel from '../../components/ui/StatePanel.jsx'
import { useToast } from '../../components/ui/Toast.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useClubSpace, shouldShowClubPicker } from './useClubSpace.js'
import { ClubPicker, champ, etiquette, boutonPrimaire, formatDateFr } from './shared.jsx'

/**
 * Rapports — un sujet, deux gestes selon qui regarde.
 *
 * Un responsable de club dépose ; le secrétariat et le chef universitaire
 * lisent. Ce sont deux faces du même objet, sur le même écran — contrairement
 * aux blocs qui cohabitaient sans rapport entre eux dans l'ancien espace.
 *
 * Cet écran remplace aussi la section « Rapports d'activité transmis » de la
 * page Gouvernance : la même liste y était affichée une seconde fois, à partir
 * du même appel.
 */
export default function Rapports() {
  const { notify } = useToast()
  const { universityPost } = useAuth()
  const {
    clubs, clubsLoading, clubId, club, setClubId, canSupervise,
    universityId, canSubmitReport, canSubmitCensus, canReadReports,
  } = useClubSpace()

  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [censusBusy, setCensusBusy] = useState(false)
  const [reportBusy, setReportBusy] = useState(false)
  const [form, setForm] = useState({ period: '', title: '', content: '' })

  // Le poste décide du destinataire : une secrétaire consolide vers le chef
  // universitaire, un responsable de club transmet à la secrétaire.
  const estSecretaire = universityPost === 'SECRETAIRE'
  const destinataire = estSecretaire ? 'au Chef Universitaire' : 'à la Secrétaire Générale'

  const loadReports = useCallback(async () => {
    if (!canReadReports || !universityId) { setReports([]); return }
    setLoading(true)
    setError(null)
    try {
      const res = await api.clubSpace.universityReports(universityId)
      setReports(res?.success && Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      setReports([])
      setError(err?.serverMessage || err?.message || "Les rapports n'ont pas pu être chargés.")
    } finally {
      setLoading(false)
    }
  }, [canReadReports, universityId])

  useEffect(() => { loadReports() }, [loadReports])

  const submitCensus = async () => {
    if (censusBusy || !clubId) return
    setCensusBusy(true)
    try {
      const res = await api.clubSpace.submitCensus(clubId)
      if (!res?.success) throw new Error(res?.message)
      const n = res.data?.memberCount ?? 0
      notify(`Recensement transmis ${destinataire} — ${n} membre${n > 1 ? 's' : ''}.`, 'success')
    } catch (err) {
      notify(err?.serverMessage || err?.message || "Le recensement n'a pas pu être transmis.", 'error')
    } finally {
      setCensusBusy(false)
    }
  }

  const submitReport = async (e) => {
    e.preventDefault()
    if (reportBusy || !clubId) return
    if (!form.period.trim() || !form.title.trim() || !form.content.trim()) {
      return notify('Période, titre et contenu sont nécessaires pour transmettre le rapport.', 'warning')
    }
    setReportBusy(true)
    try {
      const res = await api.clubSpace.submitReport(clubId, {
        period: form.period.trim(),
        title: form.title.trim(),
        content: form.content.trim(),
      })
      if (!res?.success) throw new Error(res?.message)
      notify(`Rapport « ${form.title.trim()} » transmis ${destinataire}.`, 'success')
      setForm({ period: '', title: '', content: '' })
      await loadReports()
    } catch (err) {
      notify(err?.serverMessage || err?.message || "Le rapport n'a pas pu être transmis.", 'error')
    } finally {
      setReportBusy(false)
    }
  }

  const peutDeposer = canSubmitReport || canSubmitCensus

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        tag="Espace CITE"
        icon={FileText}
        title="Rapports d’activité"
        description={
          canReadReports
            ? 'Les rapports transmis par les clubs de votre université.'
            : `Recensement et rapport mensuel de ${club?.name || 'votre club'}, transmis ${destinataire}.`
        }
      >
        {shouldShowClubPicker({ canSupervise, clubs }) && (
          <div className="mt-4">
            <ClubPicker clubs={clubs} clubId={clubId} onChange={setClubId} loading={clubsLoading} />
          </div>
        )}
      </PageHeader>

      <div className={`grid grid-cols-1 gap-6 ${peutDeposer && canReadReports ? 'lg:grid-cols-2' : ''}`}>
        {peutDeposer && (
          <div className="flex flex-col gap-6">
            {canSubmitCensus && (
              <SectionCard
                icon={Users}
                title={estSecretaire ? 'Recensement global' : 'Recensement mensuel'}
                subtitle={`Effectif du club, transmis ${destinataire}`}
                accent="var(--color-emerald-500)"
              >
                <p className="mb-4 text-sm text-text-secondary">
                  Le recensement compte les membres actuellement inscrits au club. Il n’y a rien à
                  saisir : l’effectif est lu au moment de l’envoi.
                </p>
                <button
                  type="button"
                  onClick={submitCensus}
                  disabled={censusBusy || !clubId}
                  className={boutonPrimaire}
                >
                  {censusBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
                  {censusBusy ? 'Transmission…' : 'Transmettre le recensement'}
                </button>
              </SectionCard>
            )}

            {canSubmitReport && (
              <SectionCard
                icon={FileText}
                title={estSecretaire ? 'Rapport mensuel global' : 'Rapport d’activité'}
                subtitle={`Synthèse du mois, transmise ${destinataire}`}
              >
                <form onSubmit={submitReport} className="flex flex-col gap-4">
                  <div>
                    <label className={etiquette} htmlFor="rapport-periode">Période</label>
                    <input
                      id="rapport-periode"
                      type="month"
                      required
                      value={form.period}
                      onChange={(e) => setForm({ ...form, period: e.target.value })}
                      className={champ}
                    />
                  </div>
                  <div>
                    <label className={etiquette} htmlFor="rapport-titre">Titre</label>
                    <input
                      id="rapport-titre"
                      type="text"
                      required
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="Ex : Bilan mensuel R&D"
                      className={champ}
                    />
                  </div>
                  <div>
                    <label className={etiquette} htmlFor="rapport-contenu">Contenu</label>
                    <textarea
                      id="rapport-contenu"
                      rows={6}
                      required
                      value={form.content}
                      onChange={(e) => setForm({ ...form, content: e.target.value })}
                      placeholder="Travaux menés, difficultés rencontrées, besoins pour le mois à venir."
                      className={`${champ} min-h-36 py-2`}
                    />
                  </div>
                  <button type="submit" disabled={reportBusy || !clubId} className={boutonPrimaire}>
                    {reportBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
                    {reportBusy ? 'Transmission…' : 'Transmettre le rapport'}
                  </button>
                </form>
              </SectionCard>
            )}
          </div>
        )}

        {canReadReports && (
          <SectionCard
            icon={Inbox}
            title="Rapports reçus"
            subtitle={reports.length ? `${reports.length} rapport${reports.length > 1 ? 's' : ''}` : undefined}
            accent="var(--color-ember)"
          >
            {loading ? (
              <StatePanel state="loading" />
            ) : error ? (
              <StatePanel state="error" message={error} onRetry={loadReports} />
            ) : reports.length === 0 ? (
              <StatePanel
                state="empty"
                icon={Inbox}
                message="Aucun rapport transmis pour le moment. Ceux déposés par les responsables de club apparaîtront ici."
              />
            ) : (
              <ul className="flex max-h-[36rem] flex-col gap-3 overflow-y-auto">
                {reports.map((r) => (
                  <li key={r.id} className="border border-border-subtle bg-bg-primary px-4 py-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="text-sm font-semibold text-text-primary">{r.title}</h3>
                      <span className="font-mono text-xs text-text-muted">{r.period}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-text-muted">
                      {r.club?.name || 'Club'} · déposé le {formatDateFr(r.createdAt)}
                    </p>
                    {r.content && (
                      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-text-secondary">
                        {r.content}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        )}
      </div>
    </div>
  )
}
