import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { mockViewport } from '../../layout/mockViewport'

import { Route } from './index'

const nearbyResults = [
  {
    id: 'a',
    name: 'Hausrunde',
    polyline: [
      { lat: 48.1, lng: 11.6 },
      { lat: 48.2, lng: 11.7 },
    ],
    distance: 12.3,
    elevationGain: 250,
  },
  {
    id: 'b',
    name: 'Bergtour',
    polyline: [
      { lat: 47.5, lng: 10.2 },
      { lat: 47.6, lng: 10.4 },
    ],
    distance: 45,
    elevationGain: 900,
  },
]

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: () => (options: object) => options,
}))

vi.mock('@plusone/gpx-toolbox-api-client', () => ({
  useListRoutes: () => ({
    data: nearbyResults,
    isLoading: false,
    isError: false,
    error: null,
  }),
  useGetRoute: () => ({ data: undefined }),
  useExportRoute: () => ({ data: undefined, isLoading: false }),
}))

// Leaflet needs a real browser
vi.mock('../../components/Map', () => ({
  Map: () => <div role="region" aria-label="Karte" />,
}))

// Mock the hooks that use Leaflet map instance
vi.mock('../../hooks/useSearchArea', () => ({
  useSearchArea: () => ({
    lat: 48.13,
    lng: 11.56,
    radius: 2,
    setLat: vi.fn(),
    setLng: vi.fn(),
    setRadius: vi.fn(),
    usingGps: false,
    locateMe: vi.fn(),
    pickLocation: vi.fn(),
    centerOnCurrent: vi.fn(),
  }),
}))

vi.mock('../../hooks/usePlaceSearch', () => ({
  usePlaceSearch: () => ({
    place: '',
    setPlace: vi.fn(),
    loading: false,
    error: null,
    candidates: [],
    search: vi.fn(),
    pick: vi.fn(),
  }),
}))

vi.mock('../../hooks/useRouteSelection', () => ({
  useRouteSelection: () => ({
    selectedRoute: null,
    hoveredRoute: null,
    highlightedRoute: null,
    setHovered: vi.fn(),
    toggle: vi.fn(),
    selectFromList: vi.fn(),
    detail: undefined,
    points: [],
    distanceKm: 0,
    hasElevation: false,
    gpxLoading: false,
    profilePoint: null,
    setProfilePoint: vi.fn(),
  }),
}))

vi.mock('../../hooks/useNearbyMapLayers', () => ({
  useSearchAreaLayers: vi.fn(),
  useResultTrackLayers: vi.fn(),
  useProfilePointMarker: vi.fn(),
}))

function RoutesPage() {
  const Component = (Route as unknown as { component: () => ReactNode }).component
  return <Component />
}

describe('RoutesPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows the nearby search next to the map on desktop', () => {
    mockViewport(false)
    render(<RoutesPage />)

    expect(screen.getByRole('heading', { name: 'Routen in der Nähe' })).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Karte' })).toBeTruthy()
  })

  it('shows the filter button on mobile', () => {
    mockViewport(true)
    render(<RoutesPage />)

    // On mobile, the heading is inside the bottom sheet (hidden initially),
    // but the filter button is visible
    expect(screen.getByRole('button', { name: /Suche/ })).toBeTruthy()
  })
})
