import { useCallback, useEffect, useState } from 'react'
import { Star, Loader2, Search } from 'lucide-react'
import api from '../../services/api.js'
import PageHeader from '../../components/ui/PageHeader.jsx'
import SectionCard from '../../components/ui/SectionCard.jsx'
import StatePanel from '../../components/ui/StatePanel.jsx'
import { useToast } from '../../components/ui/Toast.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useUniversityScope } from './useUniversityScope.js'
import UniversitySelector from './UniversitySelector.jsx'
import { memberBadge, nomComplet, champ } from '../espace-cite/shared.jsx'

/**
 * Figures emblématiques — qui l'université met en avant.
 *
 * Une seule liste, un seul geste par ligne. Le statut est visible sur la ligne
 * elle-même : on voit d'un coup d'œil qui est distingué, sans avoir à croiser
 * deux tableaux comme le faisait l'ancienne page.
 */
export default function Figures() {
  const { notify } = useToast()
  const { can } = useAuth()
  const scope = useUniversityScope()
  const { universityId, besoinSelecteur } = scope

  const canMark = can('member:toggleEmblematic', { universityId })

  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [recherche, setRecherche] = useState('')

  const load = useCallback(async () => {
    if (!universityId) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.members.list({ limit: 200 })
      const liste = res?.success ? (res.data || []) : []
      setMembers(liste.filter(
        (m) => m.universityId === universityId || m.branch?.universityId === universityId,
      ))
    } catch (err) {
      setMembers([])
      setError(err?.serverMessage || err?.message || "Les membres n'ont pas pu être chargés.")
    } finally {
      setLoading(false)
    }
  }, [universityId])

  useEffect(() => { load() }, [load])

  const basculer = async (membre) => {
    if (busyId) return
    const etait = !!membre.isEmblematic
    setBusyId(membre.id)
    setMembers((list) => list.map((m) => (m.id === membre.id ? { ...m, isEmblematic: !etait } : m)))
    try {
      const res = await api.governance.toggleEmblematic(membre.id, !etait)
      if (!res?.success) throw new Error(res?.message)
      notify(
        etait
          ? `${nomComplet(membre)} n’est plus une figure emblématique.`
          : `${nomComplet(membre)} est désormais une figure emblématique.`,
        'success',
      )
    } catch (err) {
      setMembers((list) => list.map((m) => (m.id === membre.id ? { ...m, isEmblematic: etait } : m)))
      notify(err?.serverMessage || err?.message || "Le statut n'a pas pu être changé.", 'error')
    } finally {
      setBusyId(null)
    }
  }

  if (besoinSelecteur && !universityId) {
    return <UniversitySelector scope={scope} titre="Figures emblématiques" />
  }

  const q = recherche.trim().toLowerCase()
  const filtres = q
    ? members.filter((m) => nomComplet(m).toLowerCase().includes(q) || String(m.email || '').toLowerCase().includes(q))
    : members
  const distingues = members.filter((m) => m.isEmblematic).length

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <PageHeader
        tag="Gouvernance"
        icon={Star}
        title="Figures emblématiques"
        description="Les membres mis en avant dans la gouvernance publique de l’université."
      />

      <SectionCard
        icon={Star}
        title="Membres de l’université"
        subtitle={loading ? undefined : `${distingues} distingué${distingues > 1 ? 's' : ''} sur ${members.length}`}
        actions={
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
            <input
              type="search"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Nom ou e-mail"
              aria-label="Rechercher un membre"
              className={`${champ} w-full pl-9 sm:w-56`}
            />
          </div>
        }
      >
        {loading ? (
          <StatePanel state="loading" />
        ) : error ? (
          <StatePanel state="error" message={error} onRetry={load} />
        ) : filtres.length === 0 ? (
          <StatePanel
            state="empty"
            icon={Star}
            message={q ? `Aucun membre ne correspond à « ${recherche} ».` : 'Aucun membre rattaché à cette université.'}
          />
        ) : (
          <ul className="flex max-h-[36rem] flex-col gap-2 overflow-y-auto">
            {filtres.map((m) => {
              const badge = memberBadge(m)
              return (
                <li
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-3 border border-border-subtle bg-bg-primary px-3 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Star
                      className={`h-4 w-4 shrink-0 ${m.isEmblematic ? 'fill-current text-ember' : 'text-text-muted'}`}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text-primary">{nomComplet(m)}</p>
                      <p className="truncate text-sm text-text-muted">{m.email || 'Adresse non renseignée'}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`border px-2 py-0.5 text-xs font-bold ${badge.className}`}>{badge.label}</span>
                    <button
                      type="button"
                      onClick={() => basculer(m)}
                      disabled={!canMark || busyId === m.id}
                      className="inline-flex min-h-11 cursor-pointer items-center gap-2 border border-border-strong px-3 text-sm font-bold text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {busyId === m.id && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
                      {m.isEmblematic ? 'Retirer' : 'Distinguer'}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </SectionCard>
    </div>
  )
}
