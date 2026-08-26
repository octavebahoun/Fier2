import { useCallback, useEffect, useState } from 'react'
import { Award, PenTool, Loader2, CheckCircle2, Upload, Download } from 'lucide-react'
import api from '../../services/api.js'
import PageHeader from '../../components/ui/PageHeader.jsx'
import SectionCard from '../../components/ui/SectionCard.jsx'
import StatePanel from '../../components/ui/StatePanel.jsx'
import { useToast } from '../../components/ui/Toast.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useUniversityScope } from './useUniversityScope.js'
import UniversitySelector from './UniversitySelector.jsx'
import { champ, etiquette, boutonPrimaire, nomComplet, formatDateFr } from '../espace-cite/shared.jsx'

const CATEGORIES = [
  { value: 'FORMATION',    label: 'Formation suivie' },
  { value: 'PARTICIPATION', label: 'Participation à un événement' },
  { value: 'MERITE',       label: 'Mérite ou distinction' },
  { value: 'FONCTION',     label: 'Exercice d’une fonction' },
]

/**
 * Attestations — émettre un document officiel.
 *
 * La griffe manuscrite conditionne l'émission : sans elle, les PDF sortiraient
 * sans signature. Elle est donc traitée comme un prérequis affiché, pas comme
 * une option enfouie dans le formulaire.
 */
export default function Attestations() {
  const { notify } = useToast()
  const { user, can } = useAuth()
  const scope = useUniversityScope()
  const { universityId, besoinSelecteur } = scope

  const canUploadSignature = can('signature:upload', { universityId })

  const [members, setMembers] = useState([])
  const [certsError, setCertsError] = useState(null)
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [errorMembers, setErrorMembers] = useState(null)

  const [form, setForm] = useState({ recipientId: '', title: '', category: 'FORMATION' })
  const [issuing, setIssuing] = useState(false)
  const [derniere, setDerniere] = useState(null)

  const [signatureTeleversee, setSignatureTeleversee] = useState(null)
  const signatureUrl = signatureTeleversee ?? user?.signatureUrl ?? null
  const [uploading, setUploading] = useState(false)

  const [certs, setCerts] = useState([])
  const [loadingCerts, setLoadingCerts] = useState(false)

  const loadMembers = useCallback(async () => {
    if (!universityId) return
    setLoadingMembers(true)
    setErrorMembers(null)
    try {
      const res = await api.members.list({ limit: 200 })
      const liste = res?.success ? (res.data || []) : []
      setMembers(liste.filter(
        (m) => m.universityId === universityId || m.branch?.universityId === universityId,
      ))
    } catch (err) {
      setMembers([])
      setErrorMembers(
        err?.status === 403
          ? "Vous n'avez pas accès à la liste des membres de cette université."
          : "La liste des membres n'a pas pu être chargée.",
      )
    } finally {
      setLoadingMembers(false)
    }
  }, [universityId])

  const loadCerts = useCallback(async () => {
    if (!user?.id) return
    setLoadingCerts(true)
    setCertsError(null)
    try {
      const res = await api.certificate.listForMember(user.id)
      setCerts(res?.success && Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      setCerts([])
      setCertsError(err?.serverMessage || err?.message || "Vos attestations n'ont pas pu être chargées.")
    } finally {
      setLoadingCerts(false)
    }
  }, [user?.id])

  useEffect(() => { loadMembers() }, [loadMembers])
  useEffect(() => { loadCerts() }, [loadCerts])

  const uploadSignature = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await api.certificate.uploadSignature(file)
      if (!res?.success || !res?.data?.signatureUrl) throw new Error(res?.message)
      setSignatureTeleversee(res.data.signatureUrl)
      notify('Griffe enregistrée. Elle sera apposée sur les attestations émises.', 'success')
    } catch (err) {
      notify(err?.serverMessage || err?.message || "La griffe n'a pas pu être enregistrée.", 'error')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const emettre = async (e) => {
    e.preventDefault()
    if (issuing || !universityId) return
    if (!form.recipientId || !form.title.trim()) {
      return notify('Choisissez un destinataire et saisissez un intitulé.', 'warning')
    }
    const destinataire = members.find((m) => String(m.id) === String(form.recipientId))
    setIssuing(true)
    setDerniere(null)
    try {
      const res = await api.certificate.issue(universityId, {
        recipientId: Number(form.recipientId),
        title: form.title.trim(),
        category: form.category,
      })
      // Une émission qui échoue est une émission qui n'a pas eu lieu. L'ancien
      // écran fabriquait une attestation locale en cas d'erreur et annonçait
      // le succès : le destinataire ne recevait rien, l'émetteur croyait le
      // contraire (constat F11).
      if (!res?.success) throw new Error(res?.message)
      setDerniere({ ...res.data, recipientName: nomComplet(destinataire) })
      notify(`Attestation « ${form.title.trim()} » émise pour ${nomComplet(destinataire)}.`, 'success')
      setForm({ recipientId: '', title: '', category: 'FORMATION' })
      await loadCerts()
    } catch (err) {
      notify(
        err?.serverMessage || err?.message
        || "L'attestation n'a pas été émise. Vérifiez votre griffe et réessayez.",
        'error',
      )
    } finally {
      setIssuing(false)
    }
  }

  if (besoinSelecteur && !universityId) {
    return <UniversitySelector scope={scope} titre="Émettre une attestation" />
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        tag="Gouvernance"
        icon={Award}
        title="Attestations"
        description="Émettre un document officiel signé pour un membre de votre université."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <SectionCard
            icon={PenTool}
            title="Griffe officielle"
            subtitle="Apposée sur chaque attestation émise"
            accent={signatureUrl ? 'var(--color-emerald-500)' : 'var(--color-ember)'}
          >
            {signatureUrl ? (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-24 items-center justify-center border border-border-strong bg-bg-primary p-1">
                    <img src={signatureUrl} alt="Votre griffe officielle" className="max-h-full max-w-full object-contain" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-success">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Griffe active
                  </span>
                </div>
                {canUploadSignature && (
                  <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 border border-border-strong px-4 text-sm font-bold text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary">
                    <Upload className="h-4 w-4" aria-hidden="true" />
                    Remplacer
                    <input type="file" accept="image/*" onChange={uploadSignature} className="sr-only" />
                  </label>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-text-secondary">
                  Aucune griffe déposée. Les attestations que vous émettez sortiraient sans signature —
                  déposez une image de votre signature manuscrite détourée (PNG ou JPG).
                </p>
                {canUploadSignature && (
                  <label className={`${boutonPrimaire} w-fit`}>
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Upload className="h-4 w-4" aria-hidden="true" />}
                    {uploading ? 'Enregistrement…' : 'Déposer ma griffe'}
                    <input type="file" accept="image/*" onChange={uploadSignature} className="sr-only" />
                  </label>
                )}
              </div>
            )}
          </SectionCard>

          <SectionCard icon={Award} title="Émettre une attestation" subtitle="Le destinataire la reçoit par e-mail">
            <form onSubmit={emettre} className="flex flex-col gap-4">
              <div>
                <label className={etiquette} htmlFor="attestation-destinataire">Destinataire</label>
                <select
                  id="attestation-destinataire"
                  required
                  value={form.recipientId}
                  disabled={loadingMembers}
                  onChange={(e) => setForm({ ...form, recipientId: e.target.value })}
                  className={`${champ} cursor-pointer`}
                >
                  <option value="">Choisir un membre…</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{nomComplet(m)}</option>
                  ))}
                </select>
                {loadingMembers && <p className="mt-1 text-sm text-text-muted">Chargement des membres…</p>}
                {errorMembers && <p className="mt-1 text-sm text-danger" role="alert">{errorMembers}</p>}
                {!loadingMembers && !errorMembers && members.length === 0 && (
                  <p className="mt-1 text-sm text-text-muted">
                    Aucun membre rattaché à cette université : une attestation ne peut être émise que
                    pour un membre enregistré.
                  </p>
                )}
              </div>

              <div>
                <label className={etiquette} htmlFor="attestation-intitule">Intitulé</label>
                <input
                  id="attestation-intitule"
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex : Formation en robotique appliquée"
                  className={champ}
                />
                <p className="mt-1 text-sm text-text-muted">Ce texte apparaît en titre du document.</p>
              </div>

              <div>
                <label className={etiquette} htmlFor="attestation-categorie">Nature</label>
                <select
                  id="attestation-categorie"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={`${champ} cursor-pointer`}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <button type="submit" disabled={issuing || !signatureUrl} className={boutonPrimaire}>
                {issuing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Award className="h-4 w-4" aria-hidden="true" />}
                {issuing ? 'Émission…' : 'Émettre l’attestation'}
              </button>
              {!signatureUrl && (
                <p className="text-sm text-text-muted">
                  Déposez d’abord votre griffe : elle doit figurer sur le document.
                </p>
              )}
            </form>

            {derniere && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border border-success bg-success-wash px-4 py-3">
                <p className="text-sm text-success">
                  « {derniere.title} » émise pour {derniere.recipientName}.
                </p>
                {derniere.fileUrl && (
                  <a
                    href={derniere.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 border border-success px-4 text-sm font-bold text-success transition-colors hover:bg-success-wash"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" /> Ouvrir le PDF
                  </a>
                )}
              </div>
            )}
          </SectionCard>
        </div>

        <SectionCard
          icon={Award}
          title="Mes attestations reçues"
          subtitle="Celles qui vous ont été délivrées"
          accent="var(--color-ember)"
        >
          {loadingCerts ? (
            <StatePanel state="loading" />
          ) : certsError ? (
            <StatePanel state="error" message={certsError} onRetry={loadCerts} />
          ) : certs.length === 0 ? (
            <StatePanel state="empty" icon={Award} message="Vous n’avez encore reçu aucune attestation." />
          ) : (
            <ul className="flex max-h-[32rem] flex-col gap-2 overflow-y-auto">
              {certs.map((c) => (
                <li key={c.id} className="flex items-start justify-between gap-3 border border-border-subtle bg-bg-primary px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-primary">{c.title}</p>
                    <p className="text-sm text-text-muted">
                      {c.issuedBy || 'Université'} · {formatDateFr(c.createdAt || c.issuedAt)}
                    </p>
                  </div>
                  {c.fileUrl && (
                    <a
                      href={c.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 text-sm font-bold text-engine hover:underline"
                    >
                      PDF
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
