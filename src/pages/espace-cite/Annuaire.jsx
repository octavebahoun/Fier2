import { useEffect, useMemo, useState } from 'react'
import { Contact, Search } from 'lucide-react'
import api from '../../services/api.js'
import PageHeader from '../../components/ui/PageHeader.jsx'
import SectionCard from '../../components/ui/SectionCard.jsx'
import StatePanel from '../../components/ui/StatePanel.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { memberBadge, nomComplet, champ } from './shared.jsx'

/**
 * Annuaire de l'université — qui est où, tous clubs confondus.
 *
 * Cette table existait en double : une fois dans l'espace CITE, une fois dans
 * la page Gouvernance, avec deux mises en forme différentes pour le même appel.
 * Il n'en reste qu'une.
 *
 * Les 12 premières lignes ne sont plus les seules affichées : la liste complète
 * défile, et le compteur dit ce qu'on regarde.
 */
export default function Annuaire() {
  const { universityId } = useAuth()

  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [recherche, setRecherche] = useState('')

  useEffect(() => {
    let actif = true
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.members.list({ limit: 200 })
        if (!actif) return
        const liste = res?.success && Array.isArray(res.data) ? res.data : []
        // Périmètre : l'université qu'on administre, pas la plateforme entière.
        setMembers(
          universityId
            ? liste.filter(
                (m) => m.universityId === universityId || m.branch?.universityId === universityId,
              )
            : liste,
        )
      } catch (err) {
        if (!actif) return
        setMembers([])
        setError(
          err?.status === 403
            ? "Vous n'avez pas accès à l'annuaire de cette université."
            : (err?.serverMessage || err?.message || "L'annuaire n'a pas pu être chargé."),
        )
      } finally {
        if (actif) setLoading(false)
      }
    })()
    return () => { actif = false }
  }, [universityId])

  const filtres = useMemo(() => {
    const q = recherche.trim().toLowerCase()
    if (!q) return members
    return members.filter((m) => {
      const club = (m.clubName || m.club?.name || '').toLowerCase()
      return nomComplet(m).toLowerCase().includes(q)
        || club.includes(q)
        || String(m.email || '').toLowerCase().includes(q)
    })
  }, [members, recherche])

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        tag="Espace CITE"
        icon={Contact}
        title="Annuaire de l’université"
        description="Les membres de tous les clubs de votre université, avec leur rôle et leur poste."
      />

      <SectionCard
        icon={Contact}
        title="Membres"
        subtitle={
          loading ? undefined
            : recherche
              ? `${filtres.length} sur ${members.length}`
              : `${members.length} membre${members.length > 1 ? 's' : ''}`
        }
        actions={
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Nom, club ou e-mail"
              aria-label="Rechercher dans l’annuaire"
              className={`${champ} w-full pl-9 sm:w-64`}
            />
          </div>
        }
      >
        {loading ? (
          <StatePanel state="loading" />
        ) : error ? (
          <StatePanel state="error" message={error} />
        ) : members.length === 0 ? (
          <StatePanel state="empty" icon={Contact} message="Aucun membre rattaché à cette université." />
        ) : filtres.length === 0 ? (
          <StatePanel state="empty" icon={Search} message={`Aucun membre ne correspond à « ${recherche} ».`} />
        ) : (
          <div className="max-h-[36rem] overflow-auto">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <thead className="sticky top-0 bg-bg-secondary">
                <tr className="border-b border-border-strong text-text-secondary">
                  <th scope="col" className="px-3 py-2.5 font-semibold">Membre</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Club</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">E-mail</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Rôle</th>
                </tr>
              </thead>
              <tbody>
                {filtres.map((m, i) => {
                  const badge = memberBadge(m)
                  return (
                    <tr key={m.id || i} className="border-b border-border-subtle last:border-0">
                      <td className="px-3 py-2.5 font-semibold text-text-primary">{nomComplet(m)}</td>
                      <td className="px-3 py-2.5 text-text-secondary">{m.clubName || m.club?.name || '—'}</td>
                      <td className="px-3 py-2.5 text-text-secondary">{m.email || '—'}</td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-block border px-2 py-0.5 text-xs font-bold ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  )
}
