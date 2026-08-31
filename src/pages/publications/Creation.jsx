import { useCallback, useEffect, useState } from 'react'
import { BookOpen, FilePlus2, Loader2 } from 'lucide-react'
import api from '../../services/api.js'
import PageHeader from '../../components/ui/PageHeader.jsx'
import SectionCard from '../../components/ui/SectionCard.jsx'
import StatePanel from '../../components/ui/StatePanel.jsx'
import { useToast } from '../../components/ui/Toast.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { champ, etiquette, boutonPrimaire, formatDateFr } from '../espace-cite/shared.jsx'

/**
 * Déposer une publication — l'écran qui manquait.
 *
 * `POST /publications` existait depuis le début, réservé au CHERCHEUR, et
 * aucune interface ne l'appelait : la capacité `publication:create` figurait au
 * carnet de dette, et aucun écran ne lisait non plus `GET /publications`. Le
 * dépôt scientifique de la plateforme était donc entièrement invisible.
 *
 * ── Sur la catégorie ──────────────────────────────────────────────────────
 * Le serveur stocke une chaîne libre, sans vocabulaire imposé. La liste
 * proposée ici est une SUGGESTION (`datalist`) : elle guide sans interdire, et
 * n'invente pas une contrainte que le modèle ne porte pas.
 */

const CATEGORIES = [
  'Article de recherche',
  'Revue de littérature',
  'Note technique',
  'Rapport d’étude',
  'Mémoire',
  'Thèse',
]

const VIDE = { title: '', category: '', content: '', projectId: '', clubId: '' }

export default function CreationPublication() {
  const { notify } = useToast()
  const { user } = useAuth()

  const [form, setForm] = useState(VIDE)
  const [envoi, setEnvoi] = useState(false)

  const [projets, setProjets] = useState([])
  const [clubs, setClubs] = useState([])
  const [rattachementsError, setRattachementsError] = useState(null)

  const [publications, setPublications] = useState([])
  const [chargement, setChargement] = useState(true)
  const [error, setError] = useState(null)

  // Ce à quoi une publication peut se rattacher : un projet dirigé, un club.
  useEffect(() => {
    let actif = true
    ;(async () => {
      try {
        const [pr, cl] = await Promise.all([
          api.projects.getAll({ diriges: true }),
          api.clubs.getAll(),
        ])
        if (!actif) return
        setProjets(Array.isArray(pr?.data) ? pr.data : [])
        setClubs(Array.isArray(cl?.data) ? cl.data : [])
      } catch (err) {
        if (!actif) return
        setProjets([])
        setClubs([])
        setRattachementsError(
          err?.serverMessage || err?.message || "Les projets et clubs n'ont pas pu être lus.",
        )
      }
    })()
    return () => { actif = false }
  }, [])

  const charger = useCallback(async () => {
    if (!user?.id) return
    setChargement(true)
    setError(null)
    try {
      const res = await api.publications.getAll({ authorId: user.id })
      if (!res?.success) throw new Error(res?.message)
      setPublications(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      setPublications([])
      setError(err?.serverMessage || err?.message || "Vos publications n'ont pas pu être chargées.")
    } finally {
      setChargement(false)
    }
  }, [user?.id])

  useEffect(() => { charger() }, [charger])

  const deposer = async (e) => {
    e.preventDefault()
    if (envoi) return
    if (!form.title.trim()) return notify('Donnez un titre à la publication.', 'warning')
    if (!form.category.trim()) return notify('Indiquez une catégorie.', 'warning')
    if (!form.content.trim()) return notify('Une publication sans contenu ne se dépose pas.', 'warning')

    setEnvoi(true)
    try {
      const res = await api.publications.create({
        title: form.title.trim(),
        category: form.category.trim(),
        content: form.content.trim(),
        projectId: form.projectId || undefined,
        clubId: form.clubId || undefined,
      })
      if (!res?.success) throw new Error(res?.message)
      notify(`« ${form.title.trim()} » est déposée.`, 'success')
      setForm(VIDE)
      await charger()
    } catch (err) {
      notify(err?.serverMessage || err?.message || "La publication n'a pas pu être déposée.", 'error')
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <PageHeader
        tag="Recherche & R&D"
        icon={FilePlus2}
        title="Déposer une publication"
        description="Versez un article, une note ou un rapport au fonds scientifique de la FIERI."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_22rem]">
        <SectionCard icon={FilePlus2} title="Nouvelle publication" subtitle="Ce qui sera déposé">
          <form onSubmit={deposer} className="flex flex-col gap-4">
            <div>
              <label className={etiquette} htmlFor="pu-titre">Titre</label>
              <input
                id="pu-titre"
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex : mesure de la turbidité par capteur optique"
                className={champ}
              />
            </div>

            <div>
              <label className={etiquette} htmlFor="pu-categorie">Catégorie</label>
              <input
                id="pu-categorie"
                type="text"
                required
                list="pu-categories"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Article de recherche"
                className={champ}
              />
              <datalist id="pu-categories">
                {CATEGORIES.map((c) => <option key={c} value={c} />)}
              </datalist>
              <p className="mt-1 text-sm text-text-muted">
                Choisissez dans la liste, ou saisissez la vôtre.
              </p>
            </div>

            <div>
              <label className={etiquette} htmlFor="pu-contenu">Contenu</label>
              <textarea
                id="pu-contenu"
                rows={12}
                required
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Le texte de la publication : résumé, méthode, résultats, références."
                className={`${champ} min-h-64 py-2 leading-relaxed`}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={etiquette} htmlFor="pu-projet">Projet lié (facultatif)</label>
                <select
                  id="pu-projet"
                  value={form.projectId}
                  onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                  className={`${champ} cursor-pointer`}
                >
                  <option value="">Aucun projet</option>
                  {projets.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>

              <div>
                <label className={etiquette} htmlFor="pu-club">Club lié (facultatif)</label>
                <select
                  id="pu-club"
                  value={form.clubId}
                  onChange={(e) => setForm({ ...form, clubId: e.target.value })}
                  className={`${champ} cursor-pointer`}
                >
                  <option value="">Aucun club</option>
                  {clubs.map((c) => <option key={c.id} value={c.id}>{c.title || c.name}</option>)}
                </select>
              </div>
            </div>

            {rattachementsError && (
              <p className="text-sm text-danger">
                {rattachementsError} La publication peut être déposée sans rattachement.
              </p>
            )}

            <button type="submit" disabled={envoi} className={boutonPrimaire}>
              {envoi
                ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                : <FilePlus2 className="h-4 w-4" aria-hidden="true" />}
              {envoi ? 'Dépôt…' : 'Déposer la publication'}
            </button>
          </form>
        </SectionCard>

        <SectionCard
          icon={BookOpen}
          title="Vos dépôts"
          subtitle={publications.length ? `${publications.length} publication${publications.length > 1 ? 's' : ''}` : undefined}
          accent="var(--color-ember)"
        >
          {chargement ? (
            <StatePanel state="loading" />
          ) : error ? (
            <StatePanel state="error" message={error} onRetry={charger} />
          ) : publications.length === 0 ? (
            <StatePanel state="empty" icon={BookOpen} message="Vous n’avez encore rien déposé." />
          ) : (
            <ul className="flex flex-col gap-2">
              {publications.map((p) => (
                <li key={p.id} className="border border-border-strong bg-bg-primary p-3">
                  <p className="text-sm font-semibold leading-snug text-text-primary">{p.title}</p>
                  <p className="mt-1 text-sm text-text-muted">
                    {p.category || 'Sans catégorie'} · {formatDateFr(p.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
