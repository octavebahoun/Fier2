import { Navigate, useLocation } from 'react-router-dom'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { routeAccessOf, getDestination } from '../navigation/destinations.js'
import { useAppNavigate } from '../navigation.js'

/**
 * ProtectedRoute — garde de route, alimentée par le registre des destinations.
 *
 *   <ProtectedRoute destination="gouvernance"><Gouvernance /></ProtectedRoute>
 *
 * La règle d'accès n'est PAS écrite ici : elle est lue dans
 * `navigation/destinations.js`, le même fichier que consultent la barre
 * latérale et la palette. Une entrée de menu ne peut donc plus mener à une page
 * qui refuse de s'ouvrir (constats F04 et F06).
 *
 * Trois issues :
 *   • session en cours de restauration → on n'affiche rien (évite un flash) ;
 *   • non connecté                     → /members, destination mémorisée ;
 *   • connecté mais sans le droit      → on EXPLIQUE, au lieu d'une redirection
 *     muette vers l'accueil qui laissait l'utilisateur sans indice.
 */
export default function ProtectedRoute({ destination, capability, children }) {
  const { user, loading, can, why } = useAuth()
  const location = useLocation()

  if (loading) return null

  const access = capability ? { capability } : routeAccessOf(destination)

  // Destination publique : rien à garder.
  if (access === 'public') return children

  if (!user) {
    return <Navigate to="/members" replace state={{ from: location.pathname }} />
  }

  const required = access?.anyOf ?? (access?.capability ? [access.capability] : [])
  if (required.length === 0) return children

  // `anyOf` : une seule capacité suffit — un responsable de club et un
  // secrétaire n'entrent pas par la même porte, mais entrent tous les deux.
  const granted = required.some((cap) => can(cap))
  if (granted) return children

  return <AccessDenied reason={why(required[0])} destination={destination} />
}

function AccessDenied({ reason, destination }) {
  const navigate = useAppNavigate()
  const label = getDestination(destination)?.label

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-5 px-6 py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center border border-border-strong bg-bg-secondary">
        <ShieldAlert className="h-5 w-5 text-ember" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-text-primary">
          {label ? `« ${label} » ne vous est pas ouvert` : 'Page non accessible'}
        </h1>
        <p className="text-sm leading-relaxed text-text-secondary">
          {reason || "Votre rôle ne permet pas d'ouvrir cette page."}
        </p>
        <p className="text-sm leading-relaxed text-text-secondary">
          Si vous pensez que c’est une erreur, demandez à votre administrateur de
          vérifier votre rôle et votre poste de gouvernance.
        </p>
      </div>
      <button
        type="button"
        onClick={() => navigate('dashboard')}
        className="inline-flex min-h-11 cursor-pointer items-center gap-2 border border-border-strong bg-bg-secondary px-5 text-sm font-bold text-text-primary transition-colors hover:bg-bg-tertiary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Retour au tableau de bord
      </button>
    </div>
  )
}
