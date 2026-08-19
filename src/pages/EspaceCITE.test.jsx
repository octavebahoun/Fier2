/** @vitest-environment jsdom */

/**
 * Ces tests portent sur une seule promesse : ce que l'Espace CITE affiche
 * vient du serveur, et rien d'autre. Ils échouent si l'on réintroduit des
 * données inventées, un stockage local ou un message de succès sur un échec.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'

import EspaceCITE from './EspaceCITE.jsx'

// ── Identité simulée : Secrétaire Générale de l'université 7 ────────────────
let estSecretaire = true

vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: () => ({
    user: {
      id: 42,
      firstname: 'Sec',
      lastname: 'Générale',
      email: 'sec@uac.bj',
      role: 'ETUDIANT',
      universityPost: { post: 'SECRETAIRE', universityId: 7 },
      universityId: 7,
    },
    isClubResponsible: () => false,
    isSecretary: () => estSecretaire,
    isChefUniversitaire: () => false,
    // Le contexte expose le poste sous forme de chaîne, pas d'objet.
    universityPost: 'SECRETAIRE',
    universityId: 7,
  }),
}))

const mockUniversityReports = vi.fn()
const mockSubmitReport = vi.fn()
const mockMembersAll = vi.fn()

vi.mock('../services/api.js', () => {
  const api = {
    clubSpace: {
      myDashboard: () => Promise.resolve({ success: true, data: { projects: [], assignedActivities: [] } }),
      membersList: () => Promise.resolve({ success: true, data: { members: [] } }),
      universityReports: (...a) => mockUniversityReports(...a),
      submitReport: (...a) => mockSubmitReport(...a),
      submitCensus: () => Promise.resolve({ success: true }),
      createAssignedActivity: () => Promise.resolve({ success: true }),
      updateActivity: () => Promise.resolve({ success: true }),
      clubReports: () => Promise.resolve({ success: true, data: [] }),
    },
    clubs: { getAll: () => Promise.resolve({ success: true, data: [{ id: 'c1', name: 'Club Dev Web' }] }) },
    members: { list: (...a) => mockMembersAll(...a) },
    memberships: { getPendingRequests: () => Promise.resolve({ success: true, data: [] }) },
  }
  return { api, default: api }
})

beforeEach(() => {
  cleanup()
  estSecretaire = true
  mockUniversityReports.mockReset()
  mockSubmitReport.mockReset()
  mockMembersAll.mockReset()
  mockMembersAll.mockResolvedValue({ success: true, data: [] })
  localStorage.clear()
})

afterEach(() => cleanup())

describe('Espace CITE — les rapports affichés sont ceux du serveur', () => {
  it('affiche exactement les rapports renvoyés par l’API', async () => {
    mockUniversityReports.mockResolvedValue({
      success: true,
      data: [
        {
          id: 9,
          clubName: 'Club Robotique',
          period: '2026-08',
          title: 'Cartographie SLAM',
          content: 'Deux prototypes testés.',
          author: 'Ada Lovelace',
          createdAt: '2026-08-12T10:00:00.000Z',
        },
      ],
    })

    render(<EspaceCITE navigate={vi.fn()} />)

    expect(await screen.findByText('Cartographie SLAM')).toBeInTheDocument()
    expect(screen.getByText(/Ada Lovelace/)).toBeInTheDocument()
    expect(mockUniversityReports).toHaveBeenCalledWith(7)
  })

  it('affiche un état vide honnête quand l’API ne renvoie aucun rapport', async () => {
    mockUniversityReports.mockResolvedValue({ success: true, data: [] })

    render(<EspaceCITE navigate={vi.fn()} />)

    expect(
      await screen.findByText(/Aucun rapport n'a encore été transmis/i),
    ).toBeInTheDocument()
    // Les trois rapports de démonstration d'autrefois ne doivent plus exister.
    expect(screen.queryByText(/Bilan Activités Web & API Hub/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Synthèse Bibliographique LLM/i)).not.toBeInTheDocument()
  })

  it('remonte l’erreur du serveur au lieu d’une liste vide silencieuse', async () => {
    mockUniversityReports.mockRejectedValue(Object.assign(new Error('boom'), {
      serverMessage: 'Vous n’avez pas le poste requis pour gérer cette université.',
    }))

    render(<EspaceCITE navigate={vi.fn()} />)

    expect(
      await screen.findByText(/poste requis pour gérer cette université/i),
    ).toBeInTheDocument()
  })
})

describe('Espace CITE — l’annuaire ne fabrique pas de membres', () => {
  it('n’injecte aucun membre par défaut quand la liste est courte', async () => {
    mockUniversityReports.mockResolvedValue({ success: true, data: [] })
    mockMembersAll.mockResolvedValue({
      success: true,
      data: [{ id: 1, firstname: 'Seul', lastname: 'Membre', email: 'seul@uac.bj', role: 'ETUDIANT' }],
    })

    render(<EspaceCITE navigate={vi.fn()} />)

    expect(await screen.findByText('Seul Membre')).toBeInTheDocument()
    // Les dix membres fictifs d'autrefois portaient ces adresses.
    expect(screen.queryByText('resp.devweb@uac.bj')).not.toBeInTheDocument()
    expect(screen.queryByText('chercheur.ia@uac.bj')).not.toBeInTheDocument()
  })

  it('affiche un état vide quand l’annuaire est réellement vide', async () => {
    mockUniversityReports.mockResolvedValue({ success: true, data: [] })
    mockMembersAll.mockResolvedValue({ success: true, data: [] })

    render(<EspaceCITE navigate={vi.fn()} />)

    expect(await screen.findByText(/Aucun membre enregistré/i)).toBeInTheDocument()
  })
})

// Le formulaire de rapport n'est offert qu'au responsable du club sélectionné,
// rôle que la Secrétaire endosse également ici (isSecretaryOrAdmin).
describe('Espace CITE — la soumission de rapport dit la vérité', () => {
  const remplirEtEnvoyer = async () => {
    const user = userEvent.setup()
    await user.type(await screen.findByPlaceholderText(/2026-07/i), '2026-08')
    await user.type(screen.getByPlaceholderText(/Bilan mensuel R&D/i), 'Bilan août')
    await user.type(screen.getByPlaceholderText(/Synthèse d'activité des clubs/i), 'Trois ateliers.')
    await user.click(screen.getByRole('button', { name: /Transmettre au Chef Univ\./i }))
  }

  it('affiche une erreur quand le serveur refuse le rapport', async () => {
    mockUniversityReports.mockResolvedValue({ success: true, data: [] })
    mockSubmitReport.mockRejectedValue(Object.assign(new Error('refus'), {
      serverMessage: 'Période, titre et contenu du rapport sont requis.',
    }))

    render(<EspaceCITE navigate={vi.fn()} />)
    await remplirEtEnvoyer()

    await waitFor(() =>
      expect(screen.getByText(/Période, titre et contenu du rapport sont requis/i)).toBeInTheDocument(),
    )
    expect(screen.queryByText(/transmis à la Secrétaire Générale/i)).not.toBeInTheDocument()
    // Rien ne doit être écrit dans le navigateur.
    expect(localStorage.getItem('fieri_submitted_club_reports')).toBeNull()
  })

  it('relit la liste depuis l’API après un envoi réussi', async () => {
    mockUniversityReports.mockResolvedValue({ success: true, data: [] })
    mockSubmitReport.mockResolvedValue({ success: true, message: 'Rapport transmis.' })

    render(<EspaceCITE navigate={vi.fn()} />)
    await waitFor(() => expect(mockUniversityReports).toHaveBeenCalledTimes(1))

    await remplirEtEnvoyer()

    await waitFor(() => expect(mockUniversityReports).toHaveBeenCalledTimes(2))
    expect(localStorage.getItem('fieri_submitted_club_reports')).toBeNull()
  })
})
