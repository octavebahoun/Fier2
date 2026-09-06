import { useCallback, useEffect, useState } from 'react'
import { Settings2, UserMinus, Users, Loader2, Save, X } from 'lucide-react'
import api from '../../services/api.js'
import PageHeader from '../../components/ui/PageHeader.jsx'
import SectionCard from '../../components/ui/SectionCard.jsx'
import StatePanel from '../../components/ui/StatePanel.jsx'
import { useToast } from '../../components/ui/Toast.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useClubSpace, shouldShowClubPicker } from './useClubSpace.js'
import { ClubPicker, champ, etiquette, boutonPrimaire, memberBadge, nomComplet } from './shared.jsx'

/**
 * Gérer le club — la fiche et la composition.
 *
 * Deux droits vivaient sans interface : `PUT /clubs/:id` (`club:edit`) et
 * `DELETE /memberships/:clubId/user/:userId` (`membership:remove`). Un
 * responsable ne pouvait ni corriger la description de son club, ni en retirer
 * quelqu'un — les deux passaient par un appel API à la main.
 *
 * Les deux tiennent sur le même écran parce qu'ils répondent à la même
 * question : de quoi ce club est-il fait ? La lecture (membres, projets) reste
 * sur « Mon club » ; ici on modifie.
 *
 * ── Sur le retrait ────────────────────────────────────────────────────────
 * L'exclusion est irréversible et se fait sur quelqu'un : elle demande donc une
 * seconde intention. La ligne se transforme en « Confirmer / Annuler » plutôt
 * que d'ouvrir une fenêtre — la personne concernée reste sous les yeux au
 * moment de trancher.
 */
export default function GestionClub() {
  const { notify } = useToast()
  const { can } = useAuth()
  const { clubs, clubsLoading, clubsError, clubId, club, setClubId, canSupervise } = useClubSpace()

  const peutEditer = can('club:edit', { clubId })
  const peutRetirer = can('membership:remove', { clubId })

  const [fiche, setFiche] = useState({ name: '', discipline: '', description: '' })
  const [enregistrement, setEnregistrement] = useState(false)

  const [members, setMembers] = useState([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [membersError, setMembersError] = useState(null)
  const [aConfirmer, setAConfirmer] = useState(null)
  const [retraitEnCours, setRetraitEnCours] = useState(null)

  // La fiche se recharge quand le club change : on n'édite jamais un formulaire
  // rempli avec les valeurs d'un autre club.
  useEffect(() => {
    setFiche({
      name: club?.name || club?.title || '',
      discipline: club?.discipline || '',
      description: club?.description || '',
    })
  }, [club])

  const chargerMembres = useCallback(async () => {
    if (!clubId) { setMembers([]); return }
    setMembersLoading(true)
    setMembersError(null)
    try {
      const res = await api.clubSpace.membersList(clubId)
      setMembers(res?.success && res.data?.members ? res.data.members : [])
    } catch (err) {
      setMembers([])
      setMembersError(
        err?.status === 403
          ? "Vous n'êtes pas responsable de ce club."
          : (err?.serverMessage || err?.message || "Les membres n'ont pas pu être chargés."),
      )
    } finally {
      setMembersLoading(false)
    }
  }, [clubId])

  useEffect(() => { chargerMembres() }, [chargerMembres])

  const enregistrer = async (e) => {
    e.preventDefault()
    if (enregistrement || !clubId) return
    if (!fiche.name.trim()) return notify('Le club a besoin d’un nom.', 'warning')
    if (!fiche.discipline.trim()) return notify('Indiquez la discipline du club.', 'warning')

    setEnregistrement(true)
    try {
      const res = await api.clubs.update(clubId, {
        name: fiche.name.trim(),
        discipline: fiche.discipline.trim(),
        description: fiche.description.trim(),
      })
      if (!res?.success) throw new Error(res?.message)
      notify('La fiche du club est à jour.', 'success')
    } catch (err) {
      notify(err?.serverMessage || err?.message || "La fiche n'a pas pu être enregistrée.", 'error')
    } finally {
      setEnregistrement(false)
    }
  }

  const retirer = async (membre) => {
    const memberId = membre.memberId ?? membre.id
    if (retraitEnCours || !memberId) return
    setRetraitEnCours(memberId)
    try {
      const res = await api.memberships.remove(clubId, memberId)
      if (!res?.success) throw new Error(res?.message)
      notify(`${nomComplet(membre)} ne fait plus partie du club.`, 'success')
      setAConfirmer(null)
      await chargerMembres()
    } catch (err) {
      notify(err?.serverMessage || err?.message || "Le retrait n'a pas pu être effectué.", 'error')
    } finally {
      setRetraitEnCours(null)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <PageHeader
        tag="Espace CITE"
        icon={Settings2}
        title="Gérer le club"
        description="La fiche publique du club et la liste de ses membres."
      >
        {shouldShowClubPicker({ canSupervise, clubs }) && (
          <div className="mt-4">
            <ClubPicker clubs={clubs} clubId={clubId} onChange={setClubId} loading={clubsLoading} />
          </div>
        )}
      </PageHeader>

      {clubsError && <StatePanel state="error" message={clubsError} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard icon={Settings2} title="Fiche du club" subtitle="Ce que le public lit">
          {!peutEditer ? (
            <StatePanel
              state="empty"
              icon={Settings2}
              message="Seul le responsable de ce club peut modifier sa fiche."
            />
          ) : clubsLoading ? (
            <StatePanel state="loading" />
          ) : (
            <form onSubmit={enregistrer} className="flex flex-col gap-4">
              <div>
                <label className={etiquette} htmlFor="cl-nom">Nom</label>
                <input
                  id="cl-nom"
                  type="text"
                  required
                  value={fiche.name}
                  onChange={(e) => setFiche({ ...fiche, name: e.target.value })}
                  className={champ}
                />
              </div>

              <div>
                <label className={etiquette} htmlFor="cl-discipline">Discipline</label>
                <input
                  id="cl-discipline"
                  type="text"
                  required
                  value={fiche.discipline}
                  onChange={(e) => setFiche({ ...fiche, discipline: e.target.value })}
                  placeholder="Ex : énergie et réseaux électriques"
                  className={champ}
                />
              </div>

              <div>
                <label className={etiquette} htmlFor="cl-description">Description</label>
                <textarea
                  id="cl-description"
                  rows={6}
                  value={fiche.description}
                  onChange={(e) => setFiche({ ...fiche, description: e.target.value })}
                  placeholder="Ce sur quoi le club travaille, et ce qu’on y fait en le rejoignant."
                  className={`${champ} min-h-36 py-2 leading-relaxed`}
                />
              </div>

              <button type="submit" disabled={enregistrement || !clubId} className={boutonPrimaire}>
                {enregistrement
                  ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  : <Save className="h-4 w-4" aria-hidden="true" />}
                {enregistrement ? 'Enregistrement…' : 'Enregistrer la fiche'}
              </button>
            </form>
          )}
        </SectionCard>

        <SectionCard
          icon={Users}
          title="Membres"
          subtitle={members.length ? `${members.length} inscrit${members.length > 1 ? 's' : ''}` : undefined}
          accent="var(--color-ember)"
        >
          {membersLoading ? (
            <StatePanel state="loading" />
          ) : membersError ? (
            <StatePanel state="error" message={membersError} onRetry={chargerMembres} />
          ) : members.length === 0 ? (
            <StatePanel state="empty" icon={Users} message="Aucun membre inscrit dans ce club." />
          ) : (
            <ul className="flex max-h-[32rem] flex-col gap-2 overflow-y-auto">
              {members.map((m, i) => {
                const memberId = m.memberId ?? m.id
                const badge = memberBadge(m)
                const enAttente = aConfirmer === memberId
                return (
                  <li
                    key={memberId || i}
                    className="flex flex-wrap items-center justify-between gap-3 border border-border-subtle bg-bg-primary px-3 py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-text-primary">{nomComplet(m)}</p>
                      <p className="truncate text-sm text-text-muted">
                        {m.email || 'Adresse non renseignée'}
                      </p>
                    </div>

                    {enAttente ? (
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => retirer(m)}
                          disabled={retraitEnCours === memberId}
                          className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 border border-danger bg-danger-wash px-3 text-sm font-bold text-danger transition-colors hover:bg-danger-wash disabled:opacity-50"
                        >
                          {retraitEnCours === memberId
                            ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                            : <UserMinus className="h-4 w-4" aria-hidden="true" />}
                          Confirmer le retrait
                        </button>
                        <button
                          type="button"
                          onClick={() => setAConfirmer(null)}
                          className="inline-flex min-h-11 w-11 cursor-pointer items-center justify-center border border-border-strong text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
                          aria-label={`Annuler le retrait de ${nomComplet(m)}`}
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex shrink-0 items-center gap-2">
                        <span className={`border px-2 py-0.5 text-xs font-bold ${badge.className}`}>
                          {badge.label}
                        </span>
                        {peutRetirer && (
                          <button
                            type="button"
                            onClick={() => setAConfirmer(memberId)}
                            className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 border border-border-strong px-3 text-sm font-semibold text-text-secondary transition-colors hover:border-danger hover:text-danger"
                          >
                            <UserMinus className="h-4 w-4" aria-hidden="true" />
                            <span className="sr-only sm:not-sr-only">Retirer</span>
                          </button>
                        )}
                      </div>
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
