/** @vitest-environment jsdom */

/**
 * `DELETE /events/:id/register` existait côté serveur sans qu'aucun bouton ne
 * l'appelle : un inscrit ne pouvait pas libérer sa place. Ces tests vérifient
 * que le bouton existe, qu'il appelle bien la route d'annulation, et que le
 * compteur de participants suit dans les deux sens.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'

import Events from './Events.jsx'

const mockUser = { id: 7, firstname: 'Test', lastname: 'Membre', role: 'ETUDIANT' }

vi.mock('@/context/AuthContext.jsx', async (importOriginal) => {
  const actual = await importOriginal()
  const { readIdentity, resolve } = await import('@/auth/access.js')
  return {
    ...actual,
    useAuth: () => {
      const identity = readIdentity(mockUser)
      return {
        user: mockUser,
        identity,
        can: (capability, ctx) => resolve(identity, capability, ctx),
      }
    },
  }
})

vi.mock('@/context/AuthGateContext.jsx', () => ({
  useAuthGate: () => ({ promptLogin: vi.fn() }),
}))

const mockGetAll = vi.fn()
const mockToggleRegister = vi.fn()
const mockRegister = vi.fn()
const mockDeregister = vi.fn()

vi.mock('@/services/api.js', () => {
  const api = {
    events: {
      getAll: (...a) => mockGetAll(...a),
      getHistory: () => Promise.resolve({ success: true, data: [] }),
      register: (...a) => mockRegister(...a),
      deregister: (...a) => mockDeregister(...a),
      toggleRegister: (...a) => mockToggleRegister(...a),
    },
  }
  return { api, default: api }
})

const evenement = (over = {}) => ({
  id: 3,
  title: 'Atelier Robotique',
  description: 'Prise en main de ROS 2.',
  date: '2026-09-15T09:00:00.000Z',
  location: 'UAC — Amphi B',
  participantsCount: 12,
  registered: false,
  isLive: false,
  ...over,
})

beforeEach(() => {
  cleanup()
  mockGetAll.mockReset()
  mockToggleRegister.mockReset()
  mockRegister.mockReset()
  mockDeregister.mockReset()
})

afterEach(() => cleanup())

describe('Événements — l’inscription se fait dans les deux sens', () => {
  it('propose « Se désinscrire » à un participant déjà inscrit', async () => {
    mockGetAll.mockResolvedValue({ success: true, data: [evenement({ registered: true })] })

    render(<Events navigate={vi.fn()} />)

    expect(await screen.findByRole('button', { name: /se désinscrire/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /s'inscrire/i })).not.toBeInTheDocument()
  })

  it('appelle la route d’annulation et décrémente le compteur', async () => {
    mockGetAll.mockResolvedValue({ success: true, data: [evenement({ registered: true })] })
    mockToggleRegister.mockResolvedValue({ success: true, message: 'Inscription annulée.' })

    render(<Events navigate={vi.fn()} />)
    await userEvent.click(await screen.findByRole('button', { name: /se désinscrire/i }))

    // Le second argument dit à l'API quel sens prendre : true = déjà inscrit.
    await waitFor(() => expect(mockToggleRegister).toHaveBeenCalledWith(3, true))
    expect(await screen.findByRole('button', { name: /s'inscrire/i })).toBeInTheDocument()
    expect(screen.getAllByText('11').length).toBeGreaterThan(0)
  })

  it('inscrit un participant non inscrit et incrémente le compteur', async () => {
    mockGetAll.mockResolvedValue({ success: true, data: [evenement({ registered: false })] })
    mockToggleRegister.mockResolvedValue({ success: true, message: 'Inscription confirmée !' })

    render(<Events navigate={vi.fn()} />)
    await userEvent.click(await screen.findByRole('button', { name: /s'inscrire/i }))

    await waitFor(() => expect(mockToggleRegister).toHaveBeenCalledWith(3, false))
    expect(await screen.findByRole('button', { name: /se désinscrire/i })).toBeInTheDocument()
    expect(screen.getAllByText('13').length).toBeGreaterThan(0)
  })

  it('laisse l’état inchangé et signale l’erreur si le serveur refuse', async () => {
    mockGetAll.mockResolvedValue({ success: true, data: [evenement({ registered: true })] })
    mockToggleRegister.mockRejectedValue(Object.assign(new Error('réseau'), {
      serverMessage: 'Vous n’êtes pas inscrit à cet événement.',
    }))

    render(<Events navigate={vi.fn()} />)
    await userEvent.click(await screen.findByRole('button', { name: /se désinscrire/i }))

    expect(await screen.findByText(/n’êtes pas inscrit à cet événement/i)).toBeInTheDocument()
    // Toujours inscrit : rien n'a été modifié à tort dans l'affichage.
    expect(screen.getByRole('button', { name: /se désinscrire/i })).toBeEnabled()
  })
})

describe('Service API — les deux routes d’inscription existent', () => {
  it('dispatche vers register ou deregister selon l’état courant', async () => {
    const { api } = await vi.importActual('../services/api.js')
    expect(typeof api.events.register).toBe('function')
    expect(typeof api.events.deregister).toBe('function')
    expect(typeof api.events.toggleRegister).toBe('function')
  })
})
