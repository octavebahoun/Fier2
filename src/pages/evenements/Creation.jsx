import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarPlus, CalendarDays, Loader2, Radio, RadioTower, Video, MapPin } from 'lucide-react'
import api from '../../services/api.js'
import PageHeader from '../../components/ui/PageHeader.jsx'
import SectionCard from '../../components/ui/SectionCard.jsx'
import StatePanel from '../../components/ui/StatePanel.jsx'
import { useToast } from '../../components/ui/Toast.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { champ, etiquette, boutonPrimaire, formatDateFr } from '../espace-cite/shared.jsx'

/**
 * Créer un événement — l'écran qui manquait.
 *
 * `POST /events` et `PUT /events/:id` existaient côté serveur, ouverts au
 * RESPONSABLE et à l'ADMIN, et aucune interface ne les appelait : la capacité
 * `event:manage` figurait au carnet de dette du projet. Il fallait passer par
 * l'API à la main pour annoncer quoi que ce soit.
 *
 * ── Sur le direct ─────────────────────────────────────────────────────────
 * Le modèle porte deux champs distincts, et les confondre ferait clignoter un
 * badge « EN DIRECT » sur un webinaire prévu la semaine prochaine :
 *   • `streamUrl` — l'adresse de diffusion. Non vide = l'événement est en
 *     ligne. C'est une propriété de l'événement.
 *   • `isLive`    — la diffusion est en cours, maintenant. C'est un état, et
 *     il se bascule depuis la liste, au moment où l'on ouvre l'antenne.
 */

const FORMATS = [
  { id: 'presentiel', label: 'En présentiel', icon: MapPin, aide: 'Une rencontre physique, sans diffusion.' },
  { id: 'ligne', label: 'En ligne (webinaire)', icon: Video, aide: 'Diffusé à distance, avec un lien de connexion.' },
]

const VIDE = { title: '', description: '', date: '', endDate: '', format: 'presentiel', streamUrl: '', clubId: '' }

export default function CreationEvenement() {
  const { notify } = useToast()
  const { identity, isAdmin } = useAuth()

  const [form, setForm] = useState(VIDE)
  const [envoi, setEnvoi] = useState(false)

  const [clubs, setClubs] = useState([])
  const [clubsError, setClubsError] = useState(null)

  const [events, setEvents] = useState([])
  const [chargement, setChargement] = useState(true)
  const [error, setError] = useState(null)
  const [bascule, setBascule] = useState(null)

  const enLigne = form.format === 'ligne'

  // Les clubs que ce compte dirige. Un ADMIN les voit tous ; un responsable ne
  // se voit proposer que les siens — le serveur refuserait le reste.
  useEffect(() => {
    let actif = true
    ;(async () => {
      try {
        const res = await api.clubs.getAll()
        if (!actif) return
        if (!res?.success) throw new Error(res?.message)
        const tous = Array.isArray(res.data) ? res.data : []
        setClubs(
          isAdmin()
            ? tous
            : tous.filter((c) => identity.responsibleClubIds.includes(String(c.id))),
        )
      } catch (err) {
        if (!actif) return
        setClubs([])
        setClubsError(err?.serverMessage || err?.message || "La liste des clubs n'a pas pu être lue.")
      }
    })()
    return () => { actif = false }
  }, [identity, isAdmin])

  const charger = useCallback(async () => {
    setChargement(true)
    setError(null)
    try {
      const res = await api.events.getAll({ scope: 'upcoming' })
      if (!res?.success) throw new Error(res?.message)
      setEvents(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      setEvents([])
      setError(err?.serverMessage || err?.message || "Les événements n'ont pas pu être chargés.")
    } finally {
      setChargement(false)
    }
  }, [])

  useEffect(() => { charger() }, [charger])

  const creer = async (e) => {
    e.preventDefault()
    if (envoi) return
    if (!form.title.trim()) return notify('Donnez un titre à l’événement.', 'warning')
    if (!form.date) return notify('Indiquez la date et l’heure de début.', 'warning')
    if (enLigne && !form.streamUrl.trim()) {
      return notify('Un événement en ligne a besoin de son lien de diffusion.', 'warning')
    }
    if (form.endDate && new Date(form.endDate) <= new Date(form.date)) {
      return notify('La fin doit venir après le début.', 'warning')
    }

    setEnvoi(true)
    try {
      const res = await api.events.create({
        title: form.title.trim(),
        description: form.description.trim(),
        date: new Date(form.date).toISOString(),
        ...(form.endDate ? { endDate: new Date(form.endDate).toISOString() } : {}),
        // `isLive` reste faux : on annonce l'événement, on n'ouvre pas l'antenne.
        streamUrl: enLigne ? form.streamUrl.trim() : '',
        ...(form.clubId ? { clubId: form.clubId } : {}),
        ...(identity.universityId ? { universityId: identity.universityId } : {}),
      })
      if (!res?.success) throw new Error(res?.message)
      notify(`« ${form.title.trim()} » est annoncé.`, 'success')
      setForm(VIDE)
      await charger()
    } catch (err) {
      notify(err?.serverMessage || err?.message || "L'événement n'a pas pu être créé.", 'error')
    } finally {
      setEnvoi(false)
    }
  }

  /** Ouvrir ou fermer l'antenne d'un événement déjà annoncé. */
  const basculerDirect = async (ev) => {
    if (bascule) return
    setBascule(ev.id)
    try {
      const res = await api.events.update(ev.id, { isLive: !ev.isLive })
      if (!res?.success) throw new Error(res?.message)
      notify(
        ev.isLive ? `Diffusion de « ${ev.title} » arrêtée.` : `« ${ev.title} » est en direct.`,
        'success',
      )
      await charger()
    } catch (err) {
      notify(err?.serverMessage || err?.message || "Le direct n'a pas pu être basculé.", 'error')
    } finally {
      setBascule(null)
    }
  }

  const aVenir = useMemo(
    () => [...events].sort((a, b) => new Date(a.date) - new Date(b.date)),
    [events],
  )

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <PageHeader
        tag="Communauté"
        icon={CalendarPlus}
        title="Créer un événement"
        description="Annoncez une rencontre ou un webinaire, et ouvrez l’antenne le jour venu."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[24rem_1fr]">
        <SectionCard icon={CalendarPlus} title="Nouvel événement" subtitle="Ce qui sera annoncé">
          <form onSubmit={creer} className="flex flex-col gap-4">
            <div>
              <label className={etiquette} htmlFor="ev-titre">Titre</label>
              <input
                id="ev-titre"
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex : webinaire sur les micro-réseaux"
                className={champ}
              />
            </div>

            <div>
              <label className={etiquette} htmlFor="ev-description">Description</label>
              <textarea
                id="ev-description"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="De quoi il s’agit, et pour qui."
                className={`${champ} min-h-24 py-2`}
              />
            </div>

            <div>
              <label className={etiquette} htmlFor="ev-debut">Début</label>
              <input
                id="ev-debut"
                type="datetime-local"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={champ}
              />
            </div>

            <div>
              <label className={etiquette} htmlFor="ev-fin">Fin (facultatif)</label>
              <input
                id="ev-fin"
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className={champ}
              />
            </div>

            <fieldset>
              <legend className={etiquette}>Format</legend>
              <div className="flex flex-col gap-2">
                {FORMATS.map((f) => (
                  <label
                    key={f.id}
                    className={`flex cursor-pointer items-start gap-3 border px-3 py-2.5 transition-colors ${
                      form.format === f.id
                        ? 'border-engine bg-engine-wash'
                        : 'border-border-strong bg-bg-primary hover:bg-bg-tertiary'
                    }`}
                  >
                    <input
                      type="radio"
                      name="ev-format"
                      value={f.id}
                      checked={form.format === f.id}
                      onChange={() => setForm({ ...form, format: f.id })}
                      className="mt-1 h-4 w-4 shrink-0 accent-engine"
                    />
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                        <f.icon className="h-4 w-4" aria-hidden="true" />
                        {f.label}
                      </span>
                      <span className="mt-0.5 block text-sm text-text-muted">{f.aide}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {enLigne && (
              <div>
                <label className={etiquette} htmlFor="ev-lien">Lien de diffusion</label>
                <input
                  id="ev-lien"
                  type="url"
                  required
                  value={form.streamUrl}
                  onChange={(e) => setForm({ ...form, streamUrl: e.target.value })}
                  placeholder="https://…"
                  className={champ}
                />
                <p className="mt-1 text-sm text-text-muted">
                  L’événement est annoncé, pas encore diffusé. Le direct s’ouvre depuis
                  la liste, le jour venu.
                </p>
              </div>
            )}

            <div>
              <label className={etiquette} htmlFor="ev-club">Club organisateur (facultatif)</label>
              <select
                id="ev-club"
                value={form.clubId}
                onChange={(e) => setForm({ ...form, clubId: e.target.value })}
                className={`${champ} cursor-pointer`}
              >
                <option value="">Aucun club en particulier</option>
                {clubs.map((c) => (
                  <option key={c.id} value={c.id}>{c.title || c.name}</option>
                ))}
              </select>
              {clubsError ? (
                <p className="mt-1 text-sm text-danger">
                  {clubsError} L’événement sera créé sans club.
                </p>
              ) : clubs.length === 0 ? (
                <p className="mt-1 text-sm text-text-muted">
                  Vous ne dirigez aucun club : l’événement sera rattaché à votre université.
                </p>
              ) : null}
            </div>

            <button type="submit" disabled={envoi} className={boutonPrimaire}>
              {envoi
                ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                : <CalendarPlus className="h-4 w-4" aria-hidden="true" />}
              {envoi ? 'Création…' : 'Annoncer l’événement'}
            </button>
          </form>
        </SectionCard>

        <SectionCard
          icon={CalendarDays}
          title="À venir"
          subtitle={aVenir.length ? `${aVenir.length} annoncé${aVenir.length > 1 ? 's' : ''}` : undefined}
          accent="var(--color-ember)"
        >
          {chargement ? (
            <StatePanel state="loading" />
          ) : error ? (
            <StatePanel state="error" message={error} onRetry={charger} />
          ) : aVenir.length === 0 ? (
            <StatePanel state="empty" icon={CalendarDays} message="Aucun événement annoncé pour l’instant." />
          ) : (
            <ul className="flex flex-col gap-2">
              {aVenir.map((ev) => (
                <li key={ev.id} className="border border-border-strong bg-bg-primary p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="min-w-0 flex-1 text-sm font-semibold text-text-primary">{ev.title}</p>
                    {ev.isLive && (
                      <span className="chamfer-xs shrink-0 border border-danger bg-danger-wash px-2 py-0.5 text-xs font-extrabold uppercase tracking-wider text-danger">
                        En direct
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-text-muted">
                    {formatDateFr(ev.date)}
                    {ev.liveUrl ? ' · en ligne' : ' · en présentiel'}
                  </p>

                  {ev.liveUrl && (
                    <button
                      type="button"
                      onClick={() => basculerDirect(ev)}
                      disabled={bascule === ev.id}
                      className={`mt-3 inline-flex min-h-11 cursor-pointer items-center gap-2 border px-3 text-sm font-semibold transition-colors disabled:opacity-50 ${
                        ev.isLive
                          ? 'border-danger text-danger hover:bg-danger-wash'
                          : 'border-engine text-engine hover:bg-engine-wash'
                      }`}
                    >
                      {bascule === ev.id
                        ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        : ev.isLive
                          ? <Radio className="h-4 w-4" aria-hidden="true" />
                          : <RadioTower className="h-4 w-4" aria-hidden="true" />}
                      {ev.isLive ? 'Arrêter la diffusion' : 'Ouvrir l’antenne'}
                    </button>
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
