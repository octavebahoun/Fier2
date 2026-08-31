/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FIERI — Table des capacités : SOURCE UNIQUE du contrôle d'accès côté client.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Une capacité est déclarée ICI, une seule fois. La route, l'entrée de menu et
 * l'écran la lisent tous les trois au même endroit. Il devient impossible
 * d'afficher un lien vers une page qui refusera de s'ouvrir.
 *
 * ── Le modèle : DEUX axes, pas trois ──────────────────────────────────────
 *
 *   1. RÔLE DE COMPTE — ce que la personne EST. Un seul, plat, non hiérarchique.
 *      Miroir de `Member.role` (String) côté backend.
 *
 *   2. POSTE SCOPÉ — ce que la personne ADMINISTRE, et OÙ. Miroir de
 *      `UniversityPost` / `CountryPost` (un poste maximum par membre et par
 *      axe, contrainte `memberId @unique`).
 *
 *   La responsabilité de club (`responsibleClubIds`) est un scope du même
 *   genre : elle désigne un périmètre, pas un grade.
 *
 * ── Pourquoi la hiérarchie de rôles a disparu ─────────────────────────────
 *
 *   Le `RolesGuard` du backend teste `requiredRoles.includes(member.role)` —
 *   une correspondance EXACTE. Un graphe d'héritage côté client accordait donc
 *   des écrans que l'API refusait ensuite. Chaque capacité liste maintenant ses
 *   rôles explicitement, exactement comme le décorateur `@Roles(...)`.
 *
 * ── Règle ADMIN ───────────────────────────────────────────────────────────
 *
 *   ADMIN passe partout : le `RolesGuard` le liste sur chaque route, et le
 *   `UniversityPostGuard` le fait sortir du scope universitaire
 *   (« Un ADMIN global n'est pas contraint par le scope universitaire »).
 *   Inutile donc de répéter 'ADMIN' dans chaque entrée : `resolve()` s'en charge.
 *
 * ── Ajouter un droit ──────────────────────────────────────────────────────
 *
 *   1. Ajouter l'entrée ici, avec `route:` = la route serveur qu'elle reflète.
 *   2. L'utiliser via `can('ma:capacite', ctx)`.
 *   Une capacité déclarée mais jamais appelée fait échouer `capabilities.test.js`.
 */

// ── Axe 1 : rôles de compte ────────────────────────────────────────────────
// Valeurs autorisées de `Member.role`. Le backend n'en émet pas d'autres :
// cf. prisma/schema.prisma → `role String @default("ETUDIANT")`.
export const ROLES = {
  ETUDIANT:       'ETUDIANT',
  CHERCHEUR:      'CHERCHEUR',
  MENTOR:         'MENTOR',
  CHEF_DE_PROJET: 'CHEF_DE_PROJET',
  RESPONSABLE:    'RESPONSABLE',
  ADMIN:          'ADMIN',
}

export const ROLE_LIST = Object.values(ROLES)

// ── Axe 2 : postes scopés ──────────────────────────────────────────────────
export const UNIVERSITY_POSTS = {
  CHEF_UNIVERSITAIRE: 'CHEF_UNIVERSITAIRE',
  SECRETAIRE:         'SECRETAIRE',
  TRESORIER:          'TRESORIER',
  RESP_COMMUNICATION: 'RESP_COMMUNICATION',
}

export const COUNTRY_POSTS = {
  GOUVERNANT_PAYS: 'GOUVERNANT_PAYS',
}

export const UNIVERSITY_POST_LIST = Object.values(UNIVERSITY_POSTS)
export const COUNTRY_POST_LIST = Object.values(COUNTRY_POSTS)

/**
 * Vocabulaire mort — identifiants qui ont circulé dans le code sans jamais
 * exister côté backend. Conservés ici UNIQUEMENT pour que `normalizeRole()`
 * sache les reconnaître et les corriger au lieu de verrouiller le compte.
 * Ne jamais s'en servir dans une condition.
 */
export const LEGACY_ROLE_ALIASES = {
  ADMINISTRATEUR:     ROLES.ADMIN,        // ResearcherProfile.jsx
  ADMIN_UNIVERSITAIRE: null,              // ResearchClubs / EspaceCITE — c'est un POSTE
  CHEF_UNIVERSITAIRE:  null,              // idem : poste d'université, pas un rôle
  SECRETAIRE:          null,              // idem
  RESPONSABLE_CLUB:    ROLES.RESPONSABLE, // @Roles() backend, absent de Member.role
  VISITEUR:            null,              // « non connecté » n'est pas un rôle stocké
}

/**
 * Rôles hérités qui sont en réalité des POSTES d'université. Si le backend (ou
 * une session en cache) renvoie l'un d'eux comme `role`, on le relit comme un
 * poste au lieu de refuser l'accès — c'est la correction du constat F01, où un
 * Chef Universitaire se retrouvait éjecté de son propre tableau de bord.
 */
export const ROLE_TO_UNIVERSITY_POST = {
  CHEF_UNIVERSITAIRE:  UNIVERSITY_POSTS.CHEF_UNIVERSITAIRE,
  ADMIN_UNIVERSITAIRE: UNIVERSITY_POSTS.CHEF_UNIVERSITAIRE,
  SECRETAIRE:          UNIVERSITY_POSTS.SECRETAIRE,
}

// ── Portées ────────────────────────────────────────────────────────────────
export const SCOPE = {
  GLOBAL:     'global',      // aucun périmètre : le rôle suffit
  UNIVERSITY: 'university',  // exige ctx.universityId
  COUNTRY:    'country',     // exige ctx.countryId
  CLUB:       'club',        // exige ctx.clubId
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LES CAPACITÉS
 * ═══════════════════════════════════════════════════════════════════════════
 * Chaque entrée reflète une garde réelle du backend (`route:` la nomme).
 * `roles` et `universityPosts` sont des correspondances EXACTES, sauf ADMIN.
 */
export const CAPABILITIES = {

  // ── Participation — tout membre authentifié ──────────────────────────────
  // Pas de `roles` : la seule exigence est d'être connecté. On ne déclare ici
  // que ce qui APPORTE une information. Rejoindre un club, s'inscrire à un
  // atelier ou suivre un projet ne demandent rien de plus qu'une session : en
  // faire des capacités aurait rempli la table d'entrées qui disent toutes la
  // même chose — c'est précisément ce qui l'avait rendue décorative (F02).
  'space:access': {
    label: 'Accéder à son espace membre',
    scope: SCOPE.GLOBAL,
    route: 'GET /members/me',
  },
  'directory:viewContacts': {
    label: 'Voir les coordonnées de l’annuaire',
    scope: SCOPE.GLOBAL,
    route: 'GET /members',
  },
  'profile:editOwn': {
    label: 'Modifier sa propre fiche',
    scope: SCOPE.GLOBAL,
    route: 'PUT /researchers/me',
  },

  // ── Production scientifique — CHERCHEUR ──────────────────────────────────
  'news:submit': {
    label: 'Soumettre un article au journal',
    roles: [ROLES.CHERCHEUR],
    scope: SCOPE.GLOBAL,
    route: 'POST /news',
  },
  'opportunity:create': {
    label: 'Publier une opportunité R&D',
    roles: [ROLES.CHERCHEUR],
    scope: SCOPE.GLOBAL,
    route: 'POST /opportunities',
  },
  'formation:create': {
    label: 'Créer une formation',
    roles: [ROLES.CHERCHEUR],
    scope: SCOPE.GLOBAL,
    route: 'POST /formations',
  },
  'publication:create': {
    label: 'Déposer une publication',
    roles: [ROLES.CHERCHEUR],
    scope: SCOPE.GLOBAL,
    route: 'POST /publications',
  },
  'project:create': {
    label: 'Créer un projet R&D',
    roles: [ROLES.CHERCHEUR, ROLES.RESPONSABLE],
    scope: SCOPE.GLOBAL,
    route: 'POST /projects',
  },

  // ── Encadrement — MENTOR ─────────────────────────────────────────────────
  // Le vrai droit du MENTOR, jusqu'ici sans aucune interface (constat F03).
  'badge:award': {
    label: 'Attribuer un badge à un membre',
    roles: [ROLES.MENTOR],
    scope: SCOPE.GLOBAL,
    route: 'POST /badges/award',
  },
  'badge:revoke': {
    label: 'Retirer un badge',
    roles: [ROLES.MENTOR],
    scope: SCOPE.GLOBAL,
    route: 'DELETE /badges/:id',
  },

  // ── Pilotage d'équipe — CHEF_DE_PROJET ───────────────────────────────────
  // Idem : droits réels du chef de projet, sans interface jusqu'ici.
  'task:manage': {
    label: 'Créer et affecter les tâches d’un projet',
    roles: [ROLES.CHEF_DE_PROJET],
    scope: SCOPE.GLOBAL,
    route: 'POST /tasks · PUT /tasks/:id · PATCH /tasks/:id/assign',
  },
  'application:review': {
    label: 'Examiner les candidatures reçues',
    roles: [ROLES.CHEF_DE_PROJET],
    scope: SCOPE.GLOBAL,
    route: 'PATCH /applications/:id/status',
  },

  // ── Animation de club — RESPONSABLE (rôle) ───────────────────────────────
  'membership:review': {
    label: 'Valider ou refuser les adhésions',
    roles: [ROLES.RESPONSABLE],
    scope: SCOPE.CLUB,
    route: 'PATCH /memberships/requests/:requestId/approve',
  },
  'membership:remove': {
    label: 'Retirer un membre du club',
    roles: [ROLES.RESPONSABLE],
    scope: SCOPE.CLUB,
    route: 'DELETE /memberships/:clubId/user/:userId',
  },
  'club:edit': {
    label: 'Modifier la fiche du club',
    roles: [ROLES.RESPONSABLE],
    scope: SCOPE.CLUB,
    route: 'PUT /clubs/:id',
  },
  'event:manage': {
    label: 'Créer et modifier les événements',
    roles: [ROLES.RESPONSABLE],
    scope: SCOPE.GLOBAL,
    route: 'POST /events · PUT /events/:id',
  },
  'census:submit': {
    label: 'Transmettre le recensement du club',
    roles: [ROLES.RESPONSABLE],
    scope: SCOPE.CLUB,
    route: 'POST /clubs/:id/submit-census',
  },
  'activity:assign': {
    label: 'Assigner une activité à un membre',
    roles: [ROLES.RESPONSABLE],
    scope: SCOPE.CLUB,
    route: 'POST /clubs/:id/assigned-activities',
  },
  'report:submit': {
    label: 'Déposer le rapport d’activité du club',
    roles: [ROLES.RESPONSABLE],
    scope: SCOPE.CLUB,
    route: 'POST /clubs/:id/activity-reports',
  },
  'challenge:create': {
    label: 'Lancer un challenge de club',
    roles: [ROLES.RESPONSABLE],
    scope: SCOPE.CLUB,
    route: 'POST /clubs/:id/challenges',
  },

  // ── Secrétariat d'université — poste SECRETAIRE ──────────────────────────
  'report:read': {
    label: 'Consulter les rapports d’activité de l’université',
    universityPosts: [UNIVERSITY_POSTS.SECRETAIRE, UNIVERSITY_POSTS.CHEF_UNIVERSITAIRE],
    scope: SCOPE.UNIVERSITY,
    route: 'GET /universities/:id/activity-reports',
  },
  'census:read': {
    label: 'Consulter l’historique des recensements',
    universityPosts: [UNIVERSITY_POSTS.SECRETAIRE, UNIVERSITY_POSTS.CHEF_UNIVERSITAIRE],
    scope: SCOPE.UNIVERSITY,
    route: 'GET /universities/:id/census-history',
  },
  'census:validate': {
    label: 'Valider un recensement',
    universityPosts: [UNIVERSITY_POSTS.SECRETAIRE],
    scope: SCOPE.UNIVERSITY,
    route: 'POST /universities/:id/validate-census/:censusId',
  },

  // ── Trésorerie d'université — poste TRESORIER ────────────────────────────
  'treasury:read': {
    label: 'Consulter le grand livre de l’université',
    universityPosts: [UNIVERSITY_POSTS.TRESORIER, UNIVERSITY_POSTS.CHEF_UNIVERSITAIRE],
    scope: SCOPE.UNIVERSITY,
    route: 'GET /universities/:id/treasury',
  },
  'treasury:write': {
    label: 'Enregistrer une opération de trésorerie',
    universityPosts: [UNIVERSITY_POSTS.TRESORIER],
    scope: SCOPE.UNIVERSITY,
    route: 'POST /universities/:id/treasury/transactions',
  },

  // ── Gouvernance d'université — poste CHEF_UNIVERSITAIRE ──────────────────
  'certificate:issue': {
    label: 'Émettre une attestation officielle',
    universityPosts: [UNIVERSITY_POSTS.CHEF_UNIVERSITAIRE],
    scope: SCOPE.UNIVERSITY,
    route: 'POST /universities/:id/certificates',
  },
  'exclusion:review': {
    label: 'Traiter les demandes d’exclusion',
    universityPosts: [UNIVERSITY_POSTS.CHEF_UNIVERSITAIRE],
    scope: SCOPE.UNIVERSITY,
    route: 'GET /universities/:id/deletion-requests',
  },
  'hackathon:create': {
    label: 'Ouvrir un hackathon universitaire',
    universityPosts: [UNIVERSITY_POSTS.CHEF_UNIVERSITAIRE],
    scope: SCOPE.UNIVERSITY,
    route: 'POST /universities/:id/hackathons',
  },
  'member:toggleEmblematic': {
    label: 'Désigner une figure emblématique',
    universityPosts: [UNIVERSITY_POSTS.CHEF_UNIVERSITAIRE],
    scope: SCOPE.UNIVERSITY,
    route: 'POST /members/:id/toggle-emblematic',
  },
  'signature:upload': {
    label: 'Téléverser sa griffe officielle',
    universityPosts: [UNIVERSITY_POSTS.CHEF_UNIVERSITAIRE],
    scope: SCOPE.UNIVERSITY,
    route: 'POST /members/upload-signature',
  },

  // ── Communication d'université — poste RESP_COMMUNICATION ────────────────
  // Poste jusqu'ici sans aucune entrée de navigation (constat F03).
  'event:publishSocial': {
    label: 'Publier un événement sur les réseaux',
    universityPosts: [UNIVERSITY_POSTS.RESP_COMMUNICATION, UNIVERSITY_POSTS.CHEF_UNIVERSITAIRE],
    scope: SCOPE.UNIVERSITY,
    route: 'POST /events/:id/publish-social',
  },

  // ── Gouvernance nationale — poste GOUVERNANT_PAYS ────────────────────────
  'country:govern': {
    label: 'Superviser les universités du pays',
    countryPosts: [COUNTRY_POSTS.GOUVERNANT_PAYS],
    scope: SCOPE.COUNTRY,
    route: 'GET /countries/:id/universities',
  },

  // ── Administration globale — ADMIN uniquement ────────────────────────────
  'admin:access': {
    label: 'Ouvrir la console d’administration',
    roles: [],                      // ADMIN seul (voir la règle ADMIN plus haut)
    scope: SCOPE.GLOBAL,
    route: 'GET /members/:id',
  },
  'news:moderate': {
    label: 'Approuver ou rejeter un article',
    roles: [],
    scope: SCOPE.GLOBAL,
    route: 'PATCH /news/:id/approve',
  },
  'member:setRole': {
    label: 'Changer le rôle d’un membre',
    roles: [],
    scope: SCOPE.GLOBAL,
    route: 'PATCH /members/:id/role',
  },
  'member:setPost': {
    label: 'Attribuer un poste de gouvernance',
    roles: [],
    scope: SCOPE.GLOBAL,
    route: 'PUT /members/:id/university-post',
  },
  'org:manage': {
    label: 'Gérer pays, universités, filières et clubs',
    roles: [],
    scope: SCOPE.GLOBAL,
    route: 'POST /countries · POST /universities · POST /branches · POST /clubs',
  },
}

export const CAPABILITY_LIST = Object.keys(CAPABILITIES)

/**
 * Capacités qui reflètent une garde réelle du backend mais qui n'ont PAS encore
 * d'écran. La table doit rester le miroir complet du serveur — mais un droit
 * sans interface est une dette, pas une fonctionnalité.
 *
 * `capabilities.test.js` vérifie que cette liste correspond EXACTEMENT aux
 * capacités non utilisées : elle ne peut donc pas grossir en silence, et toute
 * capacité qu'on branche à un écran doit en être retirée.
 *
 * C'est le carnet de dette du chantier 02.
 */
export const PENDING_UI = [
  'badge:revoke',         // MENTOR — retrait de badge absent de l'interface
  'census:read',          // historique des recensements jamais affiché
  'club:edit',            // édition de la fiche club absente
  'country:govern',       // GOUVERNANT_PAYS — aucun écran national
  'formation:create',     // création de formation absente
  'membership:remove',    // retrait d'un membre absent de l'espace club
  'org:manage',           // pays / universités / filières / clubs : aucun écran
  'project:create',       // création de projet absente
  'publication:create',   // dépôt de publication absent
]
