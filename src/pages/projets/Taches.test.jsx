/** @vitest-environment jsdom */

/**
 * L'écran ne montre que ce que le serveur a accepté : chaque modification
 * relit la liste, et un refus reste un refus.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'

import Taches from './Taches.jsx'
import { ToastProvider } from '../../components/ui/Toast.jsx'

const H = vi.hoisted(() => ({
  user: { id: 9, firstname: 'Chef', lastname: 'Projet', email: 'cp@uac.bj', role: 'CHEF_DE_PROJET' },
}))

vi.mock('../../context/AuthContext.jsx', async (importOriginal) => {
  const actual = await importOriginal()
  const { readIdentity, resolve } = await import('../../auth/access.js')
  return {
    ...actual,
    useAuth: () => {
      const identity = readIdentity(H.user)
      return { user: H.user, identity, can: (c, ctx) => resolve(identity, c, ctx) }
    },
  }
})

const mockGetByProject = vi.fn()
const mockCreate = vi.fn()
const mockMembers = vi.fn()

vi.mock('../../services/api.js', () => {
  const api = {
    projects: { getAll: () => Promise.resolve({ success: true, data: [{ id: 'p-1', title: 'Capteurs SLAM', ownerId: 9 }] }) },
    members: { list: (...a) => mockMembers(...a) },
    tasks: {
      getByProject: (...a) => mockGetByProject(...a),
      create: (...a) => mockCreate(...a),
      update: vi.fn(), assign: vi.fn(), setPriority: vi.fn(), delete: vi.fn(),
    },
  }
  return { api, default: api }
})

const afficher = () =>
  render(
    <MemoryRouter initialEntries={['/projets/taches?projet=p-1']}>
      <ToastProvider><Taches /></ToastProvider>
    </MemoryRouter>,
  )

beforeEach(() => {
  cleanup()
  mockGetByProject.mockReset()
  mockCreate.mockReset()
  mockMembers.mockReset()
  mockMembers.mockResolvedValue({ success: true, data: [{ id: 3, firstName: 'Ada', lastName: 'Lovelace' }] })
})
afterEach(() => cleanup())

describe('Tâches — la liste vient du serveur', () => {
  it('charge les tâches du projet nommé dans l’URL', async () => {
    mockGetByProject.mockResolvedValue({
      success: true,
      data: [{ id: 't-1', title: 'Rédiger le protocole', status: 'TODO', priority: 'HIGH', assignedTo: '3' }],
    })
    afficher()
    expect(await screen.findByText('Rédiger le protocole')).toBeInTheDocument()
    expect(mockGetByProject).toHaveBeenCalledWith('p-1')
  })

  it('résout l’affectation en nom, et montre la valeur brute si elle ne correspond à personne', async () => {
    mockGetByProject.mockResolvedValue({
      success: true,
      data: [
        { id: 't-1', title: 'A', status: 'TODO', priority: 'LOW', assignedTo: '3' },
        { id: 't-2', title: 'B', status: 'TODO', priority: 'LOW', assignedTo: 'Ancien nom libre' },
      ],
    })
    afficher()
    expect(await screen.findByText(/Confiée à Ada Lovelace/)).toBeInTheDocument()
    expect(screen.getByText(/Confiée à Ancien nom libre/)).toBeInTheDocument()
  })

  it('remonte l’échec au lieu d’afficher un projet sans tâches', async () => {
    mockGetByProject.mockRejectedValue(Object.assign(new Error('non'), {
      serverMessage: 'Projet introuvable.',
    }))
    afficher()
    expect(await screen.findByText(/Projet introuvable/i)).toBeInTheDocument()
  })
})

describe('Tâches — la création dit la vérité', () => {
  it('n’annonce pas de succès quand le serveur refuse', async () => {
    mockGetByProject.mockResolvedValue({ success: true, data: [] })
    mockCreate.mockRejectedValue(Object.assign(new Error('non'), {
      serverMessage: 'Vous ne pilotez pas ce projet.',
    }))
    afficher()
    const utilisateur = userEvent.setup()

    await utilisateur.type(await screen.findByLabelText('Intitulé'), 'Nouvelle tâche')
    await utilisateur.click(screen.getByRole('button', { name: /Créer la tâche/i }))

    expect(await screen.findByText(/ne pilotez pas ce projet/i)).toBeInTheDocument()
    expect(screen.queryByText(/« Nouvelle tâche » créée/i)).not.toBeInTheDocument()
  })

  it('relit la liste après une création acceptée', async () => {
    mockGetByProject.mockResolvedValue({ success: true, data: [] })
    mockCreate.mockResolvedValue({ success: true })
    afficher()
    const utilisateur = userEvent.setup()

    await utilisateur.type(await screen.findByLabelText('Intitulé'), 'Nouvelle tâche')
    await utilisateur.click(screen.getByRole('button', { name: /Créer la tâche/i }))

    await waitFor(() => expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ projectId: 'p-1', title: 'Nouvelle tâche' }),
    ))
    await waitFor(() => expect(mockGetByProject).toHaveBeenCalledTimes(2))
  })
})
