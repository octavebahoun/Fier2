/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FIERI — Résolution des droits. Fonctions pures, sans React.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Tout passe par `resolve(identity, capability, ctx)`. `AuthContext` n'est
 * qu'une façade React au-dessus de ce fichier ; les tests l'attaquent
 * directement, sans monter de composant.
 */

import {
  CAPABILITIES,
  ROLES,
  ROLE_LIST,
  ROLE_TO_UNIVERSITY_POST,
  LEGACY_ROLE_ALIASES,
  SCOPE,
} from './capabilities.js'

const upper = (v) => String(v ?? '').trim().toUpperCase()

/**
 * normalizeRole(raw) — traduit une valeur de rôle quelconque en rôle connu.
 *
 * Corrige deux dérives constatées à l'audit :
 *   • F01 — `CHEF_UNIVERSITAIRE` / `SECRETAIRE` étaient traités comme des rôles.
 *     Absents du graphe d'héritage, ils rendaient `hasMinRole()` faux pour tout,
 *     et `ProtectedRoute` éjectait la personne de son propre tableau de bord.
 *     Ils sont désormais relus comme des POSTES d'université.
 *   • F05 — `ADMINISTRATEUR`, `ADMIN_UNIVERSITAIRE`, `RESPONSABLE_CLUB` :
 *     du vocabulaire qui n'a jamais existé côté backend.
 *
 * Un rôle inconnu ne verrouille JAMAIS le compte : la personne retombe sur
 * ETUDIANT (membre authentifié), et un avertissement signale la dérive.
 *
 * @returns {{ role: string, impliedUniversityPost: string|null, wasUnknown: boolean }}
 */
export function normalizeRole(raw) {
  const value = upper(raw)
  if (!value) return { role: ROLES.ETUDIANT, impliedUniversityPost: null, wasUnknown: false }

  if (ROLE_LIST.includes(value)) {
    return { role: value, impliedUniversityPost: null, wasUnknown: false }
  }

  // Rôle qui est en réalité un poste : on le déplace sur le bon axe.
  const impliedPost = ROLE_TO_UNIVERSITY_POST[value] ?? null
  if (impliedPost) {
    return { role: ROLES.ETUDIANT, impliedUniversityPost: impliedPost, wasUnknown: false }
  }

  // Alias historique explicitement recensé.
  const alias = LEGACY_ROLE_ALIASES[value]
  if (alias) return { role: alias, impliedUniversityPost: null, wasUnknown: false }
  if (value in LEGACY_ROLE_ALIASES) {
    return { role: ROLES.ETUDIANT, impliedUniversityPost: null, wasUnknown: false }
  }

  if (typeof console !== 'undefined') {
    console.warn(
      `[FIERI access] Rôle inconnu « ${value} » — traité comme ETUDIANT. ` +
      `Ajoutez-le à ROLES ou à LEGACY_ROLE_ALIASES dans src/auth/capabilities.js.`,
    )
  }
  return { role: ROLES.ETUDIANT, impliedUniversityPost: null, wasUnknown: true }
}

/**
 * readIdentity(user) — projette le profil serveur sur les deux axes du modèle.
 *
 * Absorbe les formes hétérogènes rencontrées dans le code : `universityPost`
 * est tantôt un objet `{ post, universityId }`, tantôt une chaîne. Comparer
 * l'objet à une chaîne était toujours faux — c'était le constat F05, qui rendait
 * muettes les vérifications de `ResearchClubs.jsx`.
 */
export function readIdentity(user) {
  if (!user) {
    return {
      authenticated: false,
      role: null,
      isAdmin: false,
      universityPost: null,
      universityId: null,
      countryPost: null,
      countryId: null,
      responsibleClubIds: [],
    }
  }

  const { role, impliedUniversityPost } = normalizeRole(user.role)

  const rawUniversityPost = user.universityPost
  const declaredPost =
    typeof rawUniversityPost === 'string'
      ? upper(rawUniversityPost)
      : upper(rawUniversityPost?.post) || null

  const rawCountryPost = user.countryPost
  const countryPost =
    typeof rawCountryPost === 'string'
      ? upper(rawCountryPost)
      : upper(rawCountryPost?.post) || null

  const universityId =
    user.universityId ??
    (typeof rawUniversityPost === 'object' ? rawUniversityPost?.universityId : null) ??
    null

  const countryId =
    user.countryId ??
    (typeof rawCountryPost === 'object' ? rawCountryPost?.countryId : null) ??
    null

  return {
    authenticated: true,
    role,
    isAdmin: role === ROLES.ADMIN,
    universityPost: declaredPost || impliedUniversityPost || null,
    universityId: universityId === null ? null : Number(universityId),
    countryPost: countryPost || null,
    countryId: countryId === null ? null : Number(countryId),
    responsibleClubIds: Array.isArray(user.responsibleClubIds)
      ? user.responsibleClubIds.map(String)
      : [],
  }
}

/** Motifs de refus — servent aussi à écrire des écrans « pourquoi » utiles. */
export const DENY = {
  UNKNOWN_CAPABILITY: 'unknown-capability',
  NOT_AUTHENTICATED:  'not-authenticated',
  WRONG_ROLE:         'wrong-role',
  WRONG_POST:         'wrong-post',
  WRONG_SCOPE:        'wrong-scope',
  NOT_CLUB_MANAGER:   'not-club-manager',
}

/**
 * explain(identity, capability, ctx) — la fonction de fond.
 *
 * Renvoie `{ allowed, reason, capability }`. `resolve()` n'en garde que le
 * booléen ; les écrans peuvent afficher un motif au lieu de masquer en silence
 * (règle UX `empty-nav-state` : expliquer plutôt que cacher).
 *
 * ── Portée absente = « quelque part » ────────────────────────────────────
 *   `can('treasury:read')` sans `universityId` répond à la question du MENU :
 *   « cette personne peut-elle le faire quelque part ? ». Avec `universityId`,
 *   il répond à la question de l'ÉCRAN : « ici, précisément ? ».
 *   Le menu montre donc exactement ce que l'écran acceptera d'ouvrir.
 */
export function explain(identity, capability, ctx = {}) {
  const spec = CAPABILITIES[capability]
  if (!spec) {
    if (typeof console !== 'undefined') {
      console.warn(`[FIERI access] Capacité inconnue « ${capability} » → refus.`)
    }
    return { allowed: false, reason: DENY.UNKNOWN_CAPABILITY, capability }
  }

  if (!identity?.authenticated) {
    return { allowed: false, reason: DENY.NOT_AUTHENTICATED, capability }
  }

  // ADMIN global : listé sur chaque @Roles() et exempté du scope universitaire.
  if (identity.isAdmin) return { allowed: true, reason: null, capability }

  const wantsRole = Array.isArray(spec.roles)
  const wantsUniversityPost = Array.isArray(spec.universityPosts)
  const wantsCountryPost = Array.isArray(spec.countryPosts)

  // Capacité de simple participation : être connecté suffit.
  if (!wantsRole && !wantsUniversityPost && !wantsCountryPost) {
    return { allowed: true, reason: null, capability }
  }

  // `roles: []` signifie « ADMIN seul » — l'ADMIN est déjà sorti plus haut.
  if (wantsRole && spec.roles.length === 0 && !wantsUniversityPost && !wantsCountryPost) {
    return { allowed: false, reason: DENY.WRONG_ROLE, capability }
  }

  const roleMatches = wantsRole && spec.roles.includes(identity.role)
  const universityPostMatches =
    wantsUniversityPost && spec.universityPosts.includes(identity.universityPost)
  const countryPostMatches =
    wantsCountryPost && spec.countryPosts.includes(identity.countryPost)

  if (!roleMatches && !universityPostMatches && !countryPostMatches) {
    if (wantsUniversityPost || wantsCountryPost) {
      return { allowed: false, reason: DENY.WRONG_POST, capability }
    }
    return { allowed: false, reason: DENY.WRONG_ROLE, capability }
  }

  // ── Vérification de la portée ──────────────────────────────────────────
  switch (spec.scope) {
    case SCOPE.UNIVERSITY: {
      if (!universityPostMatches) break // droit obtenu par le rôle : pas de scope à vérifier
      const target = ctx.universityId
      if (target === undefined || target === null) break // question « quelque part »
      if (Number(target) !== identity.universityId) {
        return { allowed: false, reason: DENY.WRONG_SCOPE, capability }
      }
      break
    }
    case SCOPE.COUNTRY: {
      if (!countryPostMatches) break
      const target = ctx.countryId
      if (target === undefined || target === null) break
      if (Number(target) !== identity.countryId) {
        return { allowed: false, reason: DENY.WRONG_SCOPE, capability }
      }
      break
    }
    case SCOPE.CLUB: {
      if (!roleMatches) break
      const clubs = identity.responsibleClubIds
      const target = ctx.clubId
      if (target === undefined || target === null) {
        // Question « quelque part » : responsable d'au moins un club ?
        if (clubs.length === 0) {
          return { allowed: false, reason: DENY.NOT_CLUB_MANAGER, capability }
        }
        break
      }
      if (!clubs.includes(String(target))) {
        return { allowed: false, reason: DENY.NOT_CLUB_MANAGER, capability }
      }
      break
    }
    default:
      break
  }

  return { allowed: true, reason: null, capability }
}

/** resolve() — la forme booléenne, celle que l'UI consomme. */
export function resolve(identity, capability, ctx = {}) {
  return explain(identity, capability, ctx).allowed
}

/** Message lisible pour un écran de refus (au lieu d'un mur muet). */
export function denyMessage(reason, capability) {
  const label = CAPABILITIES[capability]?.label
  switch (reason) {
    case DENY.NOT_AUTHENTICATED:
      return 'Connectez-vous pour accéder à cette page.'
    case DENY.WRONG_POST:
      return `Cette page est réservée à un poste de gouvernance${label ? ` (${label.toLowerCase()})` : ''}.`
    case DENY.WRONG_SCOPE:
      return 'Vous administrez une autre université : cette page ne concerne pas votre périmètre.'
    case DENY.NOT_CLUB_MANAGER:
      return 'Cette page est réservée aux responsables du club concerné.'
    case DENY.UNKNOWN_CAPABILITY:
      return 'Droit inconnu — cette page est indisponible.'
    default:
      return `Votre rôle ne permet pas cette action${label ? ` : ${label.toLowerCase()}` : ''}.`
  }
}
