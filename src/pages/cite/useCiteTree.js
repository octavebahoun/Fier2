import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../../services/api.js'
import { readIdentity } from '../../auth/access.js'
import { getRolePresentation, getPostPresentation } from '../../context/AuthContext.jsx'

/**
 * L'arbre de la cité : pays → universités → clubs, plus les personnes qui y
 * exercent une responsabilité.
 *
 * Ce module remplace 300 lignes de reconstruction dans l'écran, et corrige
 * trois choses de fond.
 *
 * 1. Il n'invente rien. La version précédente portait trois tables d'éditorial
 *    codées en dur — drapeau, région, résumé, ville, « décision du peuple »,
 *    « tricots officiels ». Le modèle de données n'a rien de tout cela : un
 *    pays n'a qu'un nom, une université qu'un nom, un club une discipline et
 *    une description. Le reste était écrit dans le source.
 * 2. Il ne masque plus les pannes. Chaque appel était suivi d'un
 *    `.catch(() => ({ success: false, data: [] }))` : une coupure réseau
 *    s'affichait « aucun pays », indiscernable d'une cité vide.
 * 3. Il lit l'identité par le modèle d'accès. L'écran testait
 *    `m.role === 'CHEF_UNIVERSITAIRE'` et `m.role === 'MENTOR'` — un poste et
 *    un badge, jamais des rôles : ces deux conditions ne pouvaient pas être
 *    vraies.
 */

/** Sélection courante, lue dans l'URL pour être partageable et réversible. */
export function useCiteSelection() {
  const [params, setParams] = useSearchParams()

  const set = useCallback((next) => {
    setParams((current) => {
      const p = new URLSearchParams(current)
      for (const [cle, valeur] of Object.entries(next)) {
        if (valeur === null || valeur === undefined || valeur === '') p.delete(cle)
        else p.set(cle, String(valeur))
      }
      return p
    })
  }, [setParams])

  return {
    countryId: params.get('pays'),
    universityId: params.get('universite'),
    clubId: params.get('club'),
    panel: params.get('vue'), // 'gouvernance' | 'bureau' | 'responsables' | 'chef' | 'adhesion'
    query: params.get('q') || '',
    // Descendre d'un niveau efface les niveaux inférieurs et la recherche.
    goWorld: () => set({ pays: null, universite: null, club: null, vue: null, q: null }),
    goCountry: (id) => set({ pays: id, universite: null, club: null, vue: null, q: null }),
    goUniversity: (id) => set({ universite: id, club: null, vue: null, q: null }),
    goClub: (id) => set({ club: id, vue: null, q: null }),
    goPanel: (vue) => set({ vue }),
    setQuery: (q) => set({ q: q || null }),
  }
}

/** Le nom affichable d'un membre, sans jamais inventer de valeur. */
const nomDe = (m) =>
  [m?.firstName ?? m?.firstname, m?.lastName ?? m?.lastname].filter(Boolean).join(' ')
  || m?.name || m?.email || 'Membre'

/** Le titre d'une personne : son poste s'il en a un, sinon son rôle. */
export function titreDe(membre) {
  const identity = readIdentity(membre)
  const poste = getPostPresentation(identity.universityPost || identity.countryPost)
  if (poste) return poste.label
  return getRolePresentation(identity.role).label
}

export function useCiteTree() {
  const [countries, setCountries] = useState([])
  const [universitiesByCountry, setUniversitiesByCountry] = useState({})
  const [branchesByUniversity, setBranchesByUniversity] = useState({})
  const [clubs, setClubs] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Un échec ici doit se voir : c'est toute la page qui n'a pas de contenu.
      const [pays, clubsRes, membresRes] = await Promise.all([
        api.org.getCountries(),
        api.clubs.getAll(),
        api.members.list({ limit: 500 }),
      ])
      if (!pays?.success) throw new Error(pays?.message)

      const liste = pays.data || []
      setCountries(liste)
      setClubs(clubsRes?.success ? clubsRes.data || [] : [])
      setMembers(membresRes?.success ? membresRes.data || [] : [])

      const parPays = {}
      const parUniversite = {}
      await Promise.all(liste.map(async (c) => {
        const unis = await api.org.getUniversities(c.id)
        if (!unis?.success) return
        parPays[c.id] = unis.data || []
        await Promise.all((unis.data || []).map(async (u) => {
          const branches = await api.org.getBranches(u.id)
          if (branches?.success) parUniversite[u.id] = branches.data || []
        }))
      }))
      setUniversitiesByCountry(parPays)
      setBranchesByUniversity(parUniversite)
    } catch (err) {
      setCountries([])
      setError(err?.serverMessage || err?.message || "L'organisation CITE n'a pas pu être chargée.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  /** L'université d'un membre, retrouvée par sa filière. */
  const universiteDe = useCallback((membre) => {
    if (membre?.branchId == null) return null
    for (const branches of Object.values(branchesByUniversity)) {
      const filiere = (branches || []).find((b) => Number(b.id) === Number(membre.branchId))
      if (filiere) return Number(filiere.universityId)
    }
    return null
  }, [branchesByUniversity])

  /** L'arbre complet, sans un seul champ inventé. */
  const tree = useMemo(() => countries.map((pays) => {
    const universites = (universitiesByCountry[pays.id] || []).map((u) => ({
      id: u.id,
      name: u.name,
      clubs: clubs.map((c) => ({
        id: c.id,
        name: c.name,
        discipline: c.discipline || null,
        description: c.description || null,
        memberCount: c.memberCount ?? null,
        responsibleId: c.responsibleId ?? null,
        responsible: c.responsible ?? null,
      })),
      // Responsables de l'université : ceux qui y détiennent un poste, et les
      // responsables de club rattachés à l'une de ses filières.
      leaders: members.filter((m) => {
        const identity = readIdentity(m)
        if (identity.universityPost && Number(identity.universityId) === Number(u.id)) return true
        return identity.responsibleClubIds.length > 0 && universiteDe(m) === Number(u.id)
      }).map((m) => ({ id: m.id, name: nomDe(m), title: titreDe(m), member: m })),
    }))

    return {
      id: pays.id,
      name: pays.name,
      universities: universites,
      // Bureau national : les détenteurs d'un poste pays. Rien d'autre.
      bureau: members.filter((m) => {
        const identity = readIdentity(m)
        return identity.countryPost && Number(identity.countryId ?? pays.id) === Number(pays.id)
      }).map((m) => ({ id: m.id, name: nomDe(m), title: titreDe(m), member: m })),
    }
  }), [countries, universitiesByCountry, clubs, members, universiteDe])

  /** Gouvernance mondiale : les membres marqués emblématiques, et eux seuls. */
  const globalGovernance = useMemo(
    () => members.filter((m) => m.isEmblematic)
      .map((m) => ({ id: m.id, name: nomDe(m), title: titreDe(m), bio: m.bio || null, member: m })),
    [members],
  )

  return { tree, globalGovernance, loading, error, reload: load, members }
}
