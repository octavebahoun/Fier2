import { ChevronDown } from 'lucide-react'
import { getRolePresentation, getPostPresentation } from '../../context/AuthContext.jsx'
import { readIdentity } from '../../auth/access.js'

/** Statuts de projet et d'activité, libellés une fois. */
const STATUS_META = {
  TODO:        { label: 'À faire',  className: 'border-amber-500 text-amber-400' },
  IN_PROGRESS: { label: 'En cours', className: 'border-engine text-engine' },
  DONE:        { label: 'Terminée', className: 'border-emerald-500 text-emerald-400' },
  ACTIVE:      { label: 'Actif',    className: 'border-emerald-500 text-emerald-400' },
  ARCHIVED:    { label: 'Archivé',  className: 'border-border-strong text-text-muted' },
}

export const statusBadge = (status) =>
  STATUS_META[status] || { label: status || '—', className: 'border-border-strong text-text-muted' }

/** Date courte. Un tiret si la valeur manque : on n'affiche pas ce qu'on n'a pas. */
export const formatDateFr = (valeur) => {
  if (!valeur) return '—'
  const d = new Date(valeur)
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const nomComplet = (m) =>
  m?.name
  || [m?.firstName ?? m?.firstname, m?.lastName ?? m?.lastname].filter(Boolean).join(' ')
  || m?.email
  || 'Membre'

/**
 * L'étiquette d'un membre : son poste de gouvernance s'il en a un, sinon son
 * rôle. Les libellés viennent des tables de présentation.
 */
export function memberBadge(m) {
  const identity = readIdentity(m)
  const post = getPostPresentation(identity.universityPost || identity.countryPost)
  if (post) return { label: post.short, className: post.badgeClassName }
  if (identity.role !== 'RESPONSABLE' && identity.responsibleClubIds.length > 0) {
    const resp = getRolePresentation('RESPONSABLE')
    return { label: resp.short, className: resp.badgeClassName }
  }
  const role = getRolePresentation(identity.role)
  return { label: role.short, className: role.badgeClassName }
}

/** Sélecteur de club — affiché seulement quand il y a réellement un choix. */
export function ClubPicker({ clubs, clubId, onChange, loading }) {
  return (
    <label className="flex items-center gap-2 border border-border-strong bg-bg-secondary px-3 py-2">
      <span className="shrink-0 text-xs font-semibold text-text-secondary">Club</span>
      <div className="relative">
        <select
          value={clubId || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading}
          className="min-h-11 w-full min-w-[12rem] cursor-pointer appearance-none bg-transparent pr-7 text-sm font-semibold text-text-primary outline-none disabled:opacity-50"
        >
          <option value="">Sélectionner un club…</option>
          {clubs.map((c) => (
            <option key={c.id} value={c.id}>{c.name || c.title}</option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-1 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
          aria-hidden="true"
        />
      </div>
    </label>
  )
}

/** Styles de formulaire partagés par les écrans CITE. */
export const champ =
  'min-h-11 w-full border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:border-engine focus-visible:outline-none'
export const etiquette = 'mb-1.5 block text-sm font-semibold text-text-secondary'
export const boutonPrimaire =
  'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 bg-engine px-5 text-sm font-bold text-white transition-colors hover:bg-engine-deep disabled:cursor-not-allowed disabled:opacity-50'
