import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaurer la session utilisateur au démarrage
  useEffect(() => {
    async function restoreSession() {
      try {
        const storedToken = localStorage.getItem('fieri_auth_token');
        const storedUser = localStorage.getItem('fieri_user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Valider ou rafraîchir le profil en arrière-plan avec l'API
          const res = await api.auth.getProfile();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('fieri_user', JSON.stringify(res.data));
          } else {
            // Si le token n'est plus valide côté API, on déconnecte
            handleLogout();
          }
        }
      } catch (err) {
        console.error("[FIERI AuthContext] Erreur lors de la restauration de la session:", err);
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  const handleLogin = async (email, password) => {
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
      return { success: false, message: res.message || "Identifiants invalides." };
    } catch (err) {
      console.error("[FIERI AuthContext] Erreur lors de la connexion:", err);
      return { success: false, message: "Une erreur réseau s'est produite lors de la connexion." };
    }
  };

  const handleRegister = async ({ email, password, firstName, lastName, branchId }) => {
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
  };

  const handleLogout = () => {
    api.auth.logout();
    setToken(null);
    setUser(null);
    localStorage.removeItem('fieri_auth_token');
    localStorage.removeItem('fieri_user');
  };

  // Helpers de Rôles
  const hasRole = (roleName) => {
    if (!user || !user.role) return false;
    const userRole = user.role.toUpperCase();
    const targetRole = roleName.toUpperCase();
    
    // Mappage flexible français / anglais ou rôles standards
    if (targetRole === 'ADMIN' && userRole === 'ADMIN') return true;
    if (targetRole === 'CHERCHEUR' && userRole === 'CHERCHEUR') return true;
    if (targetRole === 'MEMBRE' && (userRole === 'MEMBRE' || userRole === 'CHERCHEUR' || userRole === 'ADMIN')) return true;
    if (targetRole === 'VISITEUR') return true; // Tout utilisateur connecté ou non a accès au rôle visiteur
    
    return userRole === targetRole;
  };

  const isAdmin = () => hasRole('ADMIN');
  const isResearcher = () => hasRole('CHERCHEUR');

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    hasRole,
    isAdmin,
    isResearcher
  };

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
