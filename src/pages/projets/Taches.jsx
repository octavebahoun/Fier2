import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ListChecks, Loader2, Plus, Trash2 } from 'lucide-react'
import api from '../../services/api.js'
import PageHeader from '../../components/ui/PageHeader.jsx'
import SectionCard from '../../components/ui/SectionCard.jsx'
import StatePanel from '../../components/ui/StatePanel.jsx'
import { useToast } from '../../components/ui/Toast.jsx'
import { champ, etiquette, boutonPrimaire, nomComplet } from '../espace-cite/shared.jsx'

/**
 * Tâches de projet — l'écran du Chef de projet.
 *
 * Ce rôle avait des droits réels côté serveur (`POST /tasks`, `PUT /tasks/:id`,
 * `PATCH /tasks/:id/assign`, `.../priority`, `DELETE /tasks/:id`) et aucune
 * interface : connecté, il voyait le menu d'un étudiant. C'est le dernier rôle
 * dont un bêta-testeur pouvait dire qu'il ne comprenait pas à quoi il sert.
 *
 * Une intention : répartir le travail d'un projet.
 */

const STATUTS = [
  { valeur: 'TODO', label: 'À faire', className: 'border-warning text-warning' },
  { valeur: 'IN_PROGRESS', label: 'En cours', className: 'border-engine text-engine' },
  { valeur: 'DONE', label: 'Terminée', className: 'border-success text-success' },
]

const PRIORITES = [
  { valeur: 'LOW', label: 'Basse' },
  { valeur: 'MEDIUM', label: 'Moyenne' },
  { valeur: 'HIGH', label: 'Haute' },
]

const libelle = (liste, valeur) => liste.find((x) => x.valeur === valeur)?.label || valeur || '—'

export default function Taches() {
  const { notify } = useToast()
  const [params, setParams] = useSearchParams()
  const projectId = params.get('projet') || ''

  const [projects, setProjects] = useState([])
  const [projectsError, setProjectsError] = useState(null)
  const [projectsLoading, setProjectsLoading] = useState(true)

  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [members, setMembers] = useState([])
  const [membersError, setMembersError] = useState(null)
  const [form, setForm] = useState({ title: '', priority: 'MEDIUM', assignedTo: '' })
  const [busy, setBusy] = useState(false)
  const [busyTask, setBusyTask] = useState(null)

  useEffect(() => {
    let actif = true
    ;(async () => {
      setProjectsLoading(true)
      setProjectsError(null)
      try {
        const res = await api.projects.getAll({ diriges: true })
        if (!actif) return
        if (!res?.success) throw new Error(res?.message)
        setProjects(res.data || [])
      } catch (err) {
        if (!actif) return
        setProjects([])
        setProjectsError(err?.serverMessage || err?.message || "Les projets n'ont pas pu être chargés.")
      } finally {
        if (actif) setProjectsLoading(false)
      }
    })()
    return () => { actif = false }
  }, [])

  // L'annuaire sert à nommer l'affectataire ; son absence n'empêche pas de
  // créer une tâche, elle empêche seulement de la confier à quelqu'un.
  useEffect(() => {
    let actif = true
    ;(async () => {
      try {
        const res = await api.members.list({ limit: 200 })
        if (!actif) return
        if (!res?.success) throw new Error(res?.message)
        setMembers(res.data || [])
      } catch (err) {
        if (!actif) return
        setMembers([])
        setMembersError(err?.serverMessage || err?.message || "L’annuaire n’a pas pu être lu.")
      }
    })()
    return () => { actif = false }
  }, [])

  const loadTasks = useCallback(async () => {
    if (!projectId) { setTasks([]); return }
    setLoading(true)
    setError(null)
    try {
      const res = await api.tasks.getByProject(projectId)
      if (!res?.success) throw new Error(res?.message)
      setTasks(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      setTasks([])
      setError(err?.serverMessage || err?.message || "Les tâches n'ont pas pu être chargées.")
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => { loadTasks() }, [loadTasks])

  const choisirProjet = (id) => {
    setParams((c) => {
      const p = new URLSearchParams(c)
      if (id) p.set('projet', id); else p.delete('projet')
      return p
    })
  }

  /**
   * `assignedTo` est une chaîne libre côté serveur, sans relation. On y écrit
   * l'identifiant du membre et on le résout à l'affichage ; une valeur qui ne
   * correspond à personne est montrée telle quelle plutôt que masquée.
   */
  const affecteA = useCallback((valeur) => {
    if (!valeur) return null
    const m = members.find((x) => String(x.id) === String(valeur))
    return m ? nomComplet(m) : valeur
  }, [members])

  const creer = async (e) => {
    e.preventDefault()
    if (busy) return
    if (!form.title.trim()) return notify('Donnez un intitulé à la tâche.', 'warning')
    setBusy(true)
    try {
      const res = await api.tasks.create({
        projectId,
        title: form.title.trim(),
        priority: form.priority,
        ...(form.assignedTo ? { assignedTo: form.assignedTo } : {}),
      })
      if (!res?.success) throw new Error(res?.message)
      notify(`Tâche « ${form.title.trim()} » créée.`, 'success')
      setForm({ title: '', priority: 'MEDIUM', assignedTo: '' })
      await loadTasks()
    } catch (err) {
      notify(err?.serverMessage || err?.message || "La tâche n'a pas pu être créée.", 'error')
    } finally {
      setBusy(false)
    }
  }

  /** Chaque modification relit la liste : l'écran n'affiche que ce qui a pris. */
  const modifier = async (task, appel, message) => {
    if (busyTask) return
    setBusyTask(task.id)
    try {
      const res = await appel()
      if (!res?.success) throw new Error(res?.message)
      notify(message, 'success')
      await loadTasks()
    } catch (err) {
      notify(err?.serverMessage || err?.message || "La modification n'a pas pu être enregistrée.", 'error')
    } finally {
      setBusyTask(null)
    }
  }

  const supprimer = (task) => {
    if (!window.confirm(`Supprimer définitivement la tâche « ${task.title} » ?`)) return
    modifier(task, () => api.tasks.delete(task.id), `Tâche « ${task.title} » supprimée.`)
  }

  const parStatut = useMemo(
    () => STATUTS.map((s) => ({ ...s, taches: tasks.filter((t) => (t.status || 'TODO') === s.valeur) })),
    [tasks],
  )

  const projet = projects.find((p) => String(p.id) === String(projectId))

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <PageHeader
        tag="Recherche & R&D"
        icon={ListChecks}
        title="Tâches de projet"
        description="Répartissez le travail d’un projet et suivez son avancement."
      />

      <SectionCard icon={ListChecks} title="Projet" subtitle="Choisissez le projet à piloter">
        {projectsLoading ? (
          <StatePanel state="loading" />
        ) : projectsError ? (
          <StatePanel state="error" message={projectsError} />
        ) : projects.length === 0 ? (
          <StatePanel state="empty" icon={ListChecks} message="Vous ne dirigez aucun projet. Le tableau des tâches suit le projet : il s’ouvre à son porteur et au responsable du club qui le porte." />
        ) : (
          <div>
            <label className={etiquette} htmlFor="taches-projet">Projet</label>
            <select
              id="taches-projet"
              value={projectId}
              onChange={(e) => choisirProjet(e.target.value)}
              className={`${champ} cursor-pointer`}
            >
              <option value="">Sélectionner un projet…</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </SectionCard>

      {projectId && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[20rem_1fr]">
          <SectionCard icon={Plus} title="Nouvelle tâche" subtitle={projet?.title}>
            <form onSubmit={creer} className="flex flex-col gap-4">
              <div>
                <label className={etiquette} htmlFor="tache-titre">Intitulé</label>
                <input
                  id="tache-titre"
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex : rédiger le protocole d’essai"
                  className={champ}
                />
              </div>
              <div>
                <label className={etiquette} htmlFor="tache-priorite">Priorité</label>
                <select
                  id="tache-priorite"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className={`${champ} cursor-pointer`}
                >
                  {PRIORITES.map((p) => <option key={p.valeur} value={p.valeur}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className={etiquette} htmlFor="tache-affectation">Confier à</label>
                <select
                  id="tache-affectation"
                  value={form.assignedTo}
                  onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                  className={`${champ} cursor-pointer`}
                >
                  <option value="">Personne pour l’instant</option>
                  {members.map((m) => <option key={m.id} value={m.id}>{nomComplet(m)}</option>)}
                </select>
                {membersError ? (
                  <p className="mt-1 text-sm text-danger">
                    {membersError} La tâche sera créée sans affectation.
                  </p>
                ) : members.length === 0 ? (
                  <p className="mt-1 text-sm text-text-muted">
                    Aucun membre à qui confier une tâche pour l’instant.
                  </p>
                ) : null}
              </div>
              <button type="submit" disabled={busy} className={boutonPrimaire}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
                {busy ? 'Création…' : 'Créer la tâche'}
              </button>
            </form>
          </SectionCard>

          <SectionCard
            icon={ListChecks}
            title="Tâches"
            subtitle={tasks.length ? `${tasks.length} au total` : undefined}
            accent="var(--color-ember)"
          >
            {loading ? (
              <StatePanel state="loading" />
            ) : error ? (
              <StatePanel state="error" message={error} onRetry={loadTasks} />
            ) : tasks.length === 0 ? (
              <StatePanel state="empty" icon={ListChecks} message="Ce projet n’a encore aucune tâche." />
            ) : (
              <div className="flex flex-col gap-6">
                {parStatut.map((colonne) => (
                  <section key={colonne.valeur}>
                    <h3 className="eyebrow mb-2">
                      {colonne.label} · {colonne.taches.length}
                    </h3>
                    {colonne.taches.length === 0 ? (
                      <p className="text-sm text-text-muted">Aucune tâche à ce stade.</p>
                    ) : (
                      <ul className="flex flex-col gap-2">
                        {colonne.taches.map((t) => (
                          <li key={t.id} className="border border-border-strong bg-bg-primary p-3">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <p className="min-w-0 flex-1 text-sm font-semibold text-text-primary">{t.title}</p>
                              <span className={`shrink-0 border px-2 py-0.5 text-xs font-extrabold uppercase tracking-wider ${colonne.className}`}>
                                {libelle(PRIORITES, t.priority)}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-text-muted">
                              {affecteA(t.assignedTo)
                                ? `Confiée à ${affecteA(t.assignedTo)}`
                                : 'Non confiée'}
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <label className="sr-only" htmlFor={`statut-${t.id}`}>Statut de « {t.title} »</label>
                              <select
                                id={`statut-${t.id}`}
                                value={t.status || 'TODO'}
                                disabled={busyTask === t.id}
                                onChange={(e) => modifier(t, () => api.tasks.update(t.id, { status: e.target.value }), `« ${t.title} » : ${libelle(STATUTS, e.target.value).toLowerCase()}.`)}
                                className="min-h-11 cursor-pointer border border-border-strong bg-bg-secondary px-2 text-sm text-text-primary disabled:opacity-50"
                              >
                                {STATUTS.map((s) => <option key={s.valeur} value={s.valeur}>{s.label}</option>)}
                              </select>

                              <label className="sr-only" htmlFor={`priorite-${t.id}`}>Priorité de « {t.title} »</label>
                              <select
                                id={`priorite-${t.id}`}
                                value={t.priority || 'MEDIUM'}
                                disabled={busyTask === t.id}
                                onChange={(e) => modifier(t, () => api.tasks.setPriority(t.id, e.target.value), `« ${t.title} » : priorité ${libelle(PRIORITES, e.target.value).toLowerCase()}.`)}
                                className="min-h-11 cursor-pointer border border-border-strong bg-bg-secondary px-2 text-sm text-text-primary disabled:opacity-50"
                              >
                                {PRIORITES.map((p) => <option key={p.valeur} value={p.valeur}>{p.label}</option>)}
                              </select>

                              <label className="sr-only" htmlFor={`affectation-${t.id}`}>Affectation de « {t.title} »</label>
                              <select
                                id={`affectation-${t.id}`}
                                value={members.some((m) => String(m.id) === String(t.assignedTo)) ? String(t.assignedTo) : ''}
                                disabled={busyTask === t.id || members.length === 0}
                                onChange={(e) => modifier(t, () => api.tasks.assign(t.id, e.target.value), `« ${t.title} » confiée.`)}
                                className="min-h-11 cursor-pointer border border-border-strong bg-bg-secondary px-2 text-sm text-text-primary disabled:opacity-50"
                              >
                                <option value="">Non confiée</option>
                                {members.map((m) => <option key={m.id} value={m.id}>{nomComplet(m)}</option>)}
                              </select>

                              <button
                                type="button"
                                onClick={() => supprimer(t)}
                                disabled={busyTask === t.id}
                                className="ml-auto inline-flex min-h-11 cursor-pointer items-center gap-1.5 border border-danger px-3 text-sm font-semibold text-danger transition-colors hover:bg-danger-wash disabled:opacity-50"
                              >
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                                Supprimer
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      )}
    </div>
  )
}
