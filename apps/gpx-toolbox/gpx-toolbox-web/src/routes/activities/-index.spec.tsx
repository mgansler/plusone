import { fireEvent, render, screen, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { mockViewport } from '../../layout/mockViewport'

import { Route } from './index'

const activities = [
  {
    id: 'a',
    routeId: 'r1',
    riddenAt: '2026-05-01T10:00:00.000Z',
    title: 'Feierabendrunde',
    duration: 3600,
    avgHr: 140,
    maxHr: 170,
    notes: null,
    route: { name: 'Hausrunde', status: 'ridden', stats: { distance: 12300, elevationGain: 250 } },
  },
]

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: () => (options: object) => options,
  Link: ({ children }: { children: ReactNode }) => <a href="/">{children}</a>,
}))

vi.mock('@plusone/gpx-toolbox-api-client', () => ({
  ListAllActivitiesSortBy: { riddenAt: 'riddenAt' },
  useListAllActivities: () => ({
    data: { items: activities, total: 1, page: 1, limit: 50, totalPages: 1 },
    isLoading: false,
    isError: false,
    error: null,
  }),
}))

// Leaflet needs a real browser
vi.mock('../../components/Map', () => ({
  Map: () => <div role="region" aria-label="Karte" />,
}))

function ActivitiesPage() {
  const Component = (Route as unknown as { component: () => ReactNode }).component
  return <Component />
}

describe('ActivitiesPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows the activity list next to the map on desktop', () => {
    mockViewport(false)
    render(<ActivitiesPage />)

    expect(screen.getByRole('heading', { name: 'Aktivitäten (1)' })).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Karte' })).toBeTruthy()
  })

  it('shows the activity list without map on mobile', () => {
    mockViewport(true)
    render(<ActivitiesPage />)

    expect(screen.getByRole('heading', { name: 'Aktivitäten (1)' })).toBeTruthy()
    expect(screen.getByText('Feierabendrunde')).toBeTruthy()
    expect(screen.queryByRole('region', { name: 'Karte' })).toBeNull()
  })

  it('lets the list take the full width on mobile', () => {
    mockViewport(true)
    render(<ActivitiesPage />)

    const sidebar = screen.getByRole('heading', { name: 'Aktivitäten (1)' }).parentElement?.parentElement as HTMLElement
    expect(sidebar.style.width).toBe('100%')
  })

  describe('filters', () => {
    it('shows them in a bar on desktop', () => {
      mockViewport(false)
      render(<ActivitiesPage />)

      expect(screen.getByLabelText('Von')).toBeTruthy()
      expect(screen.getByLabelText('Distanz min')).toBeTruthy()
      expect(screen.queryByRole('button', { name: /Filter & Sortierung/ })).toBeNull()
    })

    it('hides them behind one button on mobile', () => {
      mockViewport(true)
      render(<ActivitiesPage />)

      expect(screen.queryByRole('dialog', { name: 'Filter und Sortierung' })).toBeNull()
      expect(screen.getByRole('button', { name: 'Filter & Sortierung' })).toBeTruthy()
    })

    it('opens them in a sheet on mobile', () => {
      mockViewport(true)
      render(<ActivitiesPage />)

      fireEvent.click(screen.getByRole('button', { name: 'Filter & Sortierung' }))

      const filters = screen.getByRole('dialog', { name: 'Filter und Sortierung' })
      expect(within(filters).getByLabelText('Von')).toBeTruthy()
      expect(within(filters).getByLabelText('Sortieren nach')).toBeTruthy()
    })

    it('shows how many filters are active on the mobile button', () => {
      mockViewport(true)
      render(<ActivitiesPage />)
      fireEvent.click(screen.getByRole('button', { name: 'Filter & Sortierung' }))

      fireEvent.change(screen.getByLabelText('Distanz min'), { target: { value: '10' } })
      fireEvent.change(screen.getByLabelText('Von'), { target: { value: '2026-01-01' } })
      fireEvent.click(screen.getByRole('button', { name: 'Fertig' }))

      expect(screen.getByRole('button', { name: 'Filter & Sortierung (2)' })).toBeTruthy()
      expect(screen.queryByRole('dialog', { name: 'Filter und Sortierung' })).toBeNull()
    })
  })
})
