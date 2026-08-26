/** @vitest-environment jsdom */

/**
 * Deux promesses de la barre latérale : un seul groupe ouvert à la fois, et
 * celui où l'on se trouve est toujours celui-là. La page courante ne peut donc
 * jamais être cachée dans un accordéon fermé.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import { Users, Shield } from 'lucide-react'

import { NavMain } from './nav-main.jsx'

vi.mock('./ui/sidebar.jsx', () => ({ useSidebar: () => ({ state: 'expanded', isMobile: false }) }))
vi.mock('@/components/ui/sidebar', () => ({ useSidebar: () => ({ state: 'expanded', isMobile: false }) }))

const GROUPES = [
  { id: 'cite', label: 'Mon club CITE', icon: Users, items: [
    { id: 'espace-cite', label: 'Mon club', icon: Users },
    { id: 'cite-rapports', label: 'Rapports', icon: Users },
  ] },
  { id: 'gouvernance', label: 'Gouvernance', icon: Shield, items: [
    { id: 'gouvernance', label: 'Attestations', icon: Shield },
    { id: 'tresorerie', label: 'Trésorerie', icon: Shield },
  ] },
]

const afficher = (page) =>
  render(<NavMain groups={GROUPES} currentPage={page} navigate={vi.fn()} />)

beforeEach(() => cleanup())
afterEach(() => cleanup())

describe('Barre latérale — un seul groupe ouvert', () => {
  it('ouvre le groupe qui contient la page courante, et lui seul', () => {
    afficher('tresorerie')
    expect(screen.getByRole('button', { name: /Gouvernance/ })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: /Mon club CITE/ })).toHaveAttribute('aria-expanded', 'false')
    // La page courante est donc visible sans aucun clic.
    expect(screen.getByRole('button', { name: /Trésorerie/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Rapports/ })).not.toBeInTheDocument()
  })

  it('referme le groupe précédent quand on en ouvre un autre', async () => {
    afficher('tresorerie')
    const utilisateur = userEvent.setup()

    await utilisateur.click(screen.getByRole('button', { name: /Mon club CITE/ }))

    expect(screen.getByRole('button', { name: /Mon club CITE/ })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: /Gouvernance/ })).toHaveAttribute('aria-expanded', 'false')
  })

  it('marque la page courante, et une seule', () => {
    afficher('cite-rapports')
    const courants = screen.getAllByRole('button').filter((b) => b.getAttribute('aria-current') === 'page')
    expect(courants).toHaveLength(1)
    expect(courants[0]).toHaveTextContent('Rapports')
  })

  it('numérote les groupes comme les repères d’une plaque', () => {
    afficher('espace-cite')
    expect(screen.getByRole('button', { name: /Mon club CITE/ })).toHaveTextContent('01')
    expect(screen.getByRole('button', { name: /Gouvernance/ })).toHaveTextContent('02')
  })
})
