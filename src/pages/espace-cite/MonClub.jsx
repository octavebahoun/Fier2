import { useEffect, useState } from 'react'
import { Users, FolderKanban, ArrowRight } from 'lucide-react'
import api from '../../services/api.js'
import PageHeader from '../../components/ui/PageHeader.jsx'
import SectionCard from '../../components/ui/SectionCard.jsx'
import StatePanel from '../../components/ui/StatePanel.jsx'
import { useClubSpace, shouldShowClubPicker } from './useClubSpace.js'
import { ClubPicker, statusBadge, memberBadge, nomComplet } from './shared.jsx'

/**
 * Mon club — qui en fait partie, et sur quoi il travaille.
 *
 * Une seule intention : lire l'état du club. Les actions (valider une adhésion,
 * assigner une activité, déposer un rapport) vivent sur leurs propres écrans —
 * elles étaient auparavant empilées ici, neuf blocs sur une page.
 */
export default function MonClub({ navigate }) {
  const {
    clubs, clubsLoading, clubsError, clubId, club, setClubId, canSupervise,
  } = useClubSpace()

  const [members, setMembers] = useState([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [membersError, setMembersError] = useState(null)

  const [projects, setProjects] = useState([])
  const [projectsLoading, setProjectsLoading] = useState(false)

  useEffect(() => {
    if (!clubId) { setMembers([]); return }
    let actif = true
    ;(async () => {
      setMembersLoading(true)
      setMembersError(null)
      try {
        const res = await api.clubSpace.membersList(clubId)
        if (!actif) return
        setMembers(res?.success && res.data?.members ? res.data.members : [])
      } catch (err) {
        if (!actif) return
        setMembers([])
        setMembersError(err?.serverMessage || err?.message || "Les membres n'ont pas pu être chargés.")
      } finally {
        if (actif) setMembersLoading(false)
      }
    })()
    return () => { actif = false }
  }, [clubId])

  useEffect(() => {
    let actif = true
    ;(async () => {
      setProjectsLoading(true)
      try {
        const res = await api.clubSpace.myDashboard()
        if (!actif) return
        const data = res?.data ?? res ?? {}
        setProjects(Array.isArray(data.projects) ? data.projects : [])
      } catch {
        if (actif) setProjects([])
      } finally {
        if (actif) setProjectsLoading(false)
      }
    })()
    return () => { actif = false }
  }, [clubId])

  // Membre rattaché à aucun club : le dire, et proposer la suite.
  if (!clubsLoading && !clubId && !canSupervise) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <PageHeader
          tag="Espace CITE"
          icon={Users}
          title="Vous n’êtes membre d’aucun club"
          description="L’espace CITE présente la vie de votre club de recherche. Rejoignez-en un pour y accéder : votre demande sera validée par le responsable du club."
        />
        <button
          type="button"
          onClick={() => navigate('clubs')}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 bg-engine px-5 text-sm font-bold text-white transition-colors hover:bg-engine-deep"
        >
          Découvrir les clubs <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        tag="Espace CITE"
        icon={Users}
        title={club?.name || 'Mon club'}
        description="Les membres du club et les travaux de recherche en cours."
      >
        {shouldShowClubPicker({ canSupervise, clubs }) && (
          <div className="mt-4">
            <ClubPicker clubs={clubs} clubId={clubId} onChange={setClubId} loading={clubsLoading} />
          </div>
        )}
      </PageHeader>

      {clubsError && <StatePanel state="error" message={clubsError} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          icon={Users}
          title="Membres"
          subtitle={members.length ? `${members.length} inscrit${members.length > 1 ? 's' : ''}` : undefined}
        >
          {membersLoading ? (
            <StatePanel state="loading" />
          ) : membersError ? (
            <StatePanel state="error" message={membersError} />
          ) : members.length === 0 ? (
            <StatePanel state="empty" message="Aucun membre inscrit dans ce club pour le moment." icon={Users} />
          ) : (
            <ul className="flex max-h-96 flex-col gap-2 overflow-y-auto">
              {members.map((m, i) => {
                const badge = memberBadge(m)
                return (
                  <li
                    key={m.memberId || m.id || i}
                    className="flex items-center justify-between gap-3 border border-border-subtle bg-bg-primary px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text-primary">{nomComplet(m)}</p>
                      <p className="truncate text-sm text-text-muted">{m.email || 'Adresse non renseignée'}</p>
                    </div>
                    <span className={`shrink-0 border px-2 py-0.5 text-xs font-bold ${badge.className}`}>
                      {badge.label}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          icon={FolderKanban}
          title="Projets de recherche"
          subtitle="Travaux actifs du club"
          accent="var(--color-ember)"
        >
          {projectsLoading ? (
            <StatePanel state="loading" />
          ) : projects.length === 0 ? (
            <StatePanel state="empty" message="Aucun projet actif pour ce club." icon={FolderKanban} />
          ) : (
            <ul className="flex max-h-96 flex-col gap-2 overflow-y-auto">
              {projects.map((p) => {
                const badge = statusBadge(p.status)
                return (
                  <li key={p.id} className="border border-border-subtle bg-bg-primary px-3 py-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-semibold leading-snug text-text-primary">{p.title}</h3>
                      <span className={`shrink-0 border px-2 py-0.5 text-xs font-bold ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                    {p.description && (
                      <p className="mt-1 text-sm text-text-secondary">{p.description}</p>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
