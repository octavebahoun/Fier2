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
  CITE:        { id: 'cite',        label: 'Mon club CITE' },
  GOUVERNANCE: { id: 'gouvernance', label: 'Gouvernance' },
  RECHERCHE:   { id: 'recherche',   label: 'Recherche & R&D' },
  COMMUNAUTE:  { id: 'communaute',  label: 'Communauté' },
  SUPPORT:     { id: 'support',     label: 'Support' },
  PUBLIC:      { id: 'public',      label: 'Site public' },
}

/** Ordre d'affichage des groupes dans la barre latérale. */
export const SECTION_ORDER = [
  SECTIONS.ESPACE.id,
  SECTIONS.CITE.id,
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
    // Les quatre programmes vivent sur une seule page, un onglet chacun.
    // `/paf` etait la page du seul programme qui en avait une : le chemin
    // reste valide et mene desormais a son onglet.
    id: 'programmes',
    build: (p = {}) => (p.programme ? `/programmes?p=${p.programme}` : '/programmes'),
    match: (path) => path === '/programmes' || path === '/paf',
    label: 'Nos programmes',
    aliases: ['/paf'], section: SECTIONS.PUBLIC.id, access: PUBLIC,
    inNav: false, inPalette: true, icon: 'Sparkles',
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
    // Présentation d'entrée de jeu : elle a sa place dans le menu, pas
    // seulement au fond de la palette.
    id: 'student-portal', path: '/students', label: 'Portail étudiant',
    aliases: ['/student-portal'], section: SECTIONS.ESPACE.id, access: PUBLIC,
    inNav: true, inPalette: true, icon: 'Compass',
  },

  // ── Espace CITE ─────────────────────────────────────────────────────────
  // L'ancien écran unique portait neuf métiers : membres, adhésions, projets,
  // recensement, activités, rapports, découverte de clubs, rapports reçus et
  // annuaire. Une intention par écran, un droit par écran.
  {
    id: 'espace-cite', path: '/espace-cite', label: 'Mon club',
    section: SECTIONS.CITE.id, access: { capability: 'space:access' },
    inNav: true, inPalette: true, icon: 'Users',
  },
  {
    id: 'cite-adhesions', path: '/espace-cite/adhesions', label: 'Adhésions',
    section: SECTIONS.CITE.id, access: { capability: 'membership:review' },
    inNav: true, inPalette: true, icon: 'UserPlus', parent: 'espace-cite',
  },
  {
    id: 'cite-activites', path: '/espace-cite/activites', label: 'Activités',
    section: SECTIONS.CITE.id, access: { capability: 'activity:assign' },
    inNav: true, inPalette: true, icon: 'ClipboardList', parent: 'espace-cite',
  },
  {
    // `PUT /clubs/:id` et `DELETE /memberships/:clubId/user/:userId` etaient
    // ouverts au responsable du club sans aucun ecran pour les appeler.
    id: 'cite-gestion', path: '/espace-cite/gestion', label: 'Gérer le club',
    section: SECTIONS.CITE.id,
    access: { anyOf: ['club:edit', 'membership:remove'] },
    inNav: true, inPalette: true, icon: 'Settings2', parent: 'espace-cite',
  },
  {
    id: 'cite-rapports', path: '/espace-cite/rapports', label: 'Rapports',
    section: SECTIONS.CITE.id,
    // Un responsable dépose, le secrétariat et le chef lisent : deux portes,
    // un seul écran.
    access: { anyOf: ['report:submit', 'report:read'] },
    inNav: true, inPalette: true, icon: 'FileText', parent: 'espace-cite',
  },
  {
    id: 'cite-annuaire', path: '/espace-cite/annuaire', label: 'Annuaire de l’université',
    section: SECTIONS.CITE.id, access: { capability: 'report:read' },
    inNav: true, inPalette: true, icon: 'Contact', parent: 'espace-cite',
  },

  // ── Gouvernance ─────────────────────────────────────────────────────────
  {
    id: 'gouvernance', path: '/gouvernance', label: 'Attestations',
    aliases: ['/gouvernance/attestations'], section: SECTIONS.GOUVERNANCE.id,
    access: { capability: 'certificate:issue' },
    inNav: true, inPalette: true, icon: 'Award',
  },
  {
    id: 'gouvernance-exclusions', path: '/gouvernance/exclusions', label: 'Exclusions',
    section: SECTIONS.GOUVERNANCE.id, access: { capability: 'exclusion:review' },
    inNav: true, inPalette: true, icon: 'UserX', parent: 'gouvernance',
  },
  {
    id: 'gouvernance-figures', path: '/gouvernance/figures', label: 'Figures emblématiques',
    section: SECTIONS.GOUVERNANCE.id, access: { capability: 'member:toggleEmblematic' },
    inNav: true, inPalette: true, icon: 'Star', parent: 'gouvernance',
  },
  {
    // `GET /universities/:id/census-history` n'etait affiche nulle part : les
    // clubs declaraient leurs effectifs dans le vide, et `census:validate`
    // n'avait aucun bouton.
    // Sans `parent` : la destination `gouvernance` s'appelle « Attestations »,
    // et un fil d'Ariane « Gouvernance > Attestations > Recensements » ferait
    // passer cet ecran pour une sous-page de l'emission d'attestations.
    id: 'gouvernance-recensements', path: '/gouvernance/recensements', label: 'Recensements',
    section: SECTIONS.GOUVERNANCE.id, access: { capability: 'census:read' },
    inNav: true, inPalette: true, icon: 'ClipboardCheck',
  },
  {
    // Le poste GOUVERNANT_PAYS existait sans le moindre ecran national.
    id: 'gouvernance-pays', path: '/gouvernance/pays', label: 'Universités du pays',
    section: SECTIONS.GOUVERNANCE.id, access: { capability: 'country:govern' },
    inNav: true, inPalette: true, icon: 'Globe2',
  },
  {
    id: 'tresorerie', path: '/tresorerie', label: 'Trésorerie',
    section: SECTIONS.GOUVERNANCE.id, access: { capability: 'treasury:read' },
    inNav: true, inPalette: true, icon: 'Wallet',
  },
  {
    id: 'admin', path: '/admin', label: 'Console d’administration',
    section: SECTIONS.GOUVERNANCE.id, access: { capability: 'admin:access' },
    inNav: true, inPalette: true, icon: 'Shield',
  },

  // ── Soutenir FIERI — page publique de mécénat ───────────────────────────
  // Elle n'est plus dans la navigation de l'espace connecté : c'est une page
  // tournée vers l'extérieur, pas un outil interne (constat F08).
  {
    id: 'soutiens', path: '/soutiens', label: 'Soutenir FIERI',
    section: SECTIONS.PUBLIC.id, access: PUBLIC,
    inNav: false, inPalette: true, icon: 'HeartHandshake',
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
    // `POST /projects` etait ouvert au CHERCHEUR et au RESPONSABLE depuis le
    // debut, sans aucun ecran pour l'appeler.
    id: 'projet-nouveau', path: '/projects/nouveau', label: 'Créer un projet',
    section: SECTIONS.RECHERCHE.id, access: { capability: 'project:create' },
    inNav: true, inPalette: true, icon: 'FolderPlus', parent: 'projects',
  },
  {
    // Le fonds scientifique : `POST /publications` n'avait pas d'ecran, et
    // `GET /publications` n'etait lu nulle part.
    // Sans `parent` : une publication n'est pas une sous-page du catalogue de
    // projets, et le fil d'Ariane ne doit pas le laisser croire.
    id: 'publication-nouvelle', path: '/publications/nouvelle', label: 'Déposer une publication',
    section: SECTIONS.RECHERCHE.id, access: { capability: 'publication:create' },
    inNav: true, inPalette: true, icon: 'FilePlus2',
  },
  {
    id: 'workshops', path: '/formations', label: 'Formations',
    aliases: ['/workshops'], section: SECTIONS.RECHERCHE.id, access: PUBLIC,
    inNav: true, inPalette: true, icon: 'GraduationCap',
  },
  {
    // `POST /formations` : le catalogue de l'Academie ne pouvait grandir que
    // par la base de donnees.
    id: 'formation-nouvelle', path: '/formations/nouvelle', label: 'Créer une formation',
    section: SECTIONS.RECHERCHE.id, access: { capability: 'formation:create' },
    inNav: true, inPalette: true, icon: 'GraduationCap', parent: 'workshops',
  },
  {
    id: 'opportunities', path: '/opportunities', label: 'Opportunités',
    section: SECTIONS.RECHERCHE.id, access: PUBLIC,
    inNav: true, inPalette: true, icon: 'Briefcase',
  },
  {
    id: 'projet-taches', path: '/projets/taches', label: 'Tâches de projet',
    section: SECTIONS.RECHERCHE.id, access: { capability: 'task:manage' },
    inNav: true, inPalette: true, icon: 'ListChecks',
  },
  {
    // Le vrai droit du MENTOR : `POST /badges/award` et `DELETE /badges/:id`
    // n'etaient appeles nulle part, et le raccourci du tableau de bord menait
    // aux Challenges, qui ne distribuent aucun badge.
    id: 'badges', path: '/badges', label: 'Badges d’honneur',
    section: SECTIONS.COMMUNAUTE.id,
    access: { anyOf: ['badge:award', 'badge:revoke'] },
    inNav: true, inPalette: true, icon: 'Award',
  },
  {
    id: 'candidatures', path: '/candidatures', label: 'Candidatures reçues',
    section: SECTIONS.RECHERCHE.id, access: { capability: 'application:review' },
    inNav: true, inPalette: true, icon: 'Inbox',
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
    // `POST /events` et `PUT /events/:id` existaient depuis le debut, ouverts
    // au RESPONSABLE et a l'ADMIN, sans aucune interface pour les appeler.
    id: 'evenement-nouveau', path: '/evenements/nouveau', label: 'Créer un événement',
    section: SECTIONS.COMMUNAUTE.id, access: { capability: 'event:manage' },
    inNav: true, inPalette: true, icon: 'CalendarPlus', parent: 'events',
  },
  {
    id: 'challenges', path: '/challenges', label: 'Challenges',
    section: SECTIONS.COMMUNAUTE.id, access: PUBLIC,
    inNav: true, inPalette: true, icon: 'Trophy',
  },
  {
    id: 'researchers', path: '/researchers', label: 'Annuaire des chercheurs',
    section: SECTIONS.COMMUNAUTE.id, access: PUBLIC,
    inNav: true, inPalette: true, icon: 'Contact',
  },
  {
    // C'est ici que se lisent les responsables — postes de gouvernance de
    // l'université et responsables de club. La page est publique, mais elle
    // n'était dans AUCUN menu de l'espace connecté : la barre latérale
    // remplace la navbar dès la connexion, et l'entrée disparaissait avec
    // elle. On la voyait donc en visiteur, plus du tout en membre.
    id: 'cite', path: '/cite', label: 'Organisation CITE',
    aliases: ['/cite-integration'], section: SECTIONS.COMMUNAUTE.id, access: PUBLIC,
    inNav: true, inPalette: true, icon: 'Layers',
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
  paf: 'programmes',
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
