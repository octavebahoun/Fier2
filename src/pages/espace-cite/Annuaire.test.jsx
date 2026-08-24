/** @vitest-environment jsdom */

/**
 * L'annuaire ne fabrique personne. Ces tests échouent si l'on réintroduit un
 * jeu de membres par défaut — comme celui qui remplaçait la liste réelle dès
 * qu'elle comptait moins de cinq personnes.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'

import Annuaire from './Annuaire.jsx'

const H = vi.hoisted(() => ({
  user: {
    id: 42, firstname: 'Sec', lastname: 'Générale', email: 'sec@uac.bj',
    role: 'ETUDIANT',
    universityPost: { post: 'SECRETAIRE', universityId: 7 },
    universityId: 7,
  },
}))

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

const mockMembersList = vi.fn()

vi.mock('../../services/api.js', () => {
  const api = { members: { list: (...a) => mockMembersList(...a) } }
  return { api, default: api }
})

const afficher = () => render(<MemoryRouter><Annuaire /></MemoryRouter>)

beforeEach(() => {
  cleanup()
  mockMembersList.mockReset()
  localStorage.clear()
})

afterEach(() => cleanup())

describe('Annuaire — aucun membre inventé', () => {
  it('affiche la liste courte telle quelle, sans la compléter', async () => {
    mockMembersList.mockResolvedValue({
      success: true,
      data: [{ id: 1, firstName: 'Ada', lastName: 'Lovelace', email: 'ada@uac.bj', universityId: 7 }],
    })

    afficher()

    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument()
    // Les douze membres de démonstration d'autrefois ne doivent plus exister.
    expect(screen.queryByText(/resp\.devweb@uac\.bj/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Responsable Dev Web/i)).not.toBeInTheDocument()
  })

  it('affiche un état vide quand l’annuaire est réellement vide', async () => {
    mockMembersList.mockResolvedValue({ success: true, data: [] })

    afficher()

    expect(await screen.findByText(/Aucun membre rattaché à cette université/i)).toBeInTheDocument()
  })

  it('ne garde que les membres de l’université administrée', async () => {
    mockMembersList.mockResolvedValue({
      success: true,
      data: [
        { id: 1, firstName: 'Ada', lastName: 'Lovelace', universityId: 7 },
        { id: 2, firstName: 'Alan', lastName: 'Turing', universityId: 99 },
      ],
    })

    afficher()

    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.queryByText('Alan Turing')).not.toBeInTheDocument()
  })

  it('remonte un refus du serveur au lieu d’une liste vide', async () => {
    mockMembersList.mockRejectedValue(Object.assign(new Error('nope'), { status: 403 }))

    afficher()

    expect(await screen.findByText(/n'avez pas accès à l'annuaire/i)).toBeInTheDocument()
  })
})
