import { useCallback, useEffect, useState } from 'react'
import { Building2, FlaskConical, Globe2, GraduationCap, Loader2, Plus } from 'lucide-react'
import api from '../../services/api.js'
import SectionCard from '../ui/SectionCard.jsx'
import StatePanel from '../ui/StatePanel.jsx'
import { useToast } from '../ui/Toast.jsx'
import { champ, etiquette, boutonPrimaire } from '../../pages/espace-cite/shared.jsx'

/**
 * OrganisationManager — onglet Admin ▸ Organisation.
 *
 * `POST /countries`, `POST /universities`, `POST /branches` et `POST /clubs`
 * sont réservés à l'ADMIN depuis le début, et aucun écran ne les appelait :
 * la capacité `org:manage` figurait au carnet de dette. Toute la structure
 * institutionnelle — pays, universités, filières, clubs — ne pouvait naître
 * que par la base de données.
 *
 * ── L'ordre des blocs n'est pas décoratif ─────────────────────────────────
 * Une université a besoin d'un pays, une filière d'une université. Les quatre
 * formulaires suivent donc la chaîne de dépendance, et chacun se désactive
 * tant que son parent n'existe pas : proposer « créer une filière » sans
 * aucune université serait proposer une action qui échouera.
 */
export default function OrganisationManager() {
  const { notify } = useToast()

  const [countries, setCountries] = useState([])
  const [universities, setUniversities] = useState([])
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [pays, setPays] = useState('')
  const [universite, setUniversite] = useState({ name: '', countryId: '' })
  const [filiere, setFiliere] = useState({ name: '', universityId: '' })
  const [club, setClub] = useState({ name: '', discipline: '', description: '' })
  const [busy, setBusy] = useState(null)

  const charger = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [c, cl] = await Promise.all([api.org.getCountries(), api.clubs.getAll()])
      setCountries(Array.isArray(c?.data) ? c.data : [])
      setClubs(Array.isArray(cl?.data) ? cl.data : [])
    } catch (err) {
      setCountries([])
      setClubs([])
      setError(err?.serverMessage || err?.message || "La structure n'a pas pu être chargée.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { charger() }, [charger])

  // Les universités dépendent du pays choisi dans le formulaire « filière ».
  const [paysFiliere, setPaysFiliere] = useState('')
  useEffect(() => {
    if (!paysFiliere) { setUniversities([]); return }
    let actif = true
    ;(async () => {
      try {
        const res = await api.org.getUniversities(paysFiliere)
        if (actif) setUniversities(Array.isArray(res?.data) ? res.data : [])
      } catch (err) {
        if (!actif) return
        setUniversities([])
        notify(err?.serverMessage || err?.message || "Les universités n'ont pas pu être lues.", 'error')
      }
    })()
    return () => { actif = false }
  }, [paysFiliere, notify])

  const agir = async (cle, action, succes, remise) => {
    if (busy) return
    setBusy(cle)
    try {
      const res = await action()
      if (!res?.success) throw new Error(res?.message)
      notify(succes, 'success')
      remise()
      await charger()
    } catch (err) {
      notify(err?.serverMessage || err?.message || "L'enregistrement a échoué.", 'error')
    } finally {
      setBusy(null)
    }
  }

  const creerPays = (e) => {
    e.preventDefault()
    if (!pays.trim()) return notify('Donnez un nom au pays.', 'warning')
    agir('pays', () => api.org.createCountry(pays.trim()), `${pays.trim()} est enregistré.`, () => setPays(''))
  }

  const creerUniversite = (e) => {
    e.preventDefault()
    if (!universite.name.trim()) return notify('Donnez un nom à l’université.', 'warning')
    if (!universite.countryId) return notify('Choisissez le pays de rattachement.', 'warning')
    agir(
      'universite',
      () => api.org.createUniversity(universite.name.trim(), universite.countryId),
      `${universite.name.trim()} est enregistrée.`,
      () => setUniversite({ name: '', countryId: universite.countryId }),
    )
  }

  const creerFiliere = (e) => {
    e.preventDefault()
    if (!filiere.name.trim()) return notify('Donnez un nom à la filière.', 'warning')
    if (!filiere.universityId) return notify('Choisissez l’université de rattachement.', 'warning')
    agir(
      'filiere',
      () => api.org.createBranch(filiere.name.trim(), filiere.universityId),
      `${filiere.name.trim()} est enregistrée.`,
      () => setFiliere({ name: '', universityId: filiere.universityId }),
    )
  }

  const creerClub = (e) => {
    e.preventDefault()
    if (!club.name.trim()) return notify('Donnez un nom au club.', 'warning')
    if (!club.discipline.trim()) return notify('Indiquez la discipline du club.', 'warning')
    agir(
      'club',
      () => api.clubs.create({
        name: club.name.trim(),
        discipline: club.discipline.trim(),
        ...(club.description.trim() ? { description: club.description.trim() } : {}),
      }),
      `${club.name.trim()} est créé.`,
      () => setClub({ name: '', discipline: '', description: '' }),
    )
  }

  if (loading) return <StatePanel state="loading" />
  if (error) return <StatePanel state="error" message={error} onRetry={charger} />

  const bouton = (cle, libelle) => (
    <button type="submit" disabled={busy === cle} className={boutonPrimaire}>
      {busy === cle
        ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        : <Plus className="h-4 w-4" aria-hidden="true" />}
      {busy === cle ? 'Enregistrement…' : libelle}
    </button>
  )

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <SectionCard
        icon={Globe2}
        title="Pays"
        subtitle={countries.length ? `${countries.length} enregistré${countries.length > 1 ? 's' : ''}` : 'Aucun pays'}
      >
        <form onSubmit={creerPays} className="flex flex-col gap-3">
          <div>
            <label className={etiquette} htmlFor="org-pays">Nom du pays</label>
            <input
              id="org-pays"
              type="text"
              value={pays}
              onChange={(e) => setPays(e.target.value)}
              placeholder="Ex : Bénin"
              className={champ}
            />
          </div>
          {bouton('pays', 'Ajouter le pays')}
        </form>

        {countries.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {countries.map((c) => (
              <li key={c.id} className="chamfer-xs border border-border-strong px-2.5 py-1 text-sm text-text-secondary">
                {c.name}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard icon={Building2} title="Université" subtitle="Rattachée à un pays" accent="var(--color-ember)">
        <form onSubmit={creerUniversite} className="flex flex-col gap-3">
          <div>
            <label className={etiquette} htmlFor="org-univ-pays">Pays</label>
            <select
              id="org-univ-pays"
              value={universite.countryId}
              onChange={(e) => setUniversite({ ...universite, countryId: e.target.value })}
              disabled={countries.length === 0}
              className={`${champ} cursor-pointer disabled:opacity-50`}
            >
              <option value="">Choisir un pays…</option>
              {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {countries.length === 0 && (
              <p className="mt-1 text-sm text-text-muted">Créez d’abord un pays.</p>
            )}
          </div>
          <div>
            <label className={etiquette} htmlFor="org-univ-nom">Nom de l’université</label>
            <input
              id="org-univ-nom"
              type="text"
              value={universite.name}
              onChange={(e) => setUniversite({ ...universite, name: e.target.value })}
              placeholder="Ex : Université d’Abomey-Calavi"
              className={champ}
            />
          </div>
          {bouton('universite', 'Ajouter l’université')}
        </form>
      </SectionCard>

      <SectionCard icon={GraduationCap} title="Filière" subtitle="Rattachée à une université">
        <form onSubmit={creerFiliere} className="flex flex-col gap-3">
          <div>
            <label className={etiquette} htmlFor="org-fil-pays">Pays</label>
            <select
              id="org-fil-pays"
              value={paysFiliere}
              onChange={(e) => { setPaysFiliere(e.target.value); setFiliere({ ...filiere, universityId: '' }) }}
              disabled={countries.length === 0}
              className={`${champ} cursor-pointer disabled:opacity-50`}
            >
              <option value="">Choisir un pays…</option>
              {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={etiquette} htmlFor="org-fil-univ">Université</label>
            <select
              id="org-fil-univ"
              value={filiere.universityId}
              onChange={(e) => setFiliere({ ...filiere, universityId: e.target.value })}
              disabled={universities.length === 0}
              className={`${champ} cursor-pointer disabled:opacity-50`}
            >
              <option value="">
                {paysFiliere ? 'Choisir une université…' : 'Choisissez d’abord un pays'}
              </option>
              {universities.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label className={etiquette} htmlFor="org-fil-nom">Nom de la filière</label>
            <input
              id="org-fil-nom"
              type="text"
              value={filiere.name}
              onChange={(e) => setFiliere({ ...filiere, name: e.target.value })}
              placeholder="Ex : génie électrique"
              className={champ}
            />
          </div>
          {bouton('filiere', 'Ajouter la filière')}
        </form>
      </SectionCard>

      <SectionCard
        icon={FlaskConical}
        title="Club CITE"
        subtitle={clubs.length ? `${clubs.length} club${clubs.length > 1 ? 's' : ''}` : 'Aucun club'}
        accent="var(--color-ember)"
      >
        <form onSubmit={creerClub} className="flex flex-col gap-3">
          <div>
            <label className={etiquette} htmlFor="org-club-nom">Nom du club</label>
            <input
              id="org-club-nom"
              type="text"
              value={club.name}
              onChange={(e) => setClub({ ...club, name: e.target.value })}
              placeholder="Ex : CITE Énergie"
              className={champ}
            />
          </div>
          <div>
            <label className={etiquette} htmlFor="org-club-discipline">Discipline</label>
            <input
              id="org-club-discipline"
              type="text"
              value={club.discipline}
              onChange={(e) => setClub({ ...club, discipline: e.target.value })}
              placeholder="Ex : énergie et réseaux électriques"
              className={champ}
            />
          </div>
          <div>
            <label className={etiquette} htmlFor="org-club-description">Description (facultatif)</label>
            <textarea
              id="org-club-description"
              rows={3}
              value={club.description}
              onChange={(e) => setClub({ ...club, description: e.target.value })}
              placeholder="Ce sur quoi le club travaille."
              className={`${champ} min-h-20 py-2`}
            />
          </div>
          <p className="text-sm text-text-muted">
            Le responsable du club se désigne ensuite depuis l’onglet Membres.
          </p>
          {bouton('club', 'Créer le club')}
        </form>
      </SectionCard>
    </div>
  )
}
