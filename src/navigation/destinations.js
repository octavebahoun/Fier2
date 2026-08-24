/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FIERI — Registre des destinations : UN chemin, UN nom, UN droit.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Avant, la même page portait jusqu'à quatre noms selon la surface qui
 * l'affichait, et sa garde était réécrite à la main dans la route ET dans
 * l'écran (constats F04, F06, F09). Tout se lit désormais ici :
 *
 *   • `App.jsx`          — la garde de route
 *   • `app-sidebar.jsx`  — l'entrée de menu
 *   • `nav-user.jsx`     — le menu du compte
 *   • `CommandPalette`   — la recherche ⌘K, filtrée par les mêmes droits
 *   • `SiteHeader`       — le titre et le fil d'Ariane
 *   • `navigation.js`    — la construction d'URL
 *
 * Un lien ne peut plus mener à une page qui refuse de s'ouvrir : c'est la même
 * expression qui répond aux deux questions.
 *
 * ── Champs ────────────────────────────────────────────────────────────────
 *   id          clé de navigation historique (`navigate('dashboard')`)
 *   path        chemin fixe, ou `build(params)` pour les pages à paramètre
 *   label       LE nom de la destination. Un seul, partout.
 *   section     groupe de navigation et premier niveau du fil d'Ariane
 *   access      'public' | 'auth' | { capability } | { anyOf: [capabilities] }
 *   inNav       présent dans la barre latérale
 *   inPalette   présent dans la recherche ⌘K
 *   parent      id du parent, pour l'état actif et le fil d'Ariane des pages détail
 */

export const SECTIONS = {
  ESPACE:      { id: 'espace',      label: 'Mon espace' },
  GOUVERNANCE: { id: 'gouvernance', label: 'Gouvernance' },
  RECHERCHE:   { id: 'recherche',   label: 'Recherche & R&D' },
  COMMUNAUTE:  { id: 'communaute',  label: 'Communauté' },
  SUPPORT:     { id: 'support',     label: 'Support' },
  PUBLIC:      { id: 'public',      label: 'Site public' },
}

/** Ordre d'affichage des groupes dans la barre latérale. */
export const SECTION_ORDER = [
  SECTIONS.ESPACE.id,
  SECTIONS.GOUVERNANCE.id,
  SECTIONS.RECHERCHE.id,
  SECTIONS.COMMUNAUTE.id,
  SECTIONS.SUPPORT.id,
]

const PUBLIC = 'public'
const AUTH = 'auth'

export const DESTINATIONS = [
  // ── Site public ─────────────────────────────────────────────────────────
  {
    id: 'home', path: '/', label: 'Accueil',
    section: SECTIONS.PUBLIC.id, access: PUBLIC, inNav: false, inPalette: true,
  },
  {
    id: 'auth', path: '/members', label: 'Connexion',
    aliases: ['/auth'], section: SECTIONS.PUBLIC.id, access: PUBLIC,
    inNav: false, inPalette: false,
  },
  {
    id: 'paf', path: '/paf', label: 'PAF',
    section: SECTIONS.PUBLIC.id, access: PUBLIC, inNav: false, inPalette: false,
  },

  // ── Mon espace ──────────────────────────────────────────────────────────
  {
    id: 'dashboard', path: '/dashboard', label: 'Tableau de bord',
    section: SECTIONS.ESPACE.id, access: { capability: 'space:access' },
    inNav: true, inPalette: true, icon: 'LayoutDashboard',
  },
  {
    id: 'profile',
    build: (p = {}) => `/researchers/${p.researcherId ?? 'me'}`,
    match: (path) => path.startsWith('/researchers/') && path !== '/researchers/edit',
    label: 'Mon profil',
    section: SECTIONS.ESPACE.id, access: PUBLIC,
    inNav: true, inPalette: true, icon: 'UserRound', navParams: { researcherId: 'me' },
  },
  {
    id: 'researcher-profile-edit', path: '/researchers/edit', label: 'Modifier mon profil',
    aliases: ['/profile/edit'], section: SECTIONS.ESPACE.id,
    access: { capability: 'profile:editOwn' },
    inNav: false, inPalette: false, parent: 'profile',
  },
  {
    id: 'student-portal', path: '/students', label: 'Portail étudiant',
    aliases: ['/student-portal'], section: SECTIONS.ESPACE.id, access: PUBLIC,
    inNav: false, inPalette: true, icon: 'GraduationCap',
  },

  // ── Gouvernance ─────────────────────────────────────────────────────────
  // Chaque entrée est gardée par la capacité que l'écran exige réellement.
  {
    id: 'gouvernance', path: '/gouvernance', label: 'Attestations & exclusions',
    section: SECTIONS.GOUVERNANCE.id,
    access: { anyOf: ['certificate:issue', 'exclusion:review'] },
    inNav: true, inPalette: true, icon: 'ShieldCheck',
  },
  {
    id: 'espace-cite', path: '/espace-cite', label: 'Espace CITE',
    section: SECTIONS.GOUVERNANCE.id,
    // Un responsable y dépose ses rapports ; le secrétariat et le chef
    // universitaire les lisent. Le chef manquait à l'appel — constat F04.
    access: { anyOf: ['report:submit', 'report:read'] },
    inNav: true, inPalette: true, icon: 'LayoutList',
  },
  {
    id: 'soutiens', path: '/soutiens', label: 'Soutiens & trésorerie',
    section: SECTIONS.GOUVERNANCE.id,
    // La page de don reste publique ; l'entrée de MENU ne s'affiche que pour
    // qui peut lire le grand livre — sinon le lien mène à un formulaire de don
    // sans trésorerie (constat F08).
    access: PUBLIC,
    navAccess: { capability: 'treasury:read' },
    inNav: true, inPalette: true, icon: 'HeartHandshake',
  },
  {
    id: 'admin', path: '/admin', label: 'Console d’administration',
    section: SECTIONS.GOUVERNANCE.id, access: { capability: 'admin:access' },
    inNav: true, inPalette: true, icon: 'Shield',
  },

  // ── Recherche & R&D ─────────────────────────────────────────────────────
  {
    id: 'projects', path: '/projects', label: 'Projets R&D',
    section: SECTIONS.RECHERCHE.id, access: PUBLIC,
    inNav: true, inPalette: true, icon: 'FolderGit2',
  },
  {
    id: 'project-detail',
    build: (p = {}) => `/projects/${p.projectId ?? ''}`,
    match: (path) => path.startsWith('/projects/'),
    label: 'Projet', section: SECTIONS.RECHERCHE.id, access: PUBLIC,
    inNav: false, inPalette: false, parent: 'projects',
  },
  {
    id: 'workshops', path: '/formations', label: 'Formations',
    aliases: ['/workshops'], section: SECTIONS.RECHERCHE.id, access: PUBLIC,
    inNav: true, inPalette: true, icon: 'GraduationCap',
  },
  {
    id: 'opportunities', path: '/opportunities', label: 'Opportunités',
    section: SECTIONS.RECHERCHE.id, access: PUBLIC,
    inNav: true, inPalette: true, icon: 'Briefcase',
  },
  {
    id: 'clubs', path: '/clubs', label: 'Clubs CITE',
    section: SECTIONS.RECHERCHE.id, access: PUBLIC,
    inNav: true, inPalette: true, icon: 'Users',
  },
  {
    id: 'club-detail',
    build: (p = {}) => `/clubs/${p.clubId ?? ''}`,
    match: (path) => path.startsWith('/clubs/'),
    label: 'Club', section: SECTIONS.RECHERCHE.id, access: PUBLIC,
    inNav: false, inPalette: false, parent: 'clubs',
  },

  // ── Communauté ──────────────────────────────────────────────────────────
  {
    id: 'news', path: '/news', label: 'Actualités',
    section: SECTIONS.COMMUNAUTE.id, access: PUBLIC,
    inNav: true, inPalette: true, icon: 'Newspaper',
  },
  {
    id: 'news-detail',
    build: (p = {}) => `/news/${p.newsId ?? p.id ?? ''}`,
    match: (path) => path.startsWith('/news/'),
    label: 'Article', section: SECTIONS.COMMUNAUTE.id, access: PUBLIC,
    inNav: false, inPalette: false, parent: 'news',
  },
  {
    id: 'events', path: '/events', label: 'Événements',
    section: SECTIONS.COMMUNAUTE.id, access: PUBLIC,
    inNav: true, inPalette: true, icon: 'CalendarDays',
  },
  {
    id: 'challenges', path: '/challenges', label: 'Challenges',
    section: SECTIONS.COMMUNAUTE.id, access: PUBLIC,
    inNav: true, inPalette: true, icon: 'Trophy',
  },
  {
    id: 'researchers', path: '/researchers', label: 'Annuaire',
    section: SECTIONS.COMMUNAUTE.id, access: PUBLIC,
    inNav: true, inPalette: true, icon: 'Contact',
  },
  {
    id: 'cite', path: '/cite', label: 'Organisation CITE',
    aliases: ['/cite-integration'], section: SECTIONS.COMMUNAUTE.id, access: PUBLIC,
    inNav: false, inPalette: true, icon: 'Layers',
  },

  // ── Support ─────────────────────────────────────────────────────────────
  {
    id: 'contact', path: '/help', label: 'Aide & contact',
    aliases: ['/contact'], section: SECTIONS.SUPPORT.id, access: PUBLIC,
    inNav: true, inPalette: true, icon: 'LifeBuoy',
  },
]

// ── Index ──────────────────────────────────────────────────────────────────
export const DESTINATION_BY_ID = Object.fromEntries(DESTINATIONS.map((d) => [d.id, d]))

/** Alias historiques : `navigate('formations')` continue de fonctionner. */
export const ID_ALIASES = {
  'cite-integration': 'cite',
  formations: 'workshops',
  students: 'student-portal',
  members: 'auth',
  help: 'contact',
}

export function getDestination(id) {
  return DESTINATION_BY_ID[ID_ALIASES[id] ?? id] ?? null
}

/** Le chemin canonique d'une destination. */
export function pathOf(id, params = {}) {
  const dest = getDestination(id)
  if (!dest) return '/'
  return typeof dest.build === 'function' ? dest.build(params) : dest.path
}

/**
 * L'identifiant de destination correspondant à une URL. Les chemins fixes
 * gagnent toujours sur les motifs (`/researchers` avant `/researchers/:id`).
 */
export function idOfPath(pathname) {
  const exact = DESTINATIONS.find(
    (d) => d.path === pathname || (d.aliases || []).includes(pathname),
  )
  if (exact) return exact.id
  const matched = DESTINATIONS.find((d) => typeof d.match === 'function' && d.match(pathname))
  return matched ? matched.id : 'home'
}

/** La règle d'accès qui garde la ROUTE. */
export function routeAccessOf(id) {
  return getDestination(id)?.access ?? PUBLIC
}

/**
 * La règle d'accès qui décide de l'affichage du LIEN. Par défaut c'est celle de
 * la route — d'où l'impossibilité d'afficher un lien mort. `navAccess` ne sert
 * qu'aux pages publiques dont l'entrée de menu vise un public plus étroit.
 */
export function navAccessOf(id) {
  const dest = getDestination(id)
  return dest?.navAccess ?? dest?.access ?? PUBLIC
}

export { PUBLIC, AUTH }
