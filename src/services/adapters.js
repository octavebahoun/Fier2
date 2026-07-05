// ─────────────────────────────────────────────────────────────────────────────
// Couche anti-corruption : normalise les réponses du backend réel vers la forme
// stable attendue par les pages (héritée du mock). On y concentre TOUS les écarts
// de nommage backend↔front, plutôt que de les disperser dans le JSX des 18 pages.
//
// Règle : on privilégie le champ backend, avec repli sur l'ancien nom mock (utile
// si le backend enrichit ses réponses plus tard), puis une valeur par défaut sûre.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Chercheur. Backend liste : { id, firstName, lastName, bio, skills, followers }.
 * Backend détail : + { projects, distinctions }. Backend /me : { id, bio, skills, avatarUrl }.
 */
export function normalizeResearcher(r) {
  if (!r || typeof r !== 'object') return r
  const fullName = `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim()
  return {
    ...r,
    id: r.id,
    name: fullName || r.name || '',
    avatar: r.avatarUrl ?? r.avatar ?? null,
    bio: r.bio ?? '',
    specialties: r.skills ?? r.specialties ?? [],
    stars: r.followers ?? r.stars ?? 0,
    projectsCount: Array.isArray(r.projects) ? r.projects.length : (r.projectsCount ?? 0),
    publicationsCount: r.publicationsCount ?? 0,
    role: r.role ?? 'CHERCHEUR',
    pole: r.pole ?? '',
    university: r.university ?? ''
  }
}
