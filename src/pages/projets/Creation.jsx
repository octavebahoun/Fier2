import { useCallback, useEffect, useState } from 'react'
import { FolderGit2, FolderPlus, Loader2 } from 'lucide-react'
import api from '../../services/api.js'
import PageHeader from '../../components/ui/PageHeader.jsx'
import SectionCard from '../../components/ui/SectionCard.jsx'
import StatePanel from '../../components/ui/StatePanel.jsx'
import { useToast } from '../../components/ui/Toast.jsx'
import { champ, etiquette, boutonPrimaire, statusBadge } from '../espace-cite/shared.jsx'

/**
 * Créer un projet R&D — l'écran qui manquait.
 *
 * `POST /projects` existait depuis le début, ouvert au CHERCHEUR et au
 * RESPONSABLE, et rien ne l'appelait : la capacité `project:create` figurait au
 * carnet de dette. Un chercheur devait passer par l'API à la main pour ouvrir
 * un projet sur la plateforme censée les héberger.
 *
 * ── Sur le club ───────────────────────────────────────────────────────────
 * Le rattachement est facultatif, mais le serveur vérifie l'appartenance
 * (`ProjectClubMemberGuard`) : on ne peut pas déposer un projet dans le club
 * d'un autre. Le client ne connaît pas la liste des adhésions — il propose donc
 * tous les clubs et laisse le serveur trancher, plutôt que de masquer par
 * précaution des clubs dont la personne fait peut-être partie.
 */

const STATUTS = ['Actif', 'En Phase de R&D', 'Terminé']

const VIDE = { title: '', summary: '', description: '', status: 'Actif', technologies: '', clubId: '' }

export default function CreationProjet({ navigate }) {
  const { notify } = useToast()

  const [form, setForm] = useState(VIDE)
  const [envoi, setEnvoi] = useState(false)

  const [clubs, setClubs] = useState([])
  const [clubsError, setClubsError] = useState(null)

  const [projets, setProjets] = useState([])
  const [chargement, setChargement] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let actif = true
    ;(async () => {
      try {
        const res = await api.clubs.getAll()
        if (!actif) return
        if (!res?.success) throw new Error(res?.message)
        setClubs(Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        if (!actif) return
        setClubs([])
        setClubsError(err?.serverMessage || err?.message || "La liste des clubs n'a pas pu être lue.")
      }
    })()
    return () => { actif = false }
  }, [])

  /** Les projets sur lesquels ce compte a autorité : ce qu'il vient d'ouvrir en fait partie. */
  const charger = useCallback(async () => {
    setChargement(true)
    setError(null)
    try {
      const res = await api.projects.getAll({ diriges: true })
      if (!res?.success) throw new Error(res?.message)
      setProjets(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      setProjets([])
      setError(err?.serverMessage || err?.message || "Vos projets n'ont pas pu être chargés.")
    } finally {
      setChargement(false)
    }
  }, [])

  useEffect(() => { charger() }, [charger])

  const creer = async (e) => {
    e.preventDefault()
    if (envoi) return
    if (!form.title.trim()) return notify('Donnez un titre au projet.', 'warning')
    if (!form.summary.trim()) return notify('Le résumé est ce qu’on lira en premier : il est obligatoire.', 'warning')

    setEnvoi(true)
    try {
      const res = await api.projects.create({
        title: form.title.trim(),
        summary: form.summary.trim(),
        ...(form.description.trim() ? { description: form.description.trim() } : {}),
        status: form.status,
        technologies: form.technologies
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        ...(form.clubId ? { clubId: form.clubId } : {}),
      })
      if (!res?.success) throw new Error(res?.message)
      notify(`« ${form.title.trim()} » est ouvert.`, 'success')
      setForm(VIDE)
      await charger()
    } catch (err) {
      notify(err?.serverMessage || err?.message || "Le projet n'a pas pu être créé.", 'error')
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <PageHeader
        tag="Recherche & R&D"
        icon={FolderPlus}
        title="Créer un projet R&D"
        description="Ouvrez un projet de recherche : il apparaîtra dans le catalogue public et pourra recevoir une équipe, des tâches et des soutiens."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[26rem_1fr]">
        <SectionCard icon={FolderPlus} title="Nouveau projet" subtitle="Ce qui sera publié">
          <form onSubmit={creer} className="flex flex-col gap-4">
            <div>
              <label className={etiquette} htmlFor="pr-titre">Titre</label>
              <input
                id="pr-titre"
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex : capteur de qualité de l’air à bas coût"
                className={champ}
              />
            </div>

            <div>
              <label className={etiquette} htmlFor="pr-resume">Résumé</label>
              <textarea
                id="pr-resume"
                rows={3}
                required
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                placeholder="Une ou deux phrases : le problème traité et l’approche."
                className={`${champ} min-h-24 py-2`}
              />
            </div>

            <div>
              <label className={etiquette} htmlFor="pr-description">Description détaillée (facultatif)</label>
              <textarea
                id="pr-description"
                rows={5}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Contexte, méthode, résultats attendus, jalons."
                className={`${champ} min-h-32 py-2`}
              />
            </div>

            <div>
              <label className={etiquette} htmlFor="pr-statut">État d’avancement</label>
              <select
                id="pr-statut"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className={`${champ} cursor-pointer`}
              >
                {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className={etiquette} htmlFor="pr-technos">Technologies (facultatif)</label>
              <input
                id="pr-technos"
                type="text"
                value={form.technologies}
                onChange={(e) => setForm({ ...form, technologies: e.target.value })}
                placeholder="Python, LoRaWAN, impression 3D"
                className={champ}
              />
              <p className="mt-1 text-sm text-text-muted">Séparez-les par des virgules.</p>
            </div>

            <div>
              <label className={etiquette} htmlFor="pr-club">Club porteur (facultatif)</label>
              <select
                id="pr-club"
                value={form.clubId}
                onChange={(e) => setForm({ ...form, clubId: e.target.value })}
                className={`${champ} cursor-pointer`}
              >
                <option value="">Aucun club en particulier</option>
                {clubs.map((c) => (
                  <option key={c.id} value={c.id}>{c.title || c.name}</option>
                ))}
              </select>
              <p className="mt-1 text-sm text-text-muted">
                {clubsError
                  ? `${clubsError} Le projet sera créé sans club.`
                  : 'Vous devez être membre du club choisi : le serveur le vérifie.'}
              </p>
            </div>

            <button type="submit" disabled={envoi} className={boutonPrimaire}>
              {envoi
                ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                : <FolderPlus className="h-4 w-4" aria-hidden="true" />}
              {envoi ? 'Création…' : 'Ouvrir le projet'}
            </button>
          </form>
        </SectionCard>

        <SectionCard
          icon={FolderGit2}
          title="Vos projets"
          subtitle={projets.length ? `${projets.length} projet${projets.length > 1 ? 's' : ''}` : undefined}
          accent="var(--color-ember)"
        >
          {chargement ? (
            <StatePanel state="loading" />
          ) : error ? (
            <StatePanel state="error" message={error} onRetry={charger} />
          ) : projets.length === 0 ? (
            <StatePanel state="empty" icon={FolderGit2} message="Vous ne dirigez encore aucun projet." />
          ) : (
            <ul className="flex flex-col gap-2">
              {projets.map((p) => {
                const badge = statusBadge(p.status)
                return (
                  <li key={p.id} className="border border-border-strong bg-bg-primary p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => navigate('project-detail', { projectId: p.id })}
                        className="min-w-0 flex-1 cursor-pointer text-left text-sm font-semibold text-text-primary transition-colors hover:text-engine"
                      >
                        {p.title}
                      </button>
                      <span className={`shrink-0 border px-2 py-0.5 text-xs font-bold ${badge.className}`}>
                        {p.status || badge.label}
                      </span>
                    </div>
                    {p.summary && (
                      <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{p.summary}</p>
                    )}
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
