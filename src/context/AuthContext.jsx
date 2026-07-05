import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

// ─── Hiérarchie des rôles ───────────────────────────────────────────────────
// Chaque rôle englobe tous les rôles de niveau inférieur.
// VISITEUR < ETUDIANT < CHERCHEUR ≈ MENTOR < ADMIN
export const ROLE_LEVELS = {
  VISITEUR:  0,
  ETUDIANT:  1,
  CHERCHEUR: 2,
  MENTOR:    2, // Même niveau que CHERCHEUR, distingué par badge
  ADMIN:     3,
};

// Valeurs autorisées (pour validation et affichage)
export const ROLES = {
  VISITEUR:  'VISITEUR',
  ETUDIANT:  'ETUDIANT',
  CHERCHEUR: 'CHERCHEUR',
  MENTOR:    'MENTOR',
  ADMIN:     'ADMIN',
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
  ADMIN:     { label: 'Administrateur',  short: 'Admin',     textClassName: 'text-red-400',      badgeClassName: 'bg-red-500/10 border-red-500/30 text-red-400' },
  CHERCHEUR: { label: 'Chercheur FIERI', short: 'Chercheur', textClassName: 'text-fieri-blue',   badgeClassName: 'bg-accent-primary/15 border-accent-primary/30 text-fieri-blue' },
  MENTOR:    { label: 'Mentor',          short: 'Mentor',    textClassName: 'text-violet-400',   badgeClassName: 'bg-violet-500/10 border-violet-500/30 text-violet-400' },
  ETUDIANT:  { label: 'Étudiant',        short: 'Étudiant',  textClassName: 'text-emerald-400',  badgeClassName: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
  VISITEUR:  { label: 'Invité',          short: 'Invité',    textClassName: 'text-slate-400',    badgeClassName: 'bg-slate-500/10 border-slate-500/30 text-slate-400' },
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

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  const handleLogin = useCallback(async (email, password) => {
    try {
      const res = await api.auth.login(email, password);
      if (res.success && res.data) {
        const { access_token, member } = res.data;
        setToken(access_token);
        setUser(member);
        localStorage.setItem('fieri_auth_token', access_token);
        localStorage.setItem('fieri_user', JSON.stringify(member));
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || 'Identifiants invalides.' };
    } catch (err) {
      console.error('[FIERI AuthContext] Erreur lors de la connexion:', err);
      return { success: false, message: "Une erreur réseau s'est produite lors de la connexion." };
    }
  }, []);

  const handleRegister = useCallback(async ({ email, password, firstName, lastName, branchId }) => {
    try {
      const res = await api.auth.register({ email, password, firstName, lastName, branchId });
      if (res.success && res.data) {
        const { access_token, member } = res.data;
        setToken(access_token);
        setUser(member);
        localStorage.setItem('fieri_auth_token', access_token);
        localStorage.setItem('fieri_user', JSON.stringify(member));
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || "Erreur lors de l'inscription." };
    } catch (err) {
      console.error("[FIERI AuthContext] Erreur lors de l'inscription:", err);
      return { success: false, message: "Une erreur réseau s'est produite lors de l'inscription." };
    }
  }, []);

  const handleLogout = useCallback(() => {
    api.auth.logout();
    setToken(null);
    setUser(null);
    localStorage.removeItem('fieri_auth_token');
    localStorage.removeItem('fieri_user');
  }, []);

  // ─── Helpers de Rôles ────────────────────────────────────────────────────

  /**
   * hasMinRole(minRole) — retourne true si l'utilisateur a au moins ce niveau.
   * C'est la méthode principale à utiliser pour les gardes d'accès.
   *
   * Exemples :
   *   hasMinRole('ETUDIANT')  → true pour ETUDIANT, CHERCHEUR, ADMIN
   *   hasMinRole('CHERCHEUR') → true pour CHERCHEUR et ADMIN seulement
   *   hasMinRole('ADMIN')     → true pour ADMIN seulement
   *   hasMinRole('VISITEUR')  → toujours true (contenu public)
   */
  const hasMinRole = useCallback((minRole) => {
    const minLevel  = ROLE_LEVELS[minRole?.toUpperCase()] ?? 0;
    const userLevel = ROLE_LEVELS[user?.role?.toUpperCase()] ?? -1;
    // Si l'utilisateur n'est pas connecté, seul VISITEUR (niveau 0) est autorisé
    if (!user) return minLevel === 0;
    return userLevel >= minLevel;
  }, [user]);

  /**
   * hasRole(roleName) — compatibilité avec l'ancien code.
   * Préférer hasMinRole() pour les nouvelles fonctionnalités.
   */
  const hasRole = useCallback((roleName) => {
    if (!user || !user.role) return false;
    const userRole   = user.role.toUpperCase();
    const targetRole = roleName.toUpperCase();

    // Hiérarchie linéaire : un rôle supérieur satisfait un rôle inférieur
    const userLevel   = ROLE_LEVELS[userRole]   ?? -1;
    const targetLevel = ROLE_LEVELS[targetRole] ?? -1;

    if (targetLevel < 0) return userRole === targetRole; // rôle inconnu : correspondance exacte
    return userLevel >= targetLevel;
  }, [user]);

  const isAdmin      = useCallback(() => hasMinRole('ADMIN'), [hasMinRole]);
  const isResearcher = useCallback(() => hasMinRole('CHERCHEUR'), [hasMinRole]);
  const isStudent    = useCallback(() => hasMinRole('ETUDIANT'), [hasMinRole]);
  const isEtudiant   = isStudent; // alias francophone
  const isMentor     = useCallback(() => {
    // Un MENTOR est soit un user avec role='MENTOR', soit un CHERCHEUR/ADMIN avec le badge MENTOR
    if (!user) return false;
    if (user.role?.toUpperCase() === 'MENTOR') return true;
    // Vérifier les badges dans mockDb (disponible côté client uniquement)
    try {
      const badges = JSON.parse(localStorage.getItem('fieri_db_badges') || '[]');
      return badges.some(b => b.userId === String(user.id) && b.badgeType === 'MENTOR');
    } catch { return false; }
  }, [user]);

  /**
   * hasBadge(badgeType) — vérifie si l'utilisateur possède un badge spécifique.
   */
  const hasBadge = useCallback((badgeType) => {
    if (!user) return false;
    try {
      const badges = JSON.parse(localStorage.getItem('fieri_db_badges') || '[]');
      return badges.some(b => b.userId === String(user.id) && b.badgeType === badgeType?.toUpperCase());
    } catch { return false; }
  }, [user]);

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
    hasBadge,
    ROLES,
    ROLE_LEVELS,
    BADGE_TYPES,
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
    hasBadge,
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
