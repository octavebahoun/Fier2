import React from 'react'
import { getRolePresentation } from '../context/AuthContext.jsx'

/**
 * RoleBadge — affichage cohérent d'un rôle utilisateur.
 * Source unique de vérité : ROLE_PRESENTATION dans AuthContext.
 * La casse est normalisée en interne (plus de comparaison `role === 'ADMIN'`).
 *
 * @param {string}  role     Rôle brut (ADMIN, CHERCHEUR, MENTOR, ETUDIANT, VISITEUR…)
 * @param {'pill'|'text'} variant  'pill' = pastille fond+bordure (navbar) ; 'text' = libellé coloré (sidebar)
 * @param {string}  className Classes de mise en page (taille, tracking…) fournies par l'appelant
 */
export default function RoleBadge({ role, variant = 'pill', className = '' }) {
  const presentation = getRolePresentation(role)

  if (variant === 'text') {
    return (
      <span className={`${presentation.textClassName} ${className}`.trim()}>
        {presentation.label}
      </span>
    )
  }

  return (
    <span className={`${presentation.badgeClassName} ${className}`.trim()}>
      {presentation.short}
    </span>
  )
}
