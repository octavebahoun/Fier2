import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import api from '../services/api.js'
import {
  ROLES,
  ROLE_LIST,
  UNIVERSITY_POSTS,
  UNIVERSITY_POST_LIST,
  COUNTRY_POSTS,
  COUNTRY_POST_LIST,
  CAPABILITIES,
} from '../auth/capabilities.js'
import { readIdentity, resolve, explain, denyMessage } from '../auth/access.js'

const AuthContext = createContext(null)

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AuthContext — façade React au-dessus de src/auth/.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Ce fichier ne DÉCIDE plus rien : il expose la session et délègue chaque
 * question de droit à `resolve()`. Le graphe d'héritage de rôles a disparu —
 * le `RolesGuard` du backend teste une correspondance exacte, une hiérarchie
 * côté client accordait donc des écrans que l'API refusait ensuite.
 *
 * Toute question d'accès passe par `can(capability, ctx)`.
 */

export { ROLES, UNIVERSITY_POSTS, COUNTRY_POSTS }

/** Rôles attribuables par un ADMIN, du plus élevé au plus courant. */
export const ASSIGNABLE_ROLES = [
  ROLES.ADMIN,
  ROLES.RESPONSABLE,
  ROLES.CHEF_DE_PROJET,
  ROLES.MENTOR,
  ROLES.CHERCHEUR,
  ROLES.ETUDIANT,
]

/** Priorité de tri pour l'affichage des listes de membres. */
export const ROLE_SORT_PRIORITY = {
  ADMIN: 6, RESPONSABLE: 5, CHEF_DE_PROJET: 4, MENTOR: 3, CHERCHEUR: 2, ETUDIANT: 1,
}

export const BADGE_TYPES = ['CHERCHEUR', 'MENTOR', 'FORMATEUR', 'AMBASSADEUR', 'INNOVATEUR']

// ─── Présentation : ce que la personne EST ─────────────────────────────────
// Un rôle de compte, et rien d'autre. Les postes de gouvernance ont leur
// propre table ci-dessous : les mélanger était la cause du constat F01.
export const ROLE_PRESENTATION = {
  ADMIN:          { label: 'Admin Global Fieri', short: 'Admin Global', description: 'Supervision globale de la plateforme Fieri.',                    textClassName: 'text-danger',     badgeClassName: 'bg-danger-wash border-danger text-danger' },
  RESPONSABLE:    { label: 'Responsable de club', short: 'Responsable',  description: 'Animation d’un club CITE, validation des adhésions et projets.', textClassName: 'text-warning',   badgeClassName: 'bg-warning-wash border-warning text-warning' },
  CHEF_DE_PROJET: { label: 'Chef de projet',      short: 'Chef projet',  description: 'Pilotage des équipes R&D, tâches et candidatures reçues.',       textClassName: 'text-engine',    badgeClassName: 'bg-engine-wash border-engine text-engine' },
  CHERCHEUR:      { label: 'Chercheur FIERI',     short: 'Chercheur',    description: 'Publication scientifique, opportunités et projets R&D.',         textClassName: 'text-engine',      badgeClassName: 'bg-engine-wash border-engine/30 text-engine' },
  MENTOR:         { label: 'Mentor',              short: 'Mentor',       description: 'Encadrement des étudiants et attribution des badges.',           textClassName: 'text-engine',  badgeClassName: 'bg-engine-wash border-engine text-engine' },
  ETUDIANT:       { label: 'Étudiant',            short: 'Étudiant',     description: 'Participation aux événements, formations, ateliers et clubs.',   textClassName: 'text-success', badgeClassName: 'bg-success-wash border-success text-success' },
}

const ROLE_PRESENTATION_FALLBACK = {
  label: 'Membre', short: 'Membre', description: 'Accès membre général à la plateforme.',
  textClassName: 'text-success', badgeClassName: 'bg-success-wash border-success text-success',
}

// ─── Présentation : ce que la personne ADMINISTRE ──────────────────────────
export const POST_PRESENTATION = {
  CHEF_UNIVERSITAIRE: { label: 'Chef Universitaire',        short: 'Chef Univ.',  description: 'Gouvernance de l’université : attestations, exclusions, supervision.', textClassName: 'text-engine',    badgeClassName: 'bg-engine-wash border-engine text-engine' },
  SECRETAIRE:         { label: 'Secrétaire Générale',       short: 'Secrétaire',  description: 'Rapports d’activité et recensements de l’université.',                 textClassName: 'text-success', badgeClassName: 'bg-success-wash border-success text-success' },
  TRESORIER:          { label: 'Trésorier',                 short: 'Trésorier',   description: 'Grand livre et opérations de trésorerie de l’université.',             textClassName: 'text-warning',   badgeClassName: 'bg-warning-wash border-warning text-warning' },
  RESP_COMMUNICATION: { label: 'Responsable communication', short: 'Resp. comm.', description: 'Diffusion des événements de l’université sur les réseaux.',            textClassName: 'text-engine',  badgeClassName: 'bg-engine-wash border-engine text-engine' },
  GOUVERNANT_PAYS:    { label: 'Gouvernant du pays',        short: 'Gouv. pays',  description: 'Supervision des universités du pays.',                                 textClassName: 'text-danger',     badgeClassName: 'bg-danger-wash border-danger text-danger' },
}

export function getRolePresentation(role) {
  return ROLE_PRESENTATION[String(role || '').toUpperCase()] || ROLE_PRESENTATION_FALLBACK
}

export function getPostPresentation(post) {
  return POST_PRESENTATION[String(post || '').toUpperCase()] || null
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [badges, setBadges]   = useState([])

  useEffect(() => {
    if (!user) { setBadges([]); return }
    let active = true
    ;(async () => {
      try {
        const res = await api.badges.getByUser(user.id)
        if (active && res?.success) setBadges(res.data || [])
      } catch (err) {
        console.error('[FIERI AuthContext] Erreur lors du chargement des badges:', err)
        if (active) setBadges([])
      }
    })()
    return () => { active = false }
  }, [user])

  const handleLogout = useCallback(() => {
    api.auth.logout()
    setToken(null)
    setUser(null)
    localStorage.removeItem('fieri_auth_token')
    localStorage.removeItem('fieri_user')
  }, [])

  useEffect(() => {
    async function restoreSession() {
      try {
        const storedToken = localStorage.getItem('fieri_auth_token')
        const storedUser  = localStorage.getItem('fieri_user')
        if (storedToken && storedUser) {
          setToken(storedToken)
          setUser(JSON.parse(storedUser))
          const res = await api.auth.getProfile()
          if (res.success && res.data) {
            setUser(res.data)
            localStorage.setItem('fieri_user', JSON.stringify(res.data))
          } else {
            handleLogout()
          }
        }
      } catch (err) {
        console.error('[FIERI AuthContext] Erreur lors de la restauration de la session:', err)
        // Un 500 ou une coupure réseau ne doit pas détruire la session.
        if (err?.status === 401 || err?.status === 403) handleLogout()
      } finally {
        setLoading(false)
      }
    }
    restoreSession()
  }, [handleLogout])

  const enrichProfile = useCallback(async (minimalMember) => {
    try {
      const me = await api.auth.getProfile()
      if (me?.success && me.data) return me.data
    } catch (err) {
      console.warn('[FIERI AuthContext] Profil complet indisponible, membre minimal conservé:', err?.message)
    }
    return minimalMember
  }, [])

  const handleLogin = useCallback(async (email, password) => {
    try {
      const res = await api.auth.login(email, password)
      if (res.success && res.data) {
        const { access_token, member } = res.data
        setToken(access_token)
        localStorage.setItem('fieri_auth_token', access_token)
        const fullUser = await enrichProfile(member)
        setUser(fullUser)
        localStorage.setItem('fieri_user', JSON.stringify(fullUser))
        return { success: true, message: res.message }
      }
      return { success: false, message: res.message || 'Identifiants invalides.' }
    } catch (err) {
      console.error('[FIERI AuthContext] Erreur lors de la connexion:', err)
      let message = err?.serverMessage || "Une erreur s'est produite lors de la connexion."
      if (err?.status === 401 || err?.status === 400) message = 'Email ou mot de passe incorrect.'
      else if (err?.status === 404) message = 'Aucun compte trouvé pour cet email.'
      else if (!err?.status) message = 'Serveur injoignable. Vérifiez votre connexion.'
      return { success: false, message }
    }
  }, [enrichProfile])

  const handleRegister = useCallback(async ({ email, password, firstName, lastName, branchId }) => {
    try {
      const res = await api.auth.register({ email, password, firstName, lastName, branchId })
      if (res.success && res.data) {
        const { access_token, member } = res.data
        setToken(access_token)
        localStorage.setItem('fieri_auth_token', access_token)
        const fullUser = await enrichProfile(member)
        setUser(fullUser)
        localStorage.setItem('fieri_user', JSON.stringify(fullUser))
        return { success: true, message: res.message }
      }
      return { success: false, message: res.message || "Erreur lors de l'inscription." }
    } catch (err) {
      console.error("[FIERI AuthContext] Erreur lors de l'inscription:", err)
      let message = err?.serverMessage || "Une erreur s'est produite lors de l'inscription."
      let code = null
      if (err?.status === 409) {
        message = 'Un compte existe déjà avec cet email. Essayez de vous connecter.'
        code = 'EMAIL_EXISTS'
      } else if (err?.status === 400 || err?.status === 422) {
        message = err?.serverMessage || "Informations d'inscription invalides."
      } else if (!err?.status) {
        message = 'Serveur injoignable. Vérifiez votre connexion.'
      }
      return { success: false, message, code }
    }
  }, [enrichProfile])

  // ─── L'identité, projetée sur les deux axes ──────────────────────────────
  const identity = useMemo(() => readIdentity(user), [user])

  const hasBadge = useCallback((badgeType) => {
    if (!user) return false
    const target = String(badgeType || '').toUpperCase()
    return badges.some((b) => String(b.badgeType || '').toUpperCase() === target)
  }, [user, badges])

  /**
   * can(capability, ctx) — LA question d'accès. Une seule implémentation.
   *
   *   can('treasury:read')                        → « quelque part ? » (menus)
   *   can('treasury:read', { universityId: 7 })   → « ici, précisément ? » (écrans)
   *
   * Le badge MENTOR vaut le rôle MENTOR pour les capacités d'encadrement :
   * une distinction attribuée porte le même droit que le rôle.
   */
  const can = useCallback((capability, ctx = {}) => {
    if (resolve(identity, capability, ctx)) return true
    const spec = CAPABILITIES[capability]
    if (spec?.roles?.includes(ROLES.MENTOR) && identity.authenticated && hasBadge('MENTOR')) {
      return true
    }
    return false
  }, [identity, hasBadge])

  /** why(capability, ctx) — le motif du refus, pour l'afficher au lieu de le taire. */
  const why = useCallback((capability, ctx = {}) => {
    const verdict = explain(identity, capability, ctx)
    return verdict.allowed ? null : denyMessage(verdict.reason, capability)
  }, [identity])

  // ─── Raccourcis de lecture ───────────────────────────────────────────────
  // Ce ne sont PAS des règles : juste des questions déjà formulées, toutes
  // rendues par `can()`. Aucune décision d'accès ne vit en dehors de la table.
  const isAdmin              = useCallback(() => identity.isAdmin, [identity])
  const isResearcher         = useCallback(() => identity.role === ROLES.CHERCHEUR || identity.isAdmin, [identity])
  const isMentor             = useCallback(() => can('badge:award'), [can])
  const isChefUniversitaire  = useCallback((ctx) => can('certificate:issue', ctx), [can])
  const isTreasurer          = useCallback((ctx) => can('treasury:read', ctx), [can])
  const isSecretary          = useCallback((ctx) => can('census:validate', ctx), [can])
  const isRespComm           = useCallback((ctx) => can('event:publishSocial', ctx), [can])
  const isClubResponsible    = useCallback((clubId) => can('membership:review', { clubId }), [can])
  const isAnyClubResponsible = useCallback(() => can('membership:review'), [can])

  const value = useMemo(() => ({
    user,
    token,
    loading,
    isAuthenticated: !!user,
    identity,
    login:    handleLogin,
    register: handleRegister,
    logout:   handleLogout,
    // Contrôle d'accès
    can,
    why,
    // Raccourcis
    isAdmin,
    isResearcher,
    isMentor,
    isChefUniversitaire,
    isTreasurer,
    isSecretary,
    isRespComm,
    isClubResponsible,
    isAnyClubResponsible,
    // Identité dérivée, pratique pour l'affichage
    universityPost: identity.universityPost,
    universityId:   identity.universityId,
    countryPost:    identity.countryPost,
    // Badges
    badges,
    hasBadge,
    // Constantes
    ROLES,
    ROLE_LIST,
    ASSIGNABLE_ROLES,
    UNIVERSITY_POST_LIST,
    COUNTRY_POST_LIST,
    ROLE_SORT_PRIORITY,
    BADGE_TYPES,
  }), [
    user, token, loading, identity,
    handleLogin, handleRegister, handleLogout,
    can, why,
    isAdmin, isResearcher, isMentor, isChefUniversitaire, isTreasurer,
    isSecretary, isRespComm, isClubResponsible, isAnyClubResponsible,
    badges, hasBadge,
  ])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth doit être utilisé au sein d'un AuthProvider.")
  }
  return context
}

export default AuthContext
