// ─────────────────────────────────────────────────────────────────────────────
// Couche anti-corruption : normalise les réponses du backend réel vers la forme
// stable attendue par les pages (héritée du mock). On y concentre TOUS les écarts
// de nommage backend↔front, plutôt que de les disperser dans le JSX des 18 pages.
//
// Règle : on privilégie le champ backend, avec repli sur l'ancien nom mock (utile
// si le backend enrichit ses réponses plus tard), puis une valeur par défaut sûre.
// ─────────────────────────────────────────────────────────────────────────────


/**
 * Club. Backend liste : { id, name, discipline, memberCount }.
 * Backend détail : { id, name, description, members }.
 */
export function normalizeClub(c) {
  if (!c || typeof c !== 'object') return c
  return {
    ...c,
    id: c.id,
    title: c.name ?? c.title ?? '',
    kicker: c.name ?? c.kicker ?? '',
    desc: c.description ?? c.desc ?? c.discipline ?? '',
    membersCount: c.memberCount ?? c.membersCount ?? 0,
    divisions: c.divisions ?? [],
    projetPhare: c.projetPhare ?? '',
    joined: c.joined ?? false,
    // Responsable du pôle (chef de club) : id du membre + objet { firstName, lastName }.
    // Défaut null tant que le backend déployé n'expose pas encore ces champs.
    responsibleId: c.responsibleId ?? null,
    responsible: c.responsible ?? null
  }
}

/**
 * Atelier. Backend : { id, title, instructor, capacity, registeredCount, waitlistCount }.
 * Les champs « par-utilisateur » (registered, inWaitlist, position) ne sont pas
 * fournis par la liste : défauts sûrs. La liste nominative de file d'attente
 * (waitlistUsers) n'existe pas côté backend → tableau vide (fonctionnalité dégradée).
 */
export function normalizeWorkshop(w) {
  if (!w || typeof w !== 'object') return w
  const capacity = w.capacity ?? w.totalPlaces ?? 0
  const registeredCount = w.registeredCount ?? 0
  return {
    ...w,
    id: w.id,
    title: w.title ?? '',
    instructor: w.instructor ?? '',
    totalPlaces: capacity,
    placesLeft: w.placesLeft ?? Math.max(0, capacity - registeredCount),
    registered: w.registered ?? false,
    inWaitlist: w.inWaitlist ?? false,
    waitlistPosition: w.waitlistPosition ?? null,
    waitlistUsers: w.waitlistUsers ?? [],
    level: w.level ?? '',
    duration: w.duration ?? '',
    desc: w.desc ?? w.description ?? '',
    date: w.date ?? '',
    clubId: w.clubId ?? null
  }
}

/**
 * Événement. Backend : { id, title, date, isLive, streamUrl }.
 * Les métadonnées riches (lieu, dotation, timeline, tagline) et l'état
 * d'inscription ne sont pas fournis → défauts sûrs.
 */
export function normalizeEvent(ev) {
  if (!ev || typeof ev !== 'object') return ev
  return {
    ...ev,
    id: ev.id,
    title: ev.title ?? '',
    date: ev.date ?? '',
    isLive: ev.isLive ?? false,
    liveUrl: ev.streamUrl ?? ev.liveUrl ?? '',
    registered: ev.registered ?? false,
    prizePool: ev.prizePool ?? '',
    location: ev.location ?? '',
    timeline: ev.timeline ?? [],
    tagline: ev.tagline ?? '',
    participantsCount: ev.participantsCount ?? 0,
    desc: ev.desc ?? ev.description ?? ''
  }
}

// Le backend peut renvoyer `author` en string OU en objet { id, firstName, lastName }
// (évolution API 2026-07-06). On aplatit TOUJOURS en nom affichable pour éviter
// « Objects are not valid as a React child », et on conserve l'id séparément.
export function authorName(author) {
  if (author && typeof author === 'object') {
    return `${author.firstName ?? ''} ${author.lastName ?? ''}`.trim() || 'Anonyme'
  }
  return author ?? ''
}
export function authorId(author) {
  return (author && typeof author === 'object') ? (author.id ?? null) : null
}

/**
 * Article d'actualité. Backend : { id, title, content, status, category }.
 * NB : la page lit `categorie` (français) alors que le backend expose `category`.
 * excerpt/author/image/date ne sont pas fournis → défauts (excerpt dérivé du contenu).
 */
export function normalizeNews(a) {
  if (!a || typeof a !== 'object') return a
  return {
    ...a,
    id: a.id,
    title: a.title ?? '',
    categorie: a.category ?? a.categorie ?? '',
    excerpt: a.excerpt ?? a.content ?? '',
    author: authorName(a.author),
    authorId: authorId(a.author),
    image: a.image ?? null,
    date: a.date ?? '',
    status: a.status ?? 'APPROVED'
  }
}

/**
 * Opportunité / Offre partenaire. Backend probable : { id, title, type, discipline,
 * description, requirements, salary, author }.
 * author peut être string OU { id, firstName, lastName }.
 */
export function normalizeOpportunity(o) {
  if (!o || typeof o !== 'object') return o
  return {
    ...o,
    id: o.id,
    title: o.title ?? '',
    type: o.type ?? '',
    discipline: o.domain ?? o.discipline ?? '',
    description: o.description ?? '',
    requirements: o.requirements ?? '',
    salary: o.salary ?? '',
    author: authorName(o.author),
    authorId: authorId(o.author),
    date: o.date ?? '',
    location: o.location ?? ''
  }
}

const DEFAULT_PROJECT_IMAGES = [
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80', // Circuit / Microelectronics
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80', // AI / Abstract Nodes
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=80', // Robotics / Cybernetics
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=80', // Embedded Systems / IoT
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80', // Web / Cloud Architecture
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80', // Energy / Climate Tech
];

function getProjectImage(p) {
  if (p.image) return p.image;
  if (p.imageUrl) return p.imageUrl;
  
  const titleLower = ((p.title || '') + ' ' + (p.summary || '') + ' ' + (p.clubName || '')).toLowerCase();
  if (titleLower.includes('ia') || titleLower.includes('pathologi') || titleLower.includes('intelligence') || titleLower.includes('visio') || titleLower.includes('deep')) {
    return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80';
  }
  if (titleLower.includes('robot') || titleLower.includes('ros') || titleLower.includes('rover') || titleLower.includes('autonom')) {
    return 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=80';
  }
  if (titleLower.includes('web') || titleLower.includes('cloud') || titleLower.includes('plateform') || titleLower.includes('app') || titleLower.includes('logiciel')) {
    return 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80';
  }
  if (titleLower.includes('electroni') || titleLower.includes('capteur') || titleLower.includes('iot') || titleLower.includes('embarq') || titleLower.includes('carte')) {
    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80';
  }
  if (titleLower.includes('froid') || titleLower.includes('clima') || titleLower.includes('solaire') || titleLower.includes('btp') || titleLower.includes('thermiq') || titleLower.includes('energi')) {
    return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80';
  }

  const str = String(p.id || p.title || 'fieri');
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return DEFAULT_PROJECT_IMAGES[hash % DEFAULT_PROJECT_IMAGES.length];
}

/**
 * Projet R&D. Backend : { id, title, summary, status, clubId, stars, starred,
 * budgetRaised, technologies }. Détail : + { description, team }.
 * author/clubName/image/budgetGoal/supportersCount non fournis → défauts.
 */
export function normalizeProject(p) {
  if (!p || typeof p !== 'object') return p
  return {
    ...p,
    id: p.id,
    title: p.title ?? '',
    summary: p.summary ?? '',
    status: p.status ?? '',
    stars: p.stars ?? 0,
    starred: p.starred ?? false,
    budgetRaised: p.budgetRaised ?? 0,
    budgetGoal: p.budgetGoal ?? 0,
    technologies: p.technologies ?? [],
    supportersCount: p.supportersCount ?? 0,
    author: authorName(p.author),
    authorId: authorId(p.author),
    clubName: p.clubName ?? '',
    image: getProjectImage(p)
  }
}

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
