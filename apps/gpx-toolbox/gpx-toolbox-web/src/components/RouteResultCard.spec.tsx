import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { compareList } from '../hooks/useCompareList'

import { RouteResultCard } from './RouteResultCard'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: ReactNode }) => <a href="/">{children}</a>,
}))

const route = {
  id: 'r1',
  name: 'Hausrunde',
  distanceKm: '12.3',
  source: 'manualImport',
  status: 'ridden',
  stats: { distance: 12300, elevationGain: 250, elevationLoss: 240 },
}

function renderCard(props: Partial<Parameters<typeof RouteResultCard>[0]> = {}) {
  const onSelect = vi.fn()
  const onHoverChange = vi.fn()
  render(
    <RouteResultCard
      route={route}
      color="#e53935"
      selected={false}
      hovered={false}
      onSelect={onSelect}
      onHoverChange={onHoverChange}
      {...props}
    />,
  )
  return { onSelect, onHoverChange }
}

describe('RouteResultCard', () => {
  beforeEach(() => {
    compareList.clear()
  })

  it('shows name, distance and status', () => {
    renderCard()

    expect(screen.getByText('Hausrunde')).toBeTruthy()
    expect(screen.getByText('12.3 km')).toBeTruthy()
    expect(screen.getByText('Gefahren')).toBeTruthy()
  })

  it('reports clicks and hovering', () => {
    const { onSelect, onHoverChange } = renderCard()
    const card = screen.getByText('Hausrunde').parentElement as HTMLElement

    fireEvent.click(card)
    fireEvent.mouseEnter(card)
    fireEvent.mouseLeave(card)

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onHoverChange.mock.calls).toEqual([[true], [false]])
  })

  it('hides stats and details until selected', () => {
    renderCard({ children: <p>Profil</p> })

    expect(screen.queryByText(/Höhenmeter/)).toBeNull()
    expect(screen.queryByText('Profil')).toBeNull()
  })

  it('shows stats and details when selected', () => {
    renderCard({ selected: true, children: <p>Profil</p> })

    expect(screen.getByText('Strecke: 12.3 km')).toBeTruthy()
    expect(screen.getByText(/Höhenmeter ↑: 250/)).toBeTruthy()
    expect(screen.getByText('Profil')).toBeTruthy()
  })

  it('does not select the card when clicking its details', () => {
    const { onSelect } = renderCard({ selected: true, children: <p>Profil</p> })

    fireEvent.click(screen.getByText('Profil'))

    expect(onSelect).not.toHaveBeenCalled()
  })

  it('toggles the comparison without selecting the card', () => {
    const { onSelect } = renderCard()

    fireEvent.click(screen.getByRole('button', { name: '+ Vergleich' }))

    expect(onSelect).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: '✓ Im Vergleich' })).toBeTruthy()
  })
})
