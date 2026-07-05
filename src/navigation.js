import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

// ─── Source unique du mapping page ↔ URL ────────────────────────────────────
// Chaque pageName historique → une fonction qui construit son URL.
// Ajouter une page = une ligne ici (et une <Route> dans App).
export const PAGE_TO_PATH = {
  home:                      () => '/',
  cite:                      () => '/cite',
  'cite-integration':        () => '/cite',
  'student-portal':          () => '/student-portal',
  news:                      () => '/news',
  clubs:                     () => '/clubs',
  projects:                  () => '/projects',
  'project-detail':          (p) => `/projects/${p.projectId ?? ''}`,
  workshops:                 () => '/workshops',
  events:                    () => '/events',
  members:                   () => '/members',
  dashboard:                 () => '/dashboard',
  profile:                   (p) => `/profile/${p.researcherId ?? 'me'}`,
  'researcher-profile-edit': () => '/profile/edit',
  admin:                     () => '/admin',
  contact:                   () => '/contact',
  auth:                      () => '/auth',
  opportunities:             () => '/opportunities',
  paf:                       () => '/paf',
}

/**
 * buildPath(pageName, params) — construit l'URL d'une page.
 * Si `pageName` est déjà un chemin (commence par '/'), on le renvoie tel quel :
 * cela permet à la redirection post-login (qui mémorise un path) de fonctionner
 * sans traitement particulier côté page.
 */
export function buildPath(pageName, params = {}) {
  if (typeof pageName === 'string' && pageName.startsWith('/')) return pageName
  const build = PAGE_TO_PATH[pageName]
  return build ? build(params) : '/'
}

/**
 * pathToPageName(pathname) — reverse mapping, pour l'état actif de la navigation
 * et les décisions de « chrome » du layout (footer, paddings, transitions).
 */
export function pathToPageName(pathname) {
  if (pathname === '/') return 'home'
  if (pathname === '/projects') return 'projects'
  if (pathname.startsWith('/projects/')) return 'project-detail'
  if (pathname === '/profile/edit') return 'researcher-profile-edit'
  if (pathname.startsWith('/profile/')) return 'profile'
  const STATIC = {
    '/cite': 'cite-integration',
    '/student-portal': 'student-portal',
    '/news': 'news',
    '/clubs': 'clubs',
    '/workshops': 'workshops',
    '/events': 'events',
    '/members': 'members',
    '/dashboard': 'dashboard',
    '/admin': 'admin',
    '/contact': 'contact',
    '/auth': 'auth',
    '/opportunities': 'opportunities',
    '/paf': 'paf',
  }
  return STATIC[pathname] || 'home'
}

/**
 * useAppNavigate() — adaptateur « strangler ».
 * Conserve l'API historique navigate(pageName, params) utilisée dans ~68 endroits,
 * mais délègue à react-router. Les pages n'ont pas besoin d'être modifiées.
 */
export function useAppNavigate() {
  const navigate = useNavigate()
  return useCallback((pageName, params = {}) => {
    navigate(buildPath(pageName, params))
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [navigate])
}
