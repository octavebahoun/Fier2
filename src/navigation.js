import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

// ─── Source unique du mapping page ↔ URL ────────────────────────────────────
// Aligné sur les wireframes : /students, /formations, /researchers(/:id), /help,
// et /members = espace login/conversion (l'annuaire est désormais /researchers).
export const PAGE_TO_PATH = {
  home:                      () => '/',
  cite:                      () => '/cite',
  'cite-integration':        () => '/cite',
  'student-portal':          () => '/students',
  students:                  () => '/students',
  news:                      () => '/news',
  'news-detail':             (p) => `/news/${p.newsId ?? p.id ?? ''}`,
  clubs:                     () => '/clubs',
  'club-detail':             (p) => `/clubs/${p.clubId ?? ''}`,
  projects:                  () => '/projects',
  'project-detail':          (p) => `/projects/${p.projectId ?? ''}`,
  workshops:                 () => '/formations',
  formations:                () => '/formations',
  events:                    () => '/events',
  researchers:               () => '/researchers',          // annuaire (déplacé)
  members:                   () => '/members',              // login / conversion
  dashboard:                 () => '/dashboard',
  profile:                   (p) => `/researchers/${p.researcherId ?? 'me'}`,
  'researcher-profile-edit': () => '/researchers/edit',
  admin:                     () => '/admin',
  contact:                   () => '/help',
  help:                      () => '/help',
  auth:                      () => '/members',              // login désormais sous /members
  opportunities:             () => '/opportunities',
  paf:                       () => '/paf',
  gouvernance:               () => '/gouvernance',
  'espace-cite':             () => '/espace-cite',
  challenges:                () => '/challenges',
  soutiens:                  () => '/soutiens',
}

/**
 * buildPath(pageName, params) — construit l'URL d'une page.
 * Un chemin déjà formé (commençant par '/') est renvoyé tel quel (redirection post-login).
 */
export function buildPath(pageName, params = {}) {
  if (typeof pageName === 'string' && pageName.startsWith('/')) return pageName
  const build = PAGE_TO_PATH[pageName]
  return build ? build(params) : '/'
}

/**
 * pathToPageName(pathname) — reverse mapping, pour l'état actif de navigation et
 * le « chrome » du layout (footer, paddings, transitions).
 */
export function pathToPageName(pathname) {
  if (pathname === '/') return 'home'
  if (pathname === '/projects') return 'projects'
  if (pathname.startsWith('/projects/')) return 'project-detail'
  if (pathname === '/news') return 'news'
  if (pathname.startsWith('/news/')) return 'news-detail'
  if (pathname === '/researchers/edit') return 'researcher-profile-edit'
  if (pathname === '/researchers') return 'researchers'
  if (pathname.startsWith('/researchers/')) return 'profile'
  if (pathname === '/profile/edit') return 'researcher-profile-edit'
  if (pathname.startsWith('/profile/')) return 'profile'
  if (pathname === '/clubs') return 'clubs'
  if (pathname.startsWith('/clubs/')) return 'club-detail'
  // Le login/conversion (/members et /auth) partage le « chrome » de la page auth.
  if (pathname === '/members' || pathname === '/auth') return 'auth'
  const STATIC = {
    '/cite': 'cite-integration',
    '/students': 'student-portal',
    '/student-portal': 'student-portal',
    '/formations': 'workshops',
    '/workshops': 'workshops',
    '/events': 'events',
    '/dashboard': 'dashboard',
    '/admin': 'admin',
    '/help': 'contact',
    '/contact': 'contact',
    '/opportunities': 'opportunities',
    '/paf': 'paf',
    '/gouvernance': 'gouvernance',
    '/espace-cite': 'espace-cite',
    '/challenges': 'challenges',
    '/soutiens': 'soutiens',
  }
  return STATIC[pathname] || 'home'
}

/**
 * useAppNavigate() — adaptateur « strangler » : conserve navigate(pageName, params)
 * tout en déléguant à react-router.
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
