import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * ProtectedRoute — garde d'accès déclarative.
 * Remplace l'ancien gating impératif (useEffect + return null) éparpillé dans App.
 *
 *   <Route path="/admin" element={
 *     <ProtectedRoute minRole="ADMIN"><Admin /></ProtectedRoute>
 *   } />
 *
 * - session en cours de restauration → on n'affiche rien (évite un flash) ;
 * - non connecté                     → redirection vers /auth en mémorisant la
 *                                       destination (retour après connexion) ;
 * - rôle insuffisant                 → redirection vers l'accueil.
 */
export default function ProtectedRoute({ minRole, children }) {
  const { user, loading, hasMinRole } = useAuth()
  const location = useLocation()

  if (loading) return null

  if (!user) {
    // Wireframe : une page protégée renvoie le visiteur vers l'espace login /members.
    return <Navigate to="/members" replace state={{ from: location.pathname }} />
  }

  if (minRole && !hasMinRole(minRole)) {
    return <Navigate to="/" replace />
  }

  return children
}
