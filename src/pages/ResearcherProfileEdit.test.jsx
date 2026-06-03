/** @vitest-environment jsdom */

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'

import ResearcherProfileEdit from './ResearcherProfileEdit.jsx'

const mockNavigate = vi.fn()

vi.mock('../context/AuthContext.jsx', () => {
  return {
    useAuth: () => ({
      user: {
        id: 101,
        email: 'chercheur@fieri.dev',
        firstName: 'Chercheur',
        lastName: 'FIERI',
        role: 'CHERCHEUR'
      },
      isResearcher: () => true
    })
  }
})

const getMe = vi.fn()
const updateMe = vi.fn()

vi.mock('../services/api.js', () => {
  return {
    default: {
      researchers: {
        getMe: (...args) => getMe(...args),
        updateMe: (...args) => updateMe(...args)
      }
    }
  }
})

beforeEach(() => {
  mockNavigate.mockReset()
  getMe.mockReset()
  updateMe.mockReset()
})

describe('ResearcherProfileEdit', () => {
  it('pré-remplit le formulaire via GET /researchers/me', async () => {
    getMe.mockResolvedValue({
      success: true,
      data: {
        email: 'chercheur@fieri.dev',
        name: 'Chercheur FIERI',
        university: "Université Polytechnique de Fieri",
        bio: 'Bio test'
      }
    })

    render(<ResearcherProfileEdit navigate={mockNavigate} />)

    await waitFor(() => {
      expect(getMe).toHaveBeenCalledTimes(1)
    })

    expect(screen.getByLabelText(/email/i)).toHaveValue('chercheur@fieri.dev')
    expect(screen.getByLabelText(/université/i)).toHaveValue("Université Polytechnique de Fieri")
    expect(screen.getByLabelText(/bio/i)).toHaveValue('Bio test')
  })

  it("bloque la soumission si l'email est invalide", async () => {
    getMe.mockResolvedValue({ success: true, data: { email: 'chercheur@fieri.dev', name: 'Chercheur FIERI' } })
    updateMe.mockResolvedValue({ success: true, data: {} })

    render(<ResearcherProfileEdit navigate={mockNavigate} />)

    await waitFor(() => expect(getMe).toHaveBeenCalledTimes(1))

    const emailInput = screen.getByLabelText(/email/i)
    await userEvent.clear(emailInput)
    await userEvent.type(emailInput, 'pas-un-email')

    await userEvent.click(screen.getByRole('button', { name: /enregistrer/i }))

    expect(await screen.findByText(/email invalide/i)).toBeInTheDocument()
    expect(updateMe).not.toHaveBeenCalled()
  })

  it('soumet via PUT /researchers/me et affiche un toast de succès', async () => {
    getMe.mockResolvedValue({
      success: true,
      data: {
        email: 'chercheur@fieri.dev',
        name: 'Chercheur FIERI',
        university: "Université Polytechnique de Fieri",
        bio: ''
      }
    })

    updateMe.mockResolvedValue({
      success: true,
      data: {
        email: 'chercheur@fieri.dev',
        name: 'Chercheur FIERI'
      }
    })

    render(<ResearcherProfileEdit navigate={mockNavigate} />)

    await waitFor(() => expect(getMe).toHaveBeenCalledTimes(1))

    await userEvent.type(screen.getByLabelText(/bio/i), 'Nouvelle bio')
    await userEvent.click(screen.getByRole('button', { name: /enregistrer/i }))

    await waitFor(() => expect(updateMe).toHaveBeenCalledTimes(1))
    expect(await screen.findByText(/profil mis à jour/i)).toBeInTheDocument()
  })
})
