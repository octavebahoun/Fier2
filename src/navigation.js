import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { DESTINATIONS, getDestination, pathOf, idOfPath } from './navigation/destinations.js'

/**
 * Construction d'URL et navigation. Le mapping page ↔ URL n'est plus tenu ici :
 * il vit dans `navigation/destinations.js`, avec le nom et le droit de chaque
 * destination. Ce fichier n'en est que l'adaptateur react-router.
 */

/** Compatibilité : `PAGE_TO_PATH.dashboard()` continue de fonctionner. */
export const PAGE_TO_PATH = Object.fromEntries(
  DESTINATIONS.map((d) => [d.id, (params = {}) => pathOf(d.id, params)]),
)

/**
 * buildPath(pageName, params) — l'URL d'une destination.
 * Un chemin déjà formé (commençant par '/') passe tel quel : c'est ce que
 * `ProtectedRoute` mémorise pour revenir après connexion.
 */
export function buildPath(pageName, params = {}) {
  if (typeof pageName === 'string' && pageName.startsWith('/')) return pageName
  return getDestination(pageName) ? pathOf(pageName, params) : '/'
}

/** pathToPageName(pathname) — l'identifiant de destination d'une URL. */
export function pathToPageName(pathname) {
  return idOfPath(pathname)
}

/**
 * useAppNavigate() — conserve `navigate(pageName, params)` en déléguant à
 * react-router. Remonte en haut de page, sauf préférence de mouvement réduit.
 */
export function useAppNavigate() {
  const navigate = useNavigate()
  return useCallback((pageName, params = {}) => {
    navigate(buildPath(pageName, params))
    if (typeof window !== 'undefined') {
      const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
    }
  }, [navigate])
}
