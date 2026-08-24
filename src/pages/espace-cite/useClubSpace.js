import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'

/**
 * useClubSpace — le contexte partagé des écrans CITE.
 *
 * Les cinq écrans issus du découpage ont besoin de la même chose : quel club
 * regarde-t-on, et de quel droit. Cette question est résolue ici une fois.
 *
 * Le club sélectionné vit dans l'URL (`?club=3`) : un secrétaire qui passe des
 * rapports à l'annuaire garde son club, le lien est partageable, et le retour
 * arrière restitue l'état — ce qu'un état local ne sait pas faire.
 */
export function useClubSpace() {
  const { user, can, universityId } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [clubs, setClubs] = useState([])
  const [clubsLoading, setClubsLoading] = useState(true)
  const [clubsError, setClubsError] = useState(null)

  // Le club du membre : sa responsabilité d'abord, son adhésion ensuite.
  const ownClubId = useMemo(() => {
    const candidats = [
      user?.responsibleClubIds?.[0],
      user?.clubId,
      user?.clubMemberships?.[0]?.clubId,
      user?.memberships?.[0]?.clubId,
    ]
    const trouve = candidats.find((v) => v !== undefined && v !== null && v !== '')
    return trouve === undefined ? '' : String(trouve)
  }, [user])

  // Supervision transversale : le secrétariat et le chef universitaire lisent
  // les rapports de tous les clubs, ils peuvent donc en choisir un.
  const canSupervise = can('report:read', { universityId })

  const urlClubId = searchParams.get('club') || ''
  const clubId = urlClubId || ownClubId || (canSupervise ? String(clubs[0]?.id ?? '') : '')

  const setClubId = useCallback((next) => {
    setSearchParams((params) => {
      const copie = new URLSearchParams(params)
      if (next) copie.set('club', String(next))
      else copie.delete('club')
      return copie
    }, { replace: true })
  }, [setSearchParams])

  useEffect(() => {
    let actif = true
    ;(async () => {
      setClubsLoading(true)
      setClubsError(null)
      try {
        const res = await api.clubs.getAll()
        if (!actif) return
        setClubs(res?.success && Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        if (!actif) return
        setClubs([])
        setClubsError(err?.serverMessage || err?.message || "La liste des clubs n'a pas pu être chargée.")
      } finally {
        if (actif) setClubsLoading(false)
      }
    })()
    return () => { actif = false }
  }, [])

  const club = useMemo(
    () => clubs.find((c) => String(c.id) === String(clubId)) || null,
    [clubs, clubId],
  )

  return {
    clubs,
    clubsLoading,
    clubsError,
    clubId,
    club,
    setClubId,
    ownClubId,
    canSupervise,
    universityId,
    // Droits, résolus sur le club effectivement regardé.
    canReviewMemberships: can('membership:review', { clubId }),
    canAssignActivity:    can('activity:assign', { clubId }),
    canSubmitReport:      can('report:submit', { clubId }),
    canSubmitCensus:      can('census:submit', { clubId }),
    canValidateCensus:    can('census:validate', { universityId }),
    canReadReports:       can('report:read', { universityId }),
  }
}

/**
 * ClubPicker — le sélecteur de club, pour qui supervise plusieurs clubs.
 * Rendu par les écrans qui en ont besoin, jamais imposé à un responsable qui
 * n'a qu'un club : lui présenter un choix d'un seul élément est du bruit.
 */
export function shouldShowClubPicker({ canSupervise, clubs }) {
  return canSupervise && clubs.length > 1
}
