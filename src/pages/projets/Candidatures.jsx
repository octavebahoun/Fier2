import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCircle2, Inbox, Loader2, XCircle } from 'lucide-react'
import api from '../../services/api.js'
import PageHeader from '../../components/ui/PageHeader.jsx'
import SectionCard from '../../components/ui/SectionCard.jsx'
import StatePanel from '../../components/ui/StatePanel.jsx'
import { useToast } from '../../components/ui/Toast.jsx'
import { champ, etiquette, formatDateFr, nomComplet } from '../espace-cite/shared.jsx'

/**
 * Candidatures reçues — l'autre moitié du rôle Chef de projet.
 *
 * `PATCH /applications/:id/status` lui était ouvert depuis le début, sans
 * qu'aucun écran ne l'expose : les candidatures déposées sur une opportunité
 * n'étaient donc jamais examinées par l'interface.
 *
 * Une intention : décider du sort des candidatures d'une opportunité.
 */

const STATUTS = {
  PENDING:  { label: 'En attente', className: 'border-warning text-warning' },
  APPROVED: { label: 'Retenue',    className: 'border-success text-success' },
  REJECTED: { label: 'Écartée',    className: 'border-danger text-danger' },
}

const statut = (v) => STATUTS[v] || { label: v || '—', className: 'border-border-strong text-text-muted' }

export default function Candidatures() {
  const { notify } = useToast()
  const [params, setParams] = useSearchParams()
  const opportunityId = params.get('offre') || ''

  const [offres, setOffres] = useState([])
  const [offresLoading, setOffresLoading] = useState(true)
  const [offresError, setOffresError] = useState(null)

  const [candidatures, setCandidatures] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(null)

  useEffect(() => {
    let actif = true
    ;(async () => {
      setOffresLoading(true)
      setOffresError(null)
      try {
        const res = await api.opportunities.getAll()
        if (!actif) return
        if (!res?.success) throw new Error(res?.message)
        setOffres(res.data || [])
      } catch (err) {
        if (!actif) return
        setOffres([])
        setOffresError(err?.serverMessage || err?.message || "Les opportunités n'ont pas pu être chargées.")
      } finally {
        if (actif) setOffresLoading(false)
      }
    })()
    return () => { actif = false }
  }, [])

  const load = useCallback(async () => {
    if (!opportunityId) { setCandidatures([]); return }
    setLoading(true)
    setError(null)
    try {
      const res = await api.applications.getByOpportunity(opportunityId)
      if (!res?.success) throw new Error(res?.message)
      setCandidatures(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      setCandidatures([])
      setError(err?.serverMessage || err?.message || "Les candidatures n'ont pas pu être chargées.")
    } finally {
      setLoading(false)
    }
  }, [opportunityId])

  useEffect(() => { load() }, [load])

  const choisirOffre = (id) => {
    setParams((c) => {
      const p = new URLSearchParams(c)
      if (id) p.set('offre', id); else p.delete('offre')
      return p
    })
  }

  const decider = async (candidature, nouveauStatut) => {
    if (busy) return
    const nom = nomComplet(candidature.member)
    setBusy(candidature.id)
    try {
      const res = await api.applications.updateStatus(candidature.id, nouveauStatut)
      if (!res?.success) throw new Error(res?.message)
      notify(
        nouveauStatut === 'APPROVED'
          ? `Candidature de ${nom} retenue.`
          : `Candidature de ${nom} écartée.`,
        'success',
      )
      // On relit : la liste ne montre que ce que le serveur a accepté.
      await load()
    } catch (err) {
      notify(err?.serverMessage || err?.message || "La décision n'a pas pu être enregistrée.", 'error')
    } finally {
      setBusy(null)
    }
  }

  const enAttente = candidatures.filter((c) => (c.status || 'PENDING') === 'PENDING').length

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <PageHeader
        tag="Recherche & R&D"
        icon={Inbox}
        title="Candidatures reçues"
        description="Examinez les candidatures déposées sur une opportunité, et décidez."
      />

      <SectionCard icon={Inbox} title="Opportunité" subtitle="Choisissez l’offre à examiner">
        {offresLoading ? (
          <StatePanel state="loading" />
        ) : offresError ? (
          <StatePanel state="error" message={offresError} />
        ) : offres.length === 0 ? (
          <StatePanel state="empty" icon={Inbox} message="Aucune opportunité n’est publiée pour le moment." />
        ) : (
          <div>
            <label className={etiquette} htmlFor="candidatures-offre">Opportunité</label>
            <select
              id="candidatures-offre"
              value={opportunityId}
              onChange={(e) => choisirOffre(e.target.value)}
              className={`${champ} cursor-pointer`}
            >
              <option value="">Sélectionner une opportunité…</option>
              {offres.map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}
            </select>
          </div>
        )}
      </SectionCard>

      {opportunityId && (
        <SectionCard
          icon={Inbox}
          title="Candidatures"
          subtitle={candidatures.length
            ? `${candidatures.length} reçue${candidatures.length > 1 ? 's' : ''}${enAttente ? ` · ${enAttente} à examiner` : ''}`
            : undefined}
          accent="var(--color-ember)"
        >
          {loading ? (
            <StatePanel state="loading" />
          ) : error ? (
            <StatePanel state="error" message={error} onRetry={load} />
          ) : candidatures.length === 0 ? (
            <StatePanel state="empty" icon={Inbox} message="Personne n’a encore postulé à cette opportunité." />
          ) : (
            <ul className="flex flex-col gap-3">
              {candidatures.map((c) => {
                const s = statut(c.status)
                const decidee = (c.status || 'PENDING') !== 'PENDING'
                return (
                  <li key={c.id} className="border border-border-strong bg-bg-primary p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-text-primary">{nomComplet(c.member)}</p>
                        <p className="text-sm text-text-muted">
                          Déposée le {formatDateFr(c.createdAt)}
                          {c.member?.email ? ` · ${c.member.email}` : ''}
                        </p>
                      </div>
                      <span className={`shrink-0 border px-2 py-0.5 text-xs font-extrabold uppercase tracking-wider ${s.className}`}>
                        {s.label}
                      </span>
                    </div>

                    {c.coverLetter && (
                      <p className="mt-3 whitespace-pre-line border-l-2 border-border-strong pl-3 text-sm leading-relaxed text-text-secondary">
                        {c.coverLetter}
                      </p>
                    )}

                    {/* Le dépôt de pièce jointe n'existe pas encore côté
                        plateforme : on le dit, au lieu de laisser croire à un
                        document manquant. */}
                    <p className="mt-3 text-sm text-text-muted">
                      {c.cvUrl
                        ? <a href={c.cvUrl} target="_blank" rel="noreferrer" className="font-semibold text-engine underline underline-offset-4">Document joint</a>
                        : 'Aucun document : la plateforme ne reçoit pas encore de pièce jointe.'}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => decider(c, 'APPROVED')}
                        disabled={busy === c.id || c.status === 'APPROVED'}
                        className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 border border-success px-4 text-sm font-bold text-success transition-colors hover:bg-success-wash disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {busy === c.id ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
                        Retenir
                      </button>
                      <button
                        type="button"
                        onClick={() => decider(c, 'REJECTED')}
                        disabled={busy === c.id || c.status === 'REJECTED'}
                        className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 border border-danger px-4 text-sm font-bold text-danger transition-colors hover:bg-danger-wash disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" aria-hidden="true" />
                        Écarter
                      </button>
                      {decidee && (
                        <p className="flex min-h-11 items-center text-sm text-text-muted">
                          Une décision déjà prise peut être changée.
                        </p>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </SectionCard>
      )}
    </div>
  )
}
