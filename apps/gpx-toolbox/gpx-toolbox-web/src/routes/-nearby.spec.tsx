import { fireEvent, render, screen, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { compareList } from '../hooks/useCompareList'
import { mockViewport } from '../layout/mockViewport'

import { Route } from './nearby'

const nearbyRoutes = [
  {
    id: 'a',
    name: 'Hausrunde',
    distance: 12300,
    distanceKm: '12.3',
    status: 'ridden',
    source: 'manualImport',
    polyline: [],
  },
  {
    id: 'b',
    name: 'Bergtour',
    distance: 45000,
    distanceKm: '45.0',
    status: 'planned',
    source: 'manualImport',
    polyline: [],
  },
]

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: () => (options: object) => options,
  Link: ({ children }: { children: ReactNode }) => <a href="/">{children}</a>,
}))

vi.mock('@plusone/gpx-toolbox-api-client', () => ({
  useFindNearbyRoutes: () => ({ data: nearbyRoutes, isLoading: false, isError: false, error: null }),
  useGetRoute: () => ({ data: undefined }),
  useExportRoute: () => ({ data: undefined, isLoading: false }),
}))

// Leaflet needs a real browser; the page only needs the component to exist
vi.mock('../components/Map', () => ({
  defaultCenter: [48.77, 9.16],
  Map: () => <div />,
}))

function NearbyPage() {
  const Component = (Route as unknown as { component: () => ReactNode }).component
  return <Component />
}

describe('NearbySearch', () => {
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

    it('lists the found routes next to the search form', () => {
      render(<NearbyPage />)

      expect(screen.getByRole('textbox', { name: 'Ort suchen' })).toBeTruthy()
      expect(screen.getByRole('heading', { name: '2 Routen gefunden' })).toBeTruthy()
      expect(screen.getByText('Hausrunde')).toBeTruthy()
      expect(screen.getByText('Bergtour')).toBeTruthy()
    })

    it('has neither the search toggle nor the results sheet', () => {
      render(<NearbyPage />)

      expect(screen.queryByRole('button', { name: 'Suche öffnen' })).toBeNull()
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('renders each route once', () => {
      render(<NearbyPage />)

      expect(screen.getAllByText('Hausrunde')).toHaveLength(1)
    })
  })

  describe('on mobile', () => {
    beforeEach(() => {
      mockViewport(true)
    })

    it('shows only the map until a sheet is opened', () => {
      render(<NearbyPage />)

      expect(screen.queryByRole('textbox', { name: 'Ort suchen' })).toBeNull()
      expect(screen.queryByRole('heading', { name: '2 Routen gefunden' })).toBeNull()
    })

    it('opens the search form in a sheet', () => {
      render(<NearbyPage />)

      fireEvent.click(screen.getByRole('button', { name: 'Suche öffnen' }))

      const search = screen.getByRole('dialog', { name: 'Suche' })
      expect(within(search).getByRole('textbox', { name: 'Ort suchen' })).toBeTruthy()
      expect(screen.getByRole('button', { name: 'Suche schließen' })).toBeTruthy()
    })

    it('opens the found routes in a sheet', () => {
      render(<NearbyPage />)

      fireEvent.click(screen.getByRole('button', { name: 'Gefundene Routen' }))

      const results = screen.getByRole('dialog', { name: 'Gefundene Routen' })
      expect(within(results).getByRole('heading', { name: '2 Routen gefunden' })).toBeTruthy()
      expect(within(results).getByText('Hausrunde')).toBeTruthy()
    })

    it('shows one sheet at a time', () => {
      render(<NearbyPage />)

      fireEvent.click(screen.getByRole('button', { name: 'Gefundene Routen' }))
      fireEvent.click(screen.getByRole('button', { name: 'Suche öffnen' }))

      expect(screen.getByRole('dialog', { name: 'Suche' })).toBeTruthy()
      expect(screen.queryByRole('dialog', { name: 'Gefundene Routen' })).toBeNull()
    })

    it('closes the results sheet on Escape', () => {
      render(<NearbyPage />)
      fireEvent.click(screen.getByRole('button', { name: 'Gefundene Routen' }))

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(screen.queryByRole('dialog', { name: 'Gefundene Routen' })).toBeNull()
    })
  })
})
