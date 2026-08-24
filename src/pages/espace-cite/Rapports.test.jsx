/** @vitest-environment jsdom */

/**
 * Une seule promesse : ce que l'écran affiche vient du serveur, et rien
 * d'autre. Ces tests échouent si l'on réintroduit des données inventées, un
 * stockage local, ou un message de succès posé sur un échec.
 *
 * Ils portaient sur l'ancien écran unique ; ils portent désormais sur l'écran
 * Rapports, issu de son découpage.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'

import Rapports from './Rapports.jsx'
import { ToastProvider } from '../../components/ui/Toast.jsx'

const H = vi.hoisted(() => ({
  user: {
    id: 42,
    firstname: 'Sec',
    lastname: 'Générale',
    email: 'sec@uac.bj',
    role: 'ETUDIANT',
    universityPost: { post: 'SECRETAIRE', universityId: 7 },
    universityId: 7,
  },
}))

// Le mock ne réimplémente pas les droits : il fournit une identité et laisse
// le vrai résolveur répondre.
vi.mock('../../context/AuthContext.jsx', async (importOriginal) => {
  const actual = await importOriginal()
  const { readIdentity, resolve } = await import('../../auth/access.js')
  return {
    ...actual,
    useAuth: () => {
      const identity = readIdentity(H.user)
      return {
        user: H.user,
        identity,
        can: (capability, ctx) => resolve(identity, capability, ctx),
        universityPost: identity.universityPost,
        universityId: identity.universityId,
      }
    },
  }
})

const mockUniversityReports = vi.fn()
const mockSubmitReport = vi.fn()

vi.mock('../../services/api.js', () => {
  const api = {
    clubSpace: {
      myDashboard: () => Promise.resolve({ success: true, data: { projects: [], assignedActivities: [] } }),
      membersList: () => Promise.resolve({ success: true, data: { members: [] } }),
      universityReports: (...a) => mockUniversityReports(...a),
      submitReport: (...a) => mockSubmitReport(...a),
      submitCensus: () => Promise.resolve({ success: true, data: { memberCount: 3 } }),
    },
    clubs: { getAll: () => Promise.resolve({ success: true, data: [{ id: 'c1', name: 'Club Dev Web' }] }) },
    members: { list: () => Promise.resolve({ success: true, data: [] }) },
    memberships: { getPendingRequests: () => Promise.resolve({ success: true, data: [] }) },
  }
  return { api, default: api }
})

const afficher = () =>
  render(
    <MemoryRouter>
      <ToastProvider>
        <Rapports />
      </ToastProvider>
    </MemoryRouter>,
  )

beforeEach(() => {
  cleanup()
  H.user.universityPost = { post: 'SECRETAIRE', universityId: 7 }
  mockUniversityReports.mockReset()
  mockSubmitReport.mockReset()
  localStorage.clear()
})

afterEach(() => cleanup())

describe('Rapports — la liste vient du serveur', () => {
  it('affiche exactement les rapports renvoyés par l’API', async () => {
    mockUniversityReports.mockResolvedValue({
      success: true,
      data: [{
        id: 9,
        club: { name: 'Club Robotique' },
        period: '2026-08',
        title: 'Cartographie SLAM',
        content: 'Deux prototypes testés.',
        createdAt: '2026-08-12T10:00:00.000Z',
      }],
    })

    afficher()

    expect(await screen.findByText('Cartographie SLAM')).toBeInTheDocument()
    expect(screen.getByText(/Club Robotique/)).toBeInTheDocument()
    expect(mockUniversityReports).toHaveBeenCalledWith(7)
  })

  it('affiche un état vide honnête quand l’API ne renvoie rien', async () => {
    mockUniversityReports.mockResolvedValue({ success: true, data: [] })

    afficher()

    expect(await screen.findByText(/Aucun rapport transmis pour le moment/i)).toBeInTheDocument()
    // Les rapports de démonstration d'autrefois ne doivent plus exister.
    expect(screen.queryByText(/Bilan Activités Web & API Hub/i)).not.toBeInTheDocument()
  })

  it('remonte l’erreur du serveur au lieu d’une liste vide silencieuse', async () => {
    mockUniversityReports.mockRejectedValue(Object.assign(new Error('boom'), {
      serverMessage: 'Vous n’avez pas le poste requis pour gérer cette université.',
    }))

    afficher()

    expect(await screen.findByText(/poste requis pour gérer cette université/i)).toBeInTheDocument()
  })
})

describe('Rapports — la soumission dit la vérité', () => {
  beforeEach(() => {
    // Un responsable de club : il dépose au lieu de lire.
    H.user.universityPost = null
    H.user.role = 'RESPONSABLE'
    H.user.responsibleClubIds = ['c1']
  })

  afterEach(() => {
    H.user.role = 'ETUDIANT'
    H.user.responsibleClubIds = []
  })

  it('affiche une erreur quand le serveur refuse le rapport', async () => {
    mockUniversityReports.mockResolvedValue({ success: true, data: [] })
    mockSubmitReport.mockRejectedValue(Object.assign(new Error('refus'), {
      serverMessage: 'Rapport déjà transmis pour cette période.',
    }))

    afficher()
    const utilisateur = userEvent.setup()

    await utilisateur.type(await screen.findByLabelText('Période'), '2026-08')
    await utilisateur.type(screen.getByLabelText('Titre'), 'Bilan')
    await utilisateur.type(screen.getByLabelText('Contenu'), 'Travaux du mois.')
    await utilisateur.click(screen.getByRole('button', { name: /Transmettre le rapport/i }))

    expect(await screen.findByText(/Rapport déjà transmis pour cette période/i)).toBeInTheDocument()
    // Aucun accusé de succès ne doit accompagner un échec : l'écran de
    // gouvernance annonçait la transmission même quand elle avait échoué.
    expect(screen.queryByText(/Rapport « Bilan » transmis/i)).not.toBeInTheDocument()
  })

  it('relit la liste depuis l’API après un envoi réussi', async () => {
    mockUniversityReports.mockResolvedValue({ success: true, data: [] })
    mockSubmitReport.mockResolvedValue({ success: true, message: 'Rapport transmis.' })

    afficher()
    const utilisateur = userEvent.setup()

    await utilisateur.type(await screen.findByLabelText('Période'), '2026-08')
    await utilisateur.type(screen.getByLabelText('Titre'), 'Bilan')
    await utilisateur.type(screen.getByLabelText('Contenu'), 'Travaux du mois.')
    await utilisateur.click(screen.getByRole('button', { name: /Transmettre le rapport/i }))

    await waitFor(() => expect(mockSubmitReport).toHaveBeenCalledTimes(1))
  })
})

describe('Rapports — le Chef Universitaire lit bien la liste', () => {
  it('charge les rapports pour un Chef qui n’est pas Secrétaire', async () => {
    H.user.universityPost = { post: 'CHEF_UNIVERSITAIRE', universityId: 7 }
    mockUniversityReports.mockResolvedValue({
      success: true,
      data: [{ id: 3, club: { name: 'Club IA' }, period: '2026-07', title: 'Veille LLM', content: '' }],
    })

    afficher()

    expect(await screen.findByText('Veille LLM')).toBeInTheDocument()
    expect(mockUniversityReports).toHaveBeenCalledWith(7)
  })
})
