import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'

/**
 * useUniversityScope — quelle université administre-t-on ?
 *
 * Presque toujours celle du membre. Le sélecteur pays → université n'est utile
 * qu'à un ADMIN global, dont le compte n'est rattaché à aucune : le proposer à
 * un chef universitaire serait lui demander de choisir parmi une seule option.
 *
 * Le choix vit dans l'URL, comme le club : partageable et restitué au retour.
 */
export function useUniversityScope() {
  const { user, identity } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const propre = identity?.universityId ?? user?.universityId ?? null
  const depuisUrl = searchParams.get('universite')
  const universityId = propre ?? (depuisUrl ? Number(depuisUrl) : null)

  // Le sélecteur ne sert qu'à qui n'a pas d'université propre.
  const besoinSelecteur = propre === null

  const [countries, setCountries] = useState([])
  const [countryId, setCountryId] = useState('')
  const [universities, setUniversities] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!besoinSelecteur) return
    let actif = true
    ;(async () => {
      try {
        const res = await api.org.getCountries()
        if (actif && res?.success) setCountries(res.data || [])
      } catch (err) {
        if (actif) setError(err?.serverMessage || err?.message || 'Les pays n’ont pas pu être chargés.')
      }
    })()
    return () => { actif = false }
  }, [besoinSelecteur])

  useEffect(() => {
    if (!countryId) { setUniversities([]); return }
    let actif = true
    ;(async () => {
      try {
        const res = await api.org.getUniversities(countryId)
        if (actif && res?.success) setUniversities(res.data || [])
      } catch (err) {
        if (actif) setError(err?.serverMessage || err?.message || 'Les universités n’ont pas pu être chargées.')
      }
    })()
    return () => { actif = false }
  }, [countryId])

  const setUniversityId = (id) => {
    setSearchParams((params) => {
      const copie = new URLSearchParams(params)
      if (id) copie.set('universite', String(id))
      else copie.delete('universite')
      return copie
    }, { replace: true })
  }

  return useMemo(() => ({
    universityId,
    besoinSelecteur,
    countries,
    countryId,
    setCountryId,
    universities,
    setUniversityId,
    error,
  }), [universityId, besoinSelecteur, countries, countryId, universities, error])
}
