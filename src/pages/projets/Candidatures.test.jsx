/** @vitest-environment jsdom */

/**
 * Une décision prise sur une candidature engage quelqu'un. Ces tests échouent
 * si l'écran annonce une décision que le serveur n'a pas enregistrée — le
 * défaut trouvé sur l'émission d'attestation, puis sur six autres écrans.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'

import Candidatures from './Candidatures.jsx'
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

const mockGetByOpportunity = vi.fn()
const mockUpdateStatus = vi.fn()

vi.mock('../../services/api.js', () => {
  const api = {
    opportunities: { getAll: () => Promise.resolve({ success: true, data: [{ id: 'op-1', title: 'Stage capteurs' }] }) },
    applications: {
      getByOpportunity: (...a) => mockGetByOpportunity(...a),
      updateStatus: (...a) => mockUpdateStatus(...a),
    },
  }
  return { api, default: api }
})

const afficher = () =>
  render(
    <MemoryRouter initialEntries={['/candidatures?offre=op-1']}>
      <ToastProvider><Candidatures /></ToastProvider>
    </MemoryRouter>,
  )

const UNE = {
  id: 'app-1',
  status: 'PENDING',
  coverLetter: 'Je travaille sur les capteurs depuis deux ans.',
  cvUrl: '',
  createdAt: '2026-08-01T10:00:00.000Z',
  member: { id: 3, firstName: 'Ada', lastName: 'Lovelace', email: 'ada@uac.bj' },
}

beforeEach(() => {
  cleanup()
  mockGetByOpportunity.mockReset()
  mockUpdateStatus.mockReset()
})
afterEach(() => cleanup())

describe('Candidatures — la liste vient du serveur', () => {
  it('affiche la candidature reçue pour l’opportunité de l’URL', async () => {
    mockGetByOpportunity.mockResolvedValue({ success: true, data: [UNE] })
    afficher()
    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument()
    expect(mockGetByOpportunity).toHaveBeenCalledWith('op-1')
  })

  it('dit qu’aucune pièce jointe n’est possible, plutôt qu’un document manquant', async () => {
    mockGetByOpportunity.mockResolvedValue({ success: true, data: [UNE] })
    afficher()
    expect(await screen.findByText(/ne reçoit pas encore de pièce jointe/i)).toBeInTheDocument()
  })

  it('remonte le refus du serveur au lieu d’une liste vide', async () => {
    mockGetByOpportunity.mockRejectedValue(Object.assign(new Error('non'), {
      serverMessage: 'Vous n’avez pas le droit d’examiner cette opportunité.',
    }))
    afficher()
    expect(await screen.findByText(/pas le droit d’examiner/i)).toBeInTheDocument()
  })
})

describe('Candidatures — la décision dit la vérité', () => {
  it('relit la liste après une décision acceptée', async () => {
    mockGetByOpportunity.mockResolvedValue({ success: true, data: [UNE] })
    mockUpdateStatus.mockResolvedValue({ success: true })
    afficher()
    const utilisateur = userEvent.setup()

    await utilisateur.click(await screen.findByRole('button', { name: /Retenir/i }))

    await waitFor(() => expect(mockUpdateStatus).toHaveBeenCalledWith('app-1', 'APPROVED'))
    await waitFor(() => expect(mockGetByOpportunity).toHaveBeenCalledTimes(2))
  })

  it('n’annonce aucun succès quand le serveur refuse la décision', async () => {
    mockGetByOpportunity.mockResolvedValue({ success: true, data: [UNE] })
    mockUpdateStatus.mockRejectedValue(Object.assign(new Error('non'), {
      serverMessage: 'Cette candidature a déjà été traitée.',
    }))
    afficher()
    const utilisateur = userEvent.setup()

    await utilisateur.click(await screen.findByRole('button', { name: /Retenir/i }))

    expect(await screen.findByText(/déjà été traitée/i)).toBeInTheDocument()
    expect(screen.queryByText(/Candidature de Ada Lovelace retenue/i)).not.toBeInTheDocument()
  })
})
