import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { compareList } from '../../hooks/useCompareList'
import { mockViewport } from '../../layout/mockViewport'

import { Route } from './index'

const routes = [
  {
    id: 'a',
    name: 'Hausrunde',
    source: 'manualImport',
    status: 'ridden',
    stats: { distance: 12300, elevationGain: 250 },
  },
  {
    id: 'b',
    name: 'Bergtour',
    source: 'manualImport',
    status: 'planned',
    stats: { distance: 45000, elevationGain: 900 },
  },
]

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: () => (options: object) => options,
  Link: ({ children }: { children: ReactNode }) => <a href="/">{children}</a>,
}))

vi.mock('@plusone/gpx-toolbox-api-client', () => ({
  ListRoutesSortBy: { createdAt: 'createdAt', name: 'name' },
  useListRoutes: () => ({
    data: { items: routes, total: 2, page: 1, limit: 50, totalPages: 1 },
    isLoading: false,
    isError: false,
    error: null,
  }),
}))

// Leaflet needs a real browser
vi.mock('../../components/Map', () => ({
  Map: () => <div role="region" aria-label="Karte" />,
}))

function RoutesPage() {
  const Component = (Route as unknown as { component: () => ReactNode }).component
  return <Component />
}

describe('RoutesPage', () => {
  beforeEach(() => {
    compareList.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows the route list next to the map on desktop', () => {
    mockViewport(false)
    render(<RoutesPage />)

    expect(screen.getByRole('heading', { name: 'Routen (2)' })).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Karte' })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Strava-Export/ })).toBeTruthy()
  })

  it('shows the route list without map and Strava export on mobile', () => {
    mockViewport(true)
    render(<RoutesPage />)

    expect(screen.getByRole('heading', { name: 'Routen (2)' })).toBeTruthy()
    expect(screen.getByText('Hausrunde')).toBeTruthy()
    expect(screen.queryByRole('region', { name: 'Karte' })).toBeNull()
    expect(screen.queryByRole('button', { name: /Strava-Export/ })).toBeNull()
  })

  it('lets the list take the full width on mobile', () => {
    mockViewport(true)
    render(<RoutesPage />)

    const sidebar = screen.getByRole('heading', { name: 'Routen (2)' }).parentElement?.parentElement as HTMLElement
    expect(sidebar.style.width).toBe('100%')
  })
})
