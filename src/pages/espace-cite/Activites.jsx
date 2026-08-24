import { useEffect, useState } from 'react'
import { ClipboardList, Send, Loader2 } from 'lucide-react'
import api from '../../services/api.js'
import PageHeader from '../../components/ui/PageHeader.jsx'
import SectionCard from '../../components/ui/SectionCard.jsx'
import StatePanel from '../../components/ui/StatePanel.jsx'
import { useToast } from '../../components/ui/Toast.jsx'
import { useClubSpace, shouldShowClubPicker } from './useClubSpace.js'
import { ClubPicker, champ, etiquette, boutonPrimaire, statusBadge, nomComplet, formatDateFr } from './shared.jsx'

/**
 * Activités — attribuer une tâche, et voir celles déjà attribuées.
 *
 * Le formulaire et la liste qu'il alimente sont sur le même écran : c'est une
 * seule intention, avec sa conséquence visible. Ce n'est pas le cas d'un
 * formulaire de rapport posé à côté d'un annuaire.
 */
export default function Activites() {
  const { notify } = useToast()
  const { clubs, clubsLoading, clubId, club, setClubId, canSupervise } = useClubSpace()

  const [members, setMembers] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', memberId: '', dueDate: '' })

  useEffect(() => {
    if (!clubId) { setMembers([]); return }
    let actif = true
    ;(async () => {
      try {
        const res = await api.clubSpace.membersList(clubId)
        if (actif) setMembers(res?.success && res.data?.members ? res.data.members : [])
      } catch {
        if (actif) setMembers([])
      }
    })()
    return () => { actif = false }
  }, [clubId])

  const loadActivities = async () => {
    setLoading(true)
    try {
      const res = await api.clubSpace.myDashboard()
      const data = res?.data ?? res ?? {}
      setActivities(Array.isArray(data.assignedActivities) ? data.assignedActivities : [])
    } catch {
      setActivities([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadActivities() }, [clubId])

  const submit = async (e) => {
    e.preventDefault()
    if (busy) return
    if (!form.title.trim()) return notify("Donnez un titre à l'activité.", 'warning')
    if (!form.memberId) return notify('Choisissez le membre à qui elle est confiée.', 'warning')
    setBusy(true)
    try {
      const res = await api.clubSpace.createAssignedActivity(clubId, {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        memberId: Number(form.memberId),
        dueDate: form.dueDate || undefined,
      })
      if (!res?.success) throw new Error(res?.message)
      const destinataire = members.find((m) => String(m.memberId ?? m.id) === String(form.memberId))
      notify(`Activité confiée à ${nomComplet(destinataire)}.`, 'success')
      setForm({ title: '', description: '', memberId: '', dueDate: '' })
      await loadActivities()
    } catch (err) {
      notify(err?.serverMessage || err?.message || "L'activité n'a pas pu être créée.", 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <PageHeader
        tag="Espace CITE"
        icon={ClipboardList}
        title="Activités du club"
        description={`Confier une tâche à un membre de ${club?.name || 'votre club'} et suivre son avancement.`}
      >
        {shouldShowClubPicker({ canSupervise, clubs }) && (
          <div className="mt-4">
            <ClubPicker clubs={clubs} clubId={clubId} onChange={setClubId} loading={clubsLoading} />
          </div>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard icon={Send} title="Confier une activité" subtitle="Elle apparaîtra dans l’espace du membre">
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
              <label className={etiquette} htmlFor="activite-titre">Titre</label>
              <input
                id="activite-titre"
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex : Synthèse du livre blanc"
                className={champ}
              />
            </div>

            <div>
              <label className={etiquette} htmlFor="activite-membre">Confiée à</label>
              <select
                id="activite-membre"
                required
                value={form.memberId}
                onChange={(e) => setForm({ ...form, memberId: e.target.value })}
                className={`${champ} cursor-pointer`}
              >
                <option value="">Choisir un membre…</option>
                {members.map((m) => (
                  <option key={m.memberId || m.id} value={m.memberId || m.id}>{nomComplet(m)}</option>
                ))}
              </select>
              {members.length === 0 && (
                <p className="mt-1 text-sm text-text-muted">
                  Ce club n’a pas encore de membre à qui confier une activité.
                </p>
              )}
            </div>

            <div>
              <label className={etiquette} htmlFor="activite-echeance">Échéance</label>
              <input
                id="activite-echeance"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className={champ}
              />
              <p className="mt-1 text-sm text-text-muted">Facultatif.</p>
            </div>

            <div>
              <label className={etiquette} htmlFor="activite-description">Précisions</label>
              <textarea
                id="activite-description"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Ce qui est attendu, et pour quel usage."
                className={`${champ} min-h-24 py-2`}
              />
            </div>

            <button type="submit" disabled={busy || !clubId} className={boutonPrimaire}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
              {busy ? 'Envoi…' : "Confier l'activité"}
            </button>
          </form>
        </SectionCard>

        <SectionCard
          icon={ClipboardList}
          title="Activités en cours"
          subtitle={activities.length ? `${activities.length} attribuée${activities.length > 1 ? 's' : ''}` : undefined}
          accent="var(--color-ember)"
        >
          {loading ? (
            <StatePanel state="loading" />
          ) : activities.length === 0 ? (
            <StatePanel state="empty" icon={ClipboardList} message="Aucune activité attribuée pour le moment." />
          ) : (
            <ul className="flex max-h-[28rem] flex-col gap-2 overflow-y-auto">
              {activities.map((a) => {
                const badge = statusBadge(a.status)
                return (
                  <li key={a.id} className="border border-border-subtle bg-bg-primary px-3 py-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-semibold leading-snug text-text-primary">{a.title}</h3>
                      <span className={`shrink-0 border px-2 py-0.5 text-xs font-bold ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-text-muted">
                      {nomComplet(a.member)} · échéance {formatDateFr(a.dueDate)}
                    </p>
                  </li>
                )
              })}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
