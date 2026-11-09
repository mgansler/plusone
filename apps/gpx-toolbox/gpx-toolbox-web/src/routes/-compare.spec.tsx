import { act, fireEvent, render, screen, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { compareList } from '../hooks/useCompareList'
import { mockViewport } from '../layout/mockViewport'

import { Route } from './compare'

const gpx = (offset: number) => `<?xml version="1.0"?>
<gpx version="1.1" creator="test"><trk><trkseg>
  <trkpt lat="${48 + offset}" lon="9.0"><ele>300</ele></trkpt>
  <trkpt lat="${48.01 + offset}" lon="9.0"><ele>350</ele></trkpt>
  <trkpt lat="${48.02 + offset}" lon="9.0"><ele>320</ele></trkpt>
</trkseg></trk></gpx>`

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: () => (options: object) => ({ ...options, useSearch: () => ({ from: undefined }) }),
  Link: ({ children }: { children: ReactNode }) => <a href="/">{children}</a>,
}))

vi.mock('@plusone/gpx-toolbox-api-client', () => ({
  getGetRouteQueryOptions: (id: string) => ({ kind: 'route', id }),
  getExportRouteQueryOptions: (id: string) => ({ kind: 'gpx', id }),
}))

vi.mock('@tanstack/react-query', () => ({
  useQueries: ({ queries }: { queries: Array<{ kind: 'route' | 'gpx'; id: string }> }) =>
    queries.map(({ kind, id }) => ({
      isLoading: false,
      isError: false,
      data:
        kind === 'route'
          ? { name: id === 'a' ? 'Hausrunde' : 'Bergtour', stats: { distance: 2000, elevationGain: 50 } }
          : gpx(id === 'a' ? 0 : 0.1),
    })),
}))

// Leaflet needs a real browser
vi.mock('../components/Map', () => ({
  Map: () => <div role="region" aria-label="Karte" />,
}))

function ComparePage() {
  const Component = (Route as unknown as { component: () => ReactNode }).component
  return <Component />
}

function addRoutes(...ids: Array<'a' | 'b'>) {
  act(() => ids.forEach((id) => compareList.add({ id, name: id === 'a' ? 'Hausrunde' : 'Bergtour' })))
}

describe('ComparePage', () => {
  beforeEach(() => {
    compareList.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('on desktop', () => {
    beforeEach(() => {
      mockViewport(false)
    })

    it('lists the routes in the sidebar next to the map', () => {
      addRoutes('a', 'b')
      render(<ComparePage />)

      expect(screen.getByRole('heading', { name: 'Vergleich' })).toBeTruthy()
      expect(screen.getAllByRole('row')).toHaveLength(3) // headings + two routes
      expect(screen.getByRole('region', { name: 'Karte' })).toBeTruthy()
    })

    it('renders the route list once', () => {
      addRoutes('a', 'b')
      render(<ComparePage />)

      expect(screen.getAllByRole('table')).toHaveLength(1)
    })

    it('has no sheets and tabs', () => {
      addRoutes('a', 'b')
      render(<ComparePage />)

      expect(screen.queryByRole('button', { name: 'Routen' })).toBeNull()
      expect(screen.queryByRole('button', { name: 'Höhenprofil' })).toBeNull()
    })
  })

  describe('on mobile', () => {
    beforeEach(() => {
      mockViewport(true)
    })

    it('shows the header and the map instead of the sidebar', () => {
      addRoutes('a', 'b')
      render(<ComparePage />)

      expect(screen.queryByRole('heading', { name: 'Vergleich' })).toBeNull()
      expect(screen.getByRole('link', { name: '← Zurück' })).toBeTruthy()
      expect(screen.getByRole('button', { name: 'Alle entfernen' })).toBeTruthy()
      expect(screen.getByRole('region', { name: 'Karte' })).toBeTruthy()
    })

    it('keeps the route list closed until its tab is used', () => {
      addRoutes('a', 'b')
      render(<ComparePage />)
      expect(screen.queryByRole('table')).toBeNull()

      fireEvent.click(screen.getByRole('button', { name: 'Routen' }))

      const list = screen.getByRole('dialog', { name: 'Routenliste' })
      expect(within(list).getAllByRole('row')).toHaveLength(2) // no column headings
      expect(screen.getByRole('button', { name: 'Routen', expanded: true })).toBeTruthy()
    })

    it('opens the elevation profile independently of the route list', () => {
      addRoutes('a', 'b')
      render(<ComparePage />)

      fireEvent.click(screen.getByRole('button', { name: 'Routen' }))
      fireEvent.click(screen.getByRole('button', { name: 'Höhenprofil' }))

      expect(screen.getByRole('dialog', { name: 'Routenliste' })).toBeTruthy()
      expect(screen.getByRole('dialog', { name: 'Höhenprofil' })).toBeTruthy()
    })

    it('does not block the map while a sheet is open', () => {
      addRoutes('a', 'b')
      const { container } = render(<ComparePage />)

      fireEvent.click(screen.getByRole('button', { name: 'Höhenprofil' }))

      // Backdrops are the only elements that cover the page; they would stop the profile hover from reaching the map
      expect(container.querySelector('[style*="rgba(0, 0, 0, 0.3)"]')).toBeNull()
    })

    it('asks for a second route and offers no tabs without routes', () => {
      render(<ComparePage />)

      expect(screen.getByText(/Füge mindestens zwei Routen/)).toBeTruthy()
      expect(screen.queryByRole('button', { name: 'Routen' })).toBeNull()
      expect(screen.queryByRole('button', { name: 'Alle entfernen' })).toBeNull()
    })

    it('clears the list from the header', () => {
      addRoutes('a', 'b')
      render(<ComparePage />)

      fireEvent.click(screen.getByRole('button', { name: 'Alle entfernen' }))

      expect(screen.queryByRole('button', { name: 'Routen' })).toBeNull()
    })
  })
})
