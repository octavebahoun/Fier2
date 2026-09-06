import { useCallback, useEffect, useState } from 'react'
import { GraduationCap, Loader2, Plus, Users } from 'lucide-react'
import api from '../../services/api.js'
import PageHeader from '../../components/ui/PageHeader.jsx'
import SectionCard from '../../components/ui/SectionCard.jsx'
import StatePanel from '../../components/ui/StatePanel.jsx'
import { useToast } from '../../components/ui/Toast.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { champ, etiquette, boutonPrimaire, nomComplet } from '../espace-cite/shared.jsx'

/**
 * Créer une formation — l'écran qui manquait.
 *
 * `POST /formations` existait depuis le début, ouvert au CHERCHEUR, et rien ne
 * l'appelait : la capacité `formation:create` figurait au carnet de dette. Le
 * catalogue de l'Académie ne pouvait grandir que par la base de données.
 *
 * Le formateur est pré-rempli avec le nom du compte — c'est le cas courant —
 * mais reste modifiable : un chercheur peut inscrire au catalogue la formation
 * d'un intervenant extérieur.
 */

export default function CreationFormation() {
  const { notify } = useToast()
  const { user } = useAuth()

  const [form, setForm] = useState({ title: '', instructor: '', capacity: '20' })
  const [envoi, setEnvoi] = useState(false)

  const [formations, setFormations] = useState([])
  const [chargement, setChargement] = useState(true)
  const [error, setError] = useState(null)

  // Le nom du compte arrive après le chargement de la session : on ne le pose
  // qu'une fois, et jamais par-dessus une saisie en cours.
  useEffect(() => {
    const propose = nomComplet(user)
    setForm((f) => (f.instructor ? f : { ...f, instructor: propose === 'Membre' ? '' : propose }))
  }, [user])

  const charger = useCallback(async () => {
    setChargement(true)
    setError(null)
    try {
      const res = await api.workshops.getAll()
      if (!res?.success) throw new Error(res?.message)
      setFormations(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      setFormations([])
      setError(err?.serverMessage || err?.message || "Le catalogue n'a pas pu être chargé.")
    } finally {
      setChargement(false)
    }
  }, [])

  useEffect(() => { charger() }, [charger])

  const creer = async (e) => {
    e.preventDefault()
    if (envoi) return
    if (!form.title.trim()) return notify('Donnez un titre à la formation.', 'warning')
    if (!form.instructor.trim()) return notify('Indiquez qui anime la formation.', 'warning')
    const places = Number(form.capacity)
    if (!Number.isInteger(places) || places < 1) {
      return notify('La capacité doit être un nombre de places d’au moins 1.', 'warning')
    }

    setEnvoi(true)
    try {
      const res = await api.workshops.create({
        title: form.title.trim(),
        instructor: form.instructor.trim(),
        capacity: places,
      })
      if (!res?.success) throw new Error(res?.message)
      notify(`« ${form.title.trim()} » est au catalogue.`, 'success')
      setForm({ title: '', instructor: form.instructor, capacity: '20' })
      await charger()
    } catch (err) {
      notify(err?.serverMessage || err?.message || "La formation n'a pas pu être créée.", 'error')
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <PageHeader
        tag="Recherche & R&D"
        icon={GraduationCap}
        title="Créer une formation"
        description="Ouvrez une session de l’Académie : elle apparaîtra au catalogue et recevra les inscriptions."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[24rem_1fr]">
        <SectionCard icon={Plus} title="Nouvelle formation" subtitle="Ce qui sera au catalogue">
          <form onSubmit={creer} className="flex flex-col gap-4">
            <div>
              <label className={etiquette} htmlFor="fo-titre">Intitulé</label>
              <input
                id="fo-titre"
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex : initiation à l’analyse de données avec Python"
                className={champ}
              />
            </div>

            <div>
              <label className={etiquette} htmlFor="fo-formateur">Formateur</label>
              <input
                id="fo-formateur"
                type="text"
                required
                value={form.instructor}
                onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                placeholder="Nom de la personne qui anime"
                className={champ}
              />
            </div>

            <div>
              <label className={etiquette} htmlFor="fo-capacite">Nombre de places</label>
              <input
                id="fo-capacite"
                type="number"
                min="1"
                step="1"
                required
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                className={champ}
              />
              <p className="mt-1 text-sm text-text-muted">
                Une fois les places prises, les suivants passent en liste d’attente.
              </p>
            </div>

            <button type="submit" disabled={envoi} className={boutonPrimaire}>
              {envoi
                ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                : <Plus className="h-4 w-4" aria-hidden="true" />}
              {envoi ? 'Création…' : 'Ajouter au catalogue'}
            </button>
          </form>
        </SectionCard>

        <SectionCard
          icon={GraduationCap}
          title="Catalogue"
          subtitle={formations.length ? `${formations.length} formation${formations.length > 1 ? 's' : ''}` : undefined}
          accent="var(--color-ember)"
        >
          {chargement ? (
            <StatePanel state="loading" />
          ) : error ? (
            <StatePanel state="error" message={error} onRetry={charger} />
          ) : formations.length === 0 ? (
            <StatePanel state="empty" icon={GraduationCap} message="Le catalogue est vide pour l’instant." />
          ) : (
            <ul className="flex flex-col gap-2">
              {formations.map((f) => (
                <li key={f.id} className="border border-border-strong bg-bg-primary p-3">
                  <p className="text-sm font-semibold leading-snug text-text-primary">{f.title}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-text-muted">
                    <span>{f.instructor || 'Formateur à préciser'}</span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" aria-hidden="true" />
                      {f.placesLeft} place{f.placesLeft > 1 ? 's' : ''} sur {f.totalPlaces}
                    </span>
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
