/** @vitest-environment jsdom */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'

import ResearcherProfileEdit from './ResearcherProfileEdit.jsx'

import { ToastProvider } from '../components/ui/Toast.jsx'
const mockNavigate = vi.fn()

const mockUser = {
  id: 101,
  email: 'chercheur@fieri.dev',
  firstName: 'Chercheur',
  lastName: 'FIERI',
  role: 'CHERCHEUR'
}
vi.mock('../context/AuthContext.jsx', async (importOriginal) => {
  const actual = await importOriginal()
  const { readIdentity, resolve } = await import('../auth/access.js')
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

const mockGetMe = vi.fn()
const mockUpdateMe = vi.fn()

// Le composant importe l'export NOMÉ `api` (et non le default).
vi.mock('../services/api.js', () => {
  return {
    api: {
      researchers: {
        getMe: (...args) => mockGetMe(...args),
        updateMe: (...args) => mockUpdateMe(...args)
      }
    }
  }
})

// Le formulaire vit dans une modale ouverte via « Modifier mon profil ».
const openEditModal = async () => {
  await userEvent.click(screen.getByRole('button', { name: /modifier mon profil/i }))
}

beforeEach(() => {
  cleanup()
  mockNavigate.mockReset()
  mockGetMe.mockReset()
  mockUpdateMe.mockReset()
})

describe('ResearcherProfileEdit', () => {
  it('pré-remplit le formulaire via GET /researchers/me', async () => {
    mockGetMe.mockResolvedValue({
      success: true,
      data: {
        email: 'chercheur@fieri.dev',
        name: 'Chercheur FIERI',
        university: "Université Polytechnique de Fieri",
        bio: 'Bio test'
      }
    })

    render(<ToastProvider><ResearcherProfileEdit navigate={mockNavigate} /></ToastProvider>)

    await waitFor(() => {
      expect(mockGetMe).toHaveBeenCalledTimes(1)
    })

    await openEditModal()

    expect(screen.getByLabelText(/email/i)).toHaveValue('chercheur@fieri.dev')
    expect(screen.getByLabelText(/université/i)).toHaveValue("Université Polytechnique de Fieri")
    expect(screen.getByLabelText(/bio/i)).toHaveValue('Bio test')
  })

  it("bloque la soumission si l'email est invalide", async () => {
    mockGetMe.mockResolvedValue({ success: true, data: { email: 'chercheur@fieri.dev', name: 'Chercheur FIERI' } })
    mockUpdateMe.mockResolvedValue({ success: true, data: {} })

    render(<ToastProvider><ResearcherProfileEdit navigate={mockNavigate} /></ToastProvider>)

    await waitFor(() => expect(mockGetMe).toHaveBeenCalledTimes(1))

    await openEditModal()

    const emailInput = screen.getByLabelText(/email/i)
    await userEvent.clear(emailInput)
    await userEvent.type(emailInput, 'pas-un-email')

    await userEvent.click(screen.getByRole('button', { name: /enregistrer/i }))

    // Validation native (type="email") : l'input est invalide et rien n'est soumis.
    expect(emailInput).toBeInvalid()
    expect(mockUpdateMe).not.toHaveBeenCalled()
  })

  it('soumet via PUT /researchers/me et affiche un toast de succès', async () => {
    mockGetMe.mockResolvedValue({
      success: true,
      data: {
        email: 'chercheur@fieri.dev',
        name: 'Chercheur FIERI',
        university: "Université Polytechnique de Fieri",
        bio: ''
      }
    })

    mockUpdateMe.mockResolvedValue({
      success: true,
      data: {
        email: 'chercheur@fieri.dev',
        name: 'Chercheur FIERI'
      }
    })

    render(<ToastProvider><ResearcherProfileEdit navigate={mockNavigate} /></ToastProvider>)

    await waitFor(() => expect(mockGetMe).toHaveBeenCalledTimes(1))

    await openEditModal()

    await userEvent.type(screen.getByLabelText(/bio/i), 'Nouvelle bio')
    await userEvent.click(screen.getByRole('button', { name: /enregistrer/i }))

    await waitFor(() => expect(mockUpdateMe).toHaveBeenCalledTimes(1))
    expect(await screen.findByText(/profil mis à jour/i)).toBeInTheDocument()
  })
})
