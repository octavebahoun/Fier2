import { describe, it, expect } from 'vitest'
import { normalizeRole, readIdentity, resolve, explain, DENY } from './access.js'
import { ROLES, UNIVERSITY_POSTS } from './capabilities.js'

/** Fabrique un profil serveur plausible. */
const member = (over = {}) => ({
  id: 1, firstName: 'Test', lastName: 'Membre', email: 't@fieri.dev',
  role: ROLES.ETUDIANT, universityId: 7, ...over,
})

const identityOf = (over) => readIdentity(member(over))
const can = (over, cap, ctx) => resolve(identityOf(over), cap, ctx)

describe('normalizeRole — le vocabulaire hérité ne verrouille personne', () => {
  it('accepte les six rôles du backend', () => {
    for (const role of Object.values(ROLES)) {
      expect(normalizeRole(role).role).toBe(role)
    }
  })

  it('relit CHEF_UNIVERSITAIRE comme un POSTE, pas comme un rôle (F01)', () => {
    const r = normalizeRole('CHEF_UNIVERSITAIRE')
    expect(r.role).toBe(ROLES.ETUDIANT)
    expect(r.impliedUniversityPost).toBe(UNIVERSITY_POSTS.CHEF_UNIVERSITAIRE)
  })

  it('relit SECRETAIRE comme un poste', () => {
    expect(normalizeRole('SECRETAIRE').impliedUniversityPost).toBe(UNIVERSITY_POSTS.SECRETAIRE)
  })

  it('traduit les alias morts (F05)', () => {
    expect(normalizeRole('ADMINISTRATEUR').role).toBe(ROLES.ADMIN)
    expect(normalizeRole('RESPONSABLE_CLUB').role).toBe(ROLES.RESPONSABLE)
  })

  it('retombe sur ETUDIANT pour un rôle inconnu, sans jamais bloquer', () => {
    expect(normalizeRole('LICORNE').role).toBe(ROLES.ETUDIANT)
    expect(normalizeRole('').role).toBe(ROLES.ETUDIANT)
    expect(normalizeRole(undefined).role).toBe(ROLES.ETUDIANT)
  })
})

describe('readIdentity — les deux axes, quelle que soit la forme reçue', () => {
  it('lit un poste transmis en objet', () => {
    const id = identityOf({ universityPost: { post: 'TRESORIER', universityId: 7 } })
    expect(id.universityPost).toBe('TRESORIER')
    expect(id.universityId).toBe(7)
  })

  it('lit un poste transmis en chaîne — la comparaison qui échouait toujours (F05)', () => {
    const id = identityOf({ universityPost: 'SECRETAIRE' })
    expect(id.universityPost).toBe('SECRETAIRE')
  })

  it('normalise les identifiants de club en chaînes', () => {
    expect(identityOf({ responsibleClubIds: [3, '4'] }).responsibleClubIds).toEqual(['3', '4'])
  })

  it('un visiteur non connecté n’a aucune identité', () => {
    expect(readIdentity(null).authenticated).toBe(false)
  })
})

describe('F01 — un Chef Universitaire garde l’accès à son espace', () => {
  // Avant : `role: 'CHEF_UNIVERSITAIRE'` étant absent du graphe d'héritage,
  // hasMinRole('ETUDIANT') valait faux et ProtectedRoute renvoyait la personne
  // à l'accueil sur /dashboard, /gouvernance et /espace-cite.
  const chefParRole = { role: 'CHEF_UNIVERSITAIRE', universityPost: null }

  it('accède à son espace membre', () => {
    expect(can(chefParRole, 'space:access')).toBe(true)
  })

  it('peut émettre une attestation dans son université', () => {
    expect(can(chefParRole, 'certificate:issue', { universityId: 7 })).toBe(true)
  })

  it('donne le même résultat que le poste déclaré proprement', () => {
    const chefParPoste = { universityPost: { post: 'CHEF_UNIVERSITAIRE', universityId: 7 } }
    expect(can(chefParPoste, 'certificate:issue', { universityId: 7 })).toBe(true)
  })
})

describe('resolve — rôles', () => {
  it('refuse une capacité inconnue (fail-safe)', () => {
    expect(can({}, 'licorne:voler')).toBe(false)
    expect(explain(identityOf({}), 'licorne:voler').reason).toBe(DENY.UNKNOWN_CAPABILITY)
  })

  it('refuse tout à un visiteur non connecté', () => {
    expect(resolve(readIdentity(null), 'space:access')).toBe(false)
    expect(explain(readIdentity(null), 'space:access').reason).toBe(DENY.NOT_AUTHENTICATED)
  })

  it('ADMIN passe partout', () => {
    const admin = { role: ROLES.ADMIN }
    expect(can(admin, 'certificate:issue', { universityId: 999 })).toBe(true)
    expect(can(admin, 'treasury:write', { universityId: 999 })).toBe(true)
    expect(can(admin, 'membership:review', { clubId: 'inconnu' })).toBe(true)
    expect(can(admin, 'admin:access')).toBe(true)
  })

  it('MENTOR obtient son droit réel : attribuer un badge (F03)', () => {
    expect(can({ role: ROLES.MENTOR }, 'badge:award')).toBe(true)
    expect(can({ role: ROLES.ETUDIANT }, 'badge:award')).toBe(false)
    expect(can({ role: ROLES.CHERCHEUR }, 'badge:award')).toBe(false)
  })

  it('CHEF_DE_PROJET obtient son droit réel : piloter les tâches (F03)', () => {
    expect(can({ role: ROLES.CHEF_DE_PROJET }, 'task:manage')).toBe(true)
    expect(can({ role: ROLES.CHERCHEUR }, 'task:manage')).toBe(false)
  })

  it('les rôles ne s’héritent pas — le backend teste une égalité exacte', () => {
    // Un RESPONSABLE n'est pas un CHERCHEUR : @Roles('CHERCHEUR','ADMIN')
    // rejetterait sa requête, l'interface ne doit donc pas lui ouvrir l'action.
    expect(can({ role: ROLES.RESPONSABLE }, 'news:submit')).toBe(false)
    expect(can({ role: ROLES.CHERCHEUR }, 'news:submit')).toBe(true)
  })

  it('une capacité réservée à ADMIN refuse tous les autres rôles', () => {
    for (const role of Object.values(ROLES).filter((r) => r !== ROLES.ADMIN)) {
      expect(can({ role }, 'admin:access')).toBe(false)
      expect(can({ role }, 'news:moderate')).toBe(false)
    }
  })
})

describe('resolve — portée université', () => {
  const tresorier = { role: ROLES.ETUDIANT, universityPost: { post: 'TRESORIER', universityId: 7 } }

  it('autorise dans SON université', () => {
    expect(can(tresorier, 'treasury:read', { universityId: 7 })).toBe(true)
  })

  it('refuse dans une AUTRE université', () => {
    expect(can(tresorier, 'treasury:read', { universityId: 8 })).toBe(false)
    expect(explain(readIdentity(member(tresorier)), 'treasury:read', { universityId: 8 }).reason)
      .toBe(DENY.WRONG_SCOPE)
  })

  it('sans portée, répond à la question du menu : « quelque part ? »', () => {
    expect(can(tresorier, 'treasury:read')).toBe(true)
  })

  it('un trésorier ne peut pas émettre d’attestation', () => {
    expect(can(tresorier, 'certificate:issue', { universityId: 7 })).toBe(false)
    expect(explain(readIdentity(member(tresorier)), 'certificate:issue').reason).toBe(DENY.WRONG_POST)
  })

  it('le Chef Universitaire lit la trésorerie mais ne l’écrit pas', () => {
    const chef = { universityPost: { post: 'CHEF_UNIVERSITAIRE', universityId: 7 } }
    expect(can(chef, 'treasury:read', { universityId: 7 })).toBe(true)
    expect(can(chef, 'treasury:write', { universityId: 7 })).toBe(false)
  })

  it('F04 — le Chef Universitaire lit bien les rapports de son université', () => {
    const chef = { universityPost: { post: 'CHEF_UNIVERSITAIRE', universityId: 7 } }
    expect(can(chef, 'report:read', { universityId: 7 })).toBe(true)
  })
})

describe('resolve — portée club', () => {
  const responsable = { role: ROLES.RESPONSABLE, responsibleClubIds: ['3'] }

  it('autorise sur SON club', () => {
    expect(can(responsable, 'membership:review', { clubId: '3' })).toBe(true)
    expect(can(responsable, 'membership:review', { clubId: 3 })).toBe(true)
  })

  it('refuse sur un autre club', () => {
    expect(can(responsable, 'membership:review', { clubId: '9' })).toBe(false)
  })

  it('un RESPONSABLE sans club ne gère rien — le menu ne doit pas lui mentir', () => {
    // Avant, l'entrée « Rapports CITE » s'affichait puis ouvrait un écran
    // « vous n'êtes membre d'aucun club » (constat F03).
    const sansClub = { role: ROLES.RESPONSABLE, responsibleClubIds: [] }
    expect(can(sansClub, 'membership:review')).toBe(false)
    expect(can(sansClub, 'report:submit')).toBe(false)
  })

  it('un étudiant ne valide aucune adhésion, même sur un club listé', () => {
    expect(can({ role: ROLES.ETUDIANT, responsibleClubIds: ['3'] }, 'membership:review', { clubId: '3' }))
      .toBe(false)
  })
})

describe('la matrice complète des identités', () => {
  // Le tableau du rapport d'audit, figé en test : toute régression de droits
  // se voit ici avant d'atteindre un bêta-testeur.
  const CAS = [
    ['Étudiant',            {},                                                                 []],
    ['Chercheur',           { role: ROLES.CHERCHEUR },                                          ['news:submit', 'opportunity:create']],
    ['Mentor',              { role: ROLES.MENTOR },                                             ['badge:award']],
    ['Chef de projet',      { role: ROLES.CHEF_DE_PROJET },                                     ['task:manage']],
    ['Responsable + club',  { role: ROLES.RESPONSABLE, responsibleClubIds: ['3'] },             ['membership:review', 'report:submit']],
    ['Secrétaire',          { universityPost: { post: 'SECRETAIRE', universityId: 7 } },        ['report:read', 'census:validate']],
    ['Trésorier',           { universityPost: { post: 'TRESORIER', universityId: 7 } },         ['treasury:read', 'treasury:write']],
    ['Chef universitaire',  { universityPost: { post: 'CHEF_UNIVERSITAIRE', universityId: 7 } },['certificate:issue', 'exclusion:review', 'report:read', 'treasury:read']],
    ['Resp. communication', { universityPost: { post: 'RESP_COMMUNICATION', universityId: 7 } },['event:publishSocial']],
    ['Gouvernant de pays',  { countryPost: { post: 'GOUVERNANT_PAYS', countryId: 2 } },         ['country:govern']],
  ]

  it.each(CAS)('%s obtient exactement ses droits', (_nom, profil, attendues) => {
    for (const cap of attendues) {
      expect(can(profil, cap, { universityId: 7, countryId: 2, clubId: '3' })).toBe(true)
    }
    // et jamais l'administration globale
    expect(can(profil, 'admin:access')).toBe(false)
  })

  it('chaque identité non-admin voit son espace membre', () => {
    for (const [, profil] of CAS) {
      expect(can(profil, 'space:access')).toBe(true)
    }
  })
})
