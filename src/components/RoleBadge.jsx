import React from 'react'
import { getRolePresentation } from '../context/AuthContext.jsx'
import { Shield, Crown, Briefcase, BookOpen, Award, GraduationCap, User } from 'lucide-react'

const ROLE_ICONS = {
  ADMIN: Shield,
  RESPONSABLE: Crown,
  CHEF_DE_PROJET: Briefcase,
  CHERCHEUR: BookOpen,
  MENTOR: Award,
  ETUDIANT: GraduationCap,
  VISITEUR: User,
}

/**
 * RoleBadge — affichage cohérent d'un rôle utilisateur.
 * Source unique de vérité : ROLE_PRESENTATION dans AuthContext.
 *
 * @param {string}  role     Rôle brut (ADMIN, CHERCHEUR, MENTOR, ETUDIANT, VISITEUR…)
 * @param {'pill'|'text'} variant  'pill' = pastille fond+bordure ; 'text' = libellé coloré
 * @param {boolean} showIcon  Affiche l'icône représentative du rôle
 * @param {string}  className Classes de mise en page
 */
export default function RoleBadge({ role, variant = 'pill', showIcon = true, className = '' }) {
  const presentation = getRolePresentation(role)
  const normalizedKey = String(role || '').toUpperCase()
  const IconComponent = ROLE_ICONS[normalizedKey] || User

  const tooltipText = `${presentation.label} — ${presentation.description || 'Rôle plateforme'}`

  if (variant === 'text') {
    return (
      <span
        title={tooltipText}
        className={`inline-flex items-center gap-1.5 ${presentation.textClassName} ${className}`.trim()}
      >
        {showIcon && <IconComponent className="w-3 h-3 shrink-0" aria-hidden="true" />}
        <span>{presentation.label}</span>
      </span>
    )
  }

  return (
    <span
      title={tooltipText}
      className={`inline-flex items-center gap-1.5 ${presentation.badgeClassName} ${className}`.trim()}
    >
      {showIcon && <IconComponent className="w-3 h-3 shrink-0" aria-hidden="true" />}
      <span>{presentation.short}</span>
    </span>
  )
}
