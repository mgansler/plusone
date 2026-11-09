import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { mockViewport } from '../../layout/mockViewport'

import { Route } from './$routeId'

const gpx = `<?xml version="1.0"?>
<gpx version="1.1" creator="test"><trk><trkseg>
  <trkpt lat="48.00" lon="9.0"><ele>300</ele></trkpt>
  <trkpt lat="48.01" lon="9.0"><ele>350</ele></trkpt>
  <trkpt lat="48.02" lon="9.0"><ele>320</ele></trkpt>
</trkseg></trk></gpx>`

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: () => (options: object) => ({
    ...options,
    useParams: () => ({ routeId: 'r1' }),
    useSearch: () => ({ from: undefined }),
  }),
  Link: ({ children }: { children: ReactNode }) => <a href="/">{children}</a>,
  useNavigate: () => vi.fn(),
}))

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn(), removeQueries: vi.fn() }),
}))

const { mutation } = vi.hoisted(() => ({
  mutation: () => ({ mutateAsync: () => undefined, reset: () => undefined, isPending: false, isError: false }),
}))

vi.mock('@plusone/gpx-toolbox-api-client', () => ({
  getFindNearbyRoutesQueryKey: () => [],
  getGetRouteQueryKey: () => [],
  getListAllActivitiesQueryKey: () => [],
  getListRouteActivitiesQueryKey: () => [],
  getListRoutesQueryKey: () => [],
  useGetRoute: () => ({
    data: { id: 'r1', name: 'Hausrunde', source: 'manualImport', status: 'ridden', activities: [] },
    isLoading: false,
    isError: false,
    error: null,
  }),
  useCreateRouteActivity: mutation,
  useDeleteRoute: mutation,
  useDeleteRouteActivity: mutation,
}))

// Leaflet needs a real browser
vi.mock('../../components/SegmentMap', () => ({
  SegmentMap: () => <div role="region" aria-label="Karte" />,
}))

function RouteDetailPage() {
  const Component = (Route as unknown as { component: () => ReactNode }).component
  return <Component />
}

describe('RouteDetailPage', () => {
  beforeEach(() => {
    localStorage.setItem('gpx-toolbox-jwt', 'token')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, text: async () => gpx })),
    )
  })

  afterEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
  })

  describe('on desktop', () => {
    beforeEach(() => {
      mockViewport(false)
    })

    it('shows the map next to the sidebar', async () => {
      render(<RouteDetailPage />)

      expect(screen.getByRole('heading', { name: 'Hausrunde' })).toBeTruthy()
      expect(screen.getByRole('region', { name: 'Karte' })).toBeTruthy()
      expect(await screen.findByRole('heading', { name: 'Gesamt' })).toBeTruthy()
    })

    it('has no map toggle', async () => {
      render(<RouteDetailPage />)
      await screen.findByRole('heading', { name: 'Gesamt' })

      expect(screen.queryByRole('button', { name: 'Karte anzeigen' })).toBeNull()
    })
  })

  describe('on mobile', () => {
    beforeEach(() => {
      mockViewport(true)
    })

    it('shows the sidebar without map and offers a map toggle', async () => {
      render(<RouteDetailPage />)

      expect(screen.queryByRole('region', { name: 'Karte' })).toBeNull()
      expect(screen.getByRole('button', { name: 'Karte anzeigen', pressed: false })).toBeTruthy()
      expect(await screen.findByRole('heading', { name: 'Gesamt' })).toBeTruthy()
    })

    it('swaps the overview for the map and back', async () => {
      render(<RouteDetailPage />)
      await screen.findByRole('heading', { name: 'Gesamt' })

      fireEvent.click(screen.getByRole('button', { name: 'Karte anzeigen' }))

      expect(screen.getAllByRole('region', { name: 'Karte' })).toHaveLength(1)
      expect(screen.queryByRole('heading', { name: 'Gesamt' })).toBeNull()
      expect(screen.getByRole('heading', { name: 'Segment' })).toBeTruthy()

      fireEvent.click(screen.getByRole('button', { name: 'Karte anzeigen', pressed: true }))

      expect(screen.queryByRole('region', { name: 'Karte' })).toBeNull()
      expect(screen.getByRole('heading', { name: 'Gesamt' })).toBeTruthy()
    })
  })
})
