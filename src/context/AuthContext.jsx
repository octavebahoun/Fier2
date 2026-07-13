import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

// ─── Structure d'héritage des rôles (RBAC Graphe) ───────────────────────────
// Résout la collision linéaire : un Chercheur et un Responsable de club sont
// tous deux au-dessus de l'Étudiant simple, mais n'ont pas les mêmes privilèges.
// Le graphe garantit que :
//   - L'admin hérite de tous les rôles.
//   - Le chercheur / responsable / mentor / chef de projet héritent tous d'étudiant.
//   - Un chercheur n'est PAS un responsable de club, et vice-versa.
export const ROLE_INHERITANCE = {
  VISITEUR:       [],
  ETUDIANT:       ['VISITEUR'],
  CHERCHEUR:      ['ETUDIANT'],
  MENTOR:         ['ETUDIANT'],
  CHEF_DE_PROJET: ['ETUDIANT'],
  RESPONSABLE:    ['ETUDIANT'],
  ADMIN:          ['CHERCHEUR', 'MENTOR', 'CHEF_DE_PROJET', 'RESPONSABLE'],
};

// Fonction récursive de résolution d'héritage
export function isRoleOrInherits(userRole, requiredRole) {
  if (!userRole || !requiredRole) return false;
  const user = userRole.toUpperCase();
  const req = requiredRole.toUpperCase();
  if (user === req) return true;

  const parents = ROLE_INHERITANCE[user];
  if (!parents) return false;

  return parents.some(parent => isRoleOrInherits(parent, req));
}

export const ROLES = {
  VISITEUR:       'VISITEUR',
  ETUDIANT:       'ETUDIANT',
  CHERCHEUR:      'CHERCHEUR',
  MENTOR:         'MENTOR',
  CHEF_DE_PROJET: 'CHEF_DE_PROJET',
  RESPONSABLE:    'RESPONSABLE',
  ADMIN:          'ADMIN',
};

// Priorité de tri des rôles pour l'affichage (ex: gestion des membres)
export const ROLE_SORT_PRIORITY = {
  ADMIN:          6,
  RESPONSABLE:    5,
  CHEF_DE_PROJET: 4,
  MENTOR:         3,
  CHERCHEUR:      2,
  ETUDIANT:       1,
  VISITEUR:       0,
};

// Types de badges disponibles (attribués par Admin ou Responsable de club)
export const BADGE_TYPES = ['CHERCHEUR', 'MENTOR', 'FORMATEUR', 'AMBASSADEUR', 'INNOVATEUR'];

// ─── Présentation des rôles (source unique) ─────────────────────────────────
// Toute couleur / libellé de rôle affiché dans l'UI DOIT venir d'ici.
// Ajouter un rôle = éditer cet objet, pas chasser des ternaires dans les vues.
//   • label : libellé complet (sidebar, profil)
//   • short : libellé compact (pastille de navbar)
//   • textClassName  : couleur seule (variante texte)
//   • badgeClassName : fond + bordure + texte (variante pastille)
export const ROLE_PRESENTATION = {
  ADMIN:          { label: 'Administrateur',      short: 'Admin',       textClassName: 'text-red-400',     badgeClassName: 'bg-red-500/10 border-red-500/30 text-red-400' },
  RESPONSABLE:    { label: 'Responsable de club', short: 'Responsable', textClassName: 'text-amber-400',   badgeClassName: 'bg-amber-500/10 border-amber-500/30 text-amber-400' },
  CHEF_DE_PROJET: { label: 'Chef de projet',      short: 'Chef projet', textClassName: 'text-cyan-400',    badgeClassName: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' },
  CHERCHEUR:      { label: 'Chercheur FIERI',     short: 'Chercheur',   textClassName: 'text-fieri-blue',  badgeClassName: 'bg-accent-primary/15 border-accent-primary/30 text-fieri-blue' },
  MENTOR:         { label: 'Mentor',              short: 'Mentor',      textClassName: 'text-violet-400',  badgeClassName: 'bg-violet-500/10 border-violet-500/30 text-violet-400' },
  ETUDIANT:       { label: 'Étudiant',            short: 'Étudiant',    textClassName: 'text-emerald-400', badgeClassName: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
  VISITEUR:       { label: 'Invité',              short: 'Invité',      textClassName: 'text-slate-400',   badgeClassName: 'bg-slate-500/10 border-slate-500/30 text-slate-400' },
};

// Repli neutre pour un rôle inconnu / absent (jamais null → l'UI reste cohérente).
const ROLE_PRESENTATION_FALLBACK = {
  label: 'Membre', short: 'Membre', textClassName: 'text-emerald-400', badgeClassName: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
};

/**
 * getRolePresentation(role) — normalise la casse et renvoie toujours un objet
 * de présentation exploitable (jamais null).
 */
export function getRolePresentation(role) {
  return ROLE_PRESENTATION[String(role || '').toUpperCase()] || ROLE_PRESENTATION_FALLBACK;
}

// ─── Matrice de capacités (source unique du contrôle d'accès) ────────────────
// On ne teste JAMAIS un rôle « en dur » dans les vues. On teste une CAPACITÉ.
// `can('news:submit')` plutôt que `hasMinRole('CHERCHEUR')` : l'intention est
// explicite, et faire évoluer les droits = éditer cette table, pas chasser des
// ternaires dans 15 fichiers. Chaque capacité pointe vers le rôle minimum requis.
//
//   VISITEUR  : rien (contenu public en lecture seule, géré hors capacités)
//   ETUDIANT  : participer (rejoindre, s'inscrire, candidater, suivre)
//   CHERCHEUR : produire (publier, créer opportunités/projets, éditer sa fiche)
//   MENTOR    : encadrer (valider les adhésions de club)
//   ADMIN     : gouverner (modérer, administrer, gérer les membres)
export const PERMISSIONS = {
  // — Participation (tout membre connecté) —
  'dashboard:view':     'ETUDIANT',
  'profile:viewOwn':    'ETUDIANT',
  'club:join':          'ETUDIANT',
  'workshop:register':  'ETUDIANT',
  'event:register':     'ETUDIANT',
  'opportunity:apply':  'ETUDIANT',
  'project:follow':     'ETUDIANT',
  'researcher:follow':  'ETUDIANT',
  // — Production (chercheur et au-dessus) —
  'researcher:editOwn': 'CHERCHEUR',
  'news:submit':        'CHERCHEUR',
  'opportunity:create': 'CHERCHEUR',
  'project:create':     'CHERCHEUR',
  // — Encadrement (mentor et au-dessus) —
  'club:manage':        'MENTOR',
  // — Gouvernance (admin uniquement) —
  'news:moderate':      'ADMIN',
  'opportunity:review': 'ADMIN',
  'member:manage':      'ADMIN',
  'admin:access':       'ADMIN',
};

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [badges, setBadges]   = useState([]);

  // Charger les badges de l'utilisateur via l'API (plus de lecture directe de
  // localStorage : le contexte ne connaît qu'UNE seule façon de savoir qui tu es).
  useEffect(() => {
    if (!user) {
      setBadges([]);
      return;
    }
    let active = true;
    (async () => {
      try {
        const res = await api.badges.getByUser(user.id);
        if (active && res?.success) setBadges(res.data || []);
      } catch (err) {
        console.error('[FIERI AuthContext] Erreur lors du chargement des badges:', err);
        if (active) setBadges([]);
      }
    })();
    return () => { active = false; };
  }, [user]);

  // Restaurer la session utilisateur au démarrage
  useEffect(() => {
    async function restoreSession() {
      try {
        const storedToken = localStorage.getItem('fieri_auth_token');
        const storedUser  = localStorage.getItem('fieri_user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Valider ou rafraîchir le profil en arrière-plan avec l'API
          const res = await api.auth.getProfile();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('fieri_user', JSON.stringify(res.data));
          } else {
            handleLogout();
          }
        }
      } catch (err) {
        console.error('[FIERI AuthContext] Erreur lors de la restauration de la session:', err);
        // Token expiré / invalide → on nettoie la session pour ne pas laisser
        // une UI "connectée" mais cassée (chaque appel /me renverrait 401).
        // On ne déconnecte QUE sur une vraie erreur d'auth : un 500 ou une
        // coupure réseau ne doit pas détruire la session de l'utilisateur.
        if (err?.status === 401 || err?.status === 403) {
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  // Enrichit un membre minimal (issu de login/register) avec le profil complet
  // de /members/me (scope de gouvernance). Retombe sur le membre minimal si
  // l'appel échoue — on ne bloque jamais la connexion pour autant.
  const enrichProfile = useCallback(async (minimalMember) => {
    try {
      const me = await api.auth.getProfile();
      if (me?.success && me.data) return me.data;
    } catch (err) {
      console.warn('[FIERI AuthContext] Profil complet indisponible, membre minimal conservé:', err?.message);
    }
    return minimalMember;
  }, []);

  const handleLogin = useCallback(async (email, password) => {
    try {
      const res = await api.auth.login(email, password);
      if (res.success && res.data) {
        const { access_token, member } = res.data;
        setToken(access_token);
        localStorage.setItem('fieri_auth_token', access_token);
        // Le login ne renvoie qu'un membre minimal : on enrichit immédiatement
        // avec le profil complet (scope de gouvernance) pour un RBAC correct.
        const fullUser = await enrichProfile(member);
        setUser(fullUser);
        localStorage.setItem('fieri_user', JSON.stringify(fullUser));
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || 'Identifiants invalides.' };
    } catch (err) {
      console.error('[FIERI AuthContext] Erreur lors de la connexion:', err);
      let message = err?.serverMessage || "Une erreur s'est produite lors de la connexion.";
      if (err?.status === 401 || err?.status === 400) message = "Email ou mot de passe incorrect.";
      else if (err?.status === 404) message = "Aucun compte trouvé pour cet email.";
      else if (!err?.status) message = "Serveur injoignable. Vérifiez votre connexion.";
      return { success: false, message };
    }
  }, [enrichProfile]);

  const handleRegister = useCallback(async ({ email, password, firstName, lastName, branchId }) => {
    try {
      const res = await api.auth.register({ email, password, firstName, lastName, branchId });
      if (res.success && res.data) {
        const { access_token, member } = res.data;
        setToken(access_token);
        localStorage.setItem('fieri_auth_token', access_token);
        const fullUser = await enrichProfile(member);
        setUser(fullUser);
        localStorage.setItem('fieri_user', JSON.stringify(fullUser));
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || "Erreur lors de l'inscription." };
    } catch (err) {
      console.error("[FIERI AuthContext] Erreur lors de l'inscription:", err);
      let message = err?.serverMessage || "Une erreur s'est produite lors de l'inscription.";
      let code = null;
      if (err?.status === 409) {
        message = "Un compte existe déjà avec cet email. Essayez de vous connecter.";
        code = 'EMAIL_EXISTS';
      } else if (err?.status === 400 || err?.status === 422) {
        message = err?.serverMessage || "Informations d'inscription invalides.";
      } else if (!err?.status) {
        message = "Serveur injoignable. Vérifiez votre connexion.";
      }
      return { success: false, message, code };
    }
  }, [enrichProfile]);

  const handleLogout = useCallback(() => {
    api.auth.logout();
    setToken(null);
    setUser(null);
    localStorage.removeItem('fieri_auth_token');
    localStorage.removeItem('fieri_user');
  }, []);

  // ─── Helpers de Rôles ────────────────────────────────────────────────────

  /**
   * hasMinRole(minRole) — retourne true si l'utilisateur possède ou hérite de ce rôle.
   * C'est la méthode principale à utiliser pour les gardes d'accès.
   */
  const hasMinRole = useCallback((minRole) => {
    if (!minRole) return true;
    const req = minRole.toUpperCase();
    if (req === 'VISITEUR') return true;
    if (!user || !user.role) return false;
    return isRoleOrInherits(user.role, req);
  }, [user]);

  /**
   * hasRole(roleName) — compatibilité avec l'ancien code.
   * Préférer hasMinRole() pour les nouvelles fonctionnalités.
   */
  const hasRole = useCallback((roleName) => {
    if (!user || !user.role) return false;
    return isRoleOrInherits(user.role, roleName);
  }, [user]);

  const isAdmin      = useCallback(() => user?.role?.toUpperCase() === 'ADMIN', [user]);
  const isResearcher = useCallback(() => hasMinRole('CHERCHEUR'), [hasMinRole]);
  const isStudent    = useCallback(() => hasMinRole('ETUDIANT'), [hasMinRole]);
  const isEtudiant   = isStudent; // alias francophone
  /**
   * hasBadge(badgeType) — vérifie si l'utilisateur possède un badge spécifique.
   * Lit l'état `badges` chargé via l'API (les badges sont déjà filtrés sur l'user).
   */
  const hasBadge = useCallback((badgeType) => {
    if (!user) return false;
    const target = badgeType?.toUpperCase();
    return badges.some(b => b.badgeType?.toUpperCase() === target);
  }, [user, badges]);

  const isMentor     = useCallback(() => {
    // Un MENTOR est soit un user avec role='MENTOR', soit un membre avec le badge MENTOR
    if (!user) return false;
    if (user.role?.toUpperCase() === 'MENTOR') return true;
    return hasBadge('MENTOR');
  }, [user, hasBadge]);

  /**
   * can(capability) — LA fonction de contrôle d'accès à utiliser dans les vues.
   * Renvoie true si l'utilisateur courant possède la capacité demandée.
   * Capacité inconnue → false (fail-safe : on refuse par défaut, on ne devine pas).
   *
   *   {can('news:submit') && <BoutonPublier />}   // invisible si pas le droit
   *   <button disabled={!can('club:join')} …/>     // désactivé sinon
   */
  const can = useCallback((capability) => {
    const required = PERMISSIONS[capability];
    if (!required) {
      console.warn(`[FIERI AuthContext] Capacité inconnue: "${capability}" → accès refusé.`);
      return false;
    }
    // Le mentorat peut venir d'un badge (pas seulement du rôle) : on élargit
    // la capacité d'encadrement aux porteurs du badge MENTOR.
    if (required === 'MENTOR' && isMentor()) return true;
    return hasMinRole(required);
  }, [hasMinRole, isMentor]);

  // ─── Postes de gouvernance scopés (Community OS) ─────────────────────────
  // Ces postes ne suivent PAS la hiérarchie linéaire des rôles : ils sont
  // attachés à une université / un pays / un club. On les lit sur le profil
  // enrichi (/members/me). Un ADMIN global satisfait toujours ces contrôles.
  const universityPost = user?.universityPost?.post ?? null;
  const countryPost = user?.countryPost?.post ?? null;
  const universityId = user?.universityId ?? user?.universityPost?.universityId ?? null;

  const isChefUniversitaire = useCallback(
    () => isAdmin() || universityPost === 'CHEF_UNIVERSITAIRE',
    [isAdmin, universityPost],
  );
  // Le Chef Universitaire supervise la trésorerie ; le Trésorier la gère.
  const isTreasurer = useCallback(
    () => isAdmin() || universityPost === 'TRESORIER' || universityPost === 'CHEF_UNIVERSITAIRE',
    [isAdmin, universityPost],
  );
  const isSecretary = useCallback(
    () => isAdmin() || universityPost === 'SECRETAIRE',
    [isAdmin, universityPost],
  );
  const isRespComm = useCallback(
    () => isAdmin() || universityPost === 'RESP_COMMUNICATION',
    [isAdmin, universityPost],
  );
  const isCountryGovernor = useCallback(
    () => isAdmin() || countryPost === 'GOUVERNANT_PAYS',
    [isAdmin, countryPost],
  );
  const isClubResponsible = useCallback(
    (clubId) => isAdmin() || (user?.responsibleClubIds || []).includes(clubId),
    [isAdmin, user],
  );
  const isAnyClubResponsible = useCallback(
    () => isAdmin() || (user?.responsibleClubIds || []).length > 0,
    [isAdmin, user],
  );

  const value = useMemo(() => ({
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login:        handleLogin,
    register:     handleRegister,
    logout:       handleLogout,
    hasRole,
    hasMinRole,
    isAdmin,
    isResearcher,
    isStudent,
    isEtudiant,
    isMentor,
    can,
    hasBadge,
    badges,
    // Scope de gouvernance
    universityId,
    universityPost,
    countryPost,
    isChefUniversitaire,
    isTreasurer,
    isSecretary,
    isRespComm,
    isCountryGovernor,
    isClubResponsible,
    isAnyClubResponsible,
    ROLES,
    ROLE_SORT_PRIORITY,
    BADGE_TYPES,
    PERMISSIONS,
  }), [
    user,
    token,
    loading,
    handleLogin,
    handleRegister,
    handleLogout,
    hasRole,
    hasMinRole,
    isAdmin,
    isResearcher,
    isStudent,
    isEtudiant,
    isMentor,
    can,
    hasBadge,
    badges,
    universityId,
    universityPost,
    countryPost,
    isChefUniversitaire,
    isTreasurer,
    isSecretary,
    isRespComm,
    isCountryGovernor,
    isClubResponsible,
    isAnyClubResponsible,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé au sein d'un AuthProvider.");
  }
  return context;
}

export default AuthContext;
