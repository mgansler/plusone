import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { NearbyRouteResponseDto } from '@plusone/gpx-toolbox-api-client'

import { compareList } from '../hooks/useCompareList'
import type { RouteSelection } from '../hooks/useRouteSelection'

import { NearbyResults } from './NearbyResults'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: ReactNode }) => <a href="/">{children}</a>,
}))

const results = [
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
] satisfies Array<NearbyRouteResponseDto>

function selection(overrides: Partial<RouteSelection> = {}): RouteSelection {
  return {
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
    ...overrides,
  }
}

describe('NearbyResults', () => {
  beforeEach(() => {
    compareList.clear()
  })

  it('shows a card per route', () => {
    render(<NearbyResults results={results} selection={selection()} />)

    expect(screen.getByText('Hausrunde')).toBeTruthy()
    expect(screen.getByText('Bergtour')).toBeTruthy()
  })

  it('selects a route on click', () => {
    const sel = selection()
    render(<NearbyResults results={results} selection={sel} />)

    fireEvent.click(screen.getByText('Bergtour'))

    expect(sel.selectFromList).toHaveBeenCalledWith(results[1])
  })

  it('reports hovering per route', () => {
    const sel = selection()
    render(<NearbyResults results={results} selection={sel} />)
    const card = screen.getByText('Hausrunde').parentElement as HTMLElement

    fireEvent.mouseEnter(card)
    fireEvent.mouseLeave(card)

    expect(sel.setHovered).toHaveBeenNthCalledWith(1, 'a', true)
    expect(sel.setHovered).toHaveBeenNthCalledWith(2, 'a', false)
  })

  it('shows the profile state only on the selected route', () => {
    render(<NearbyResults results={results} selection={selection({ selectedRoute: 'a', gpxLoading: true })} />)

    expect(screen.getAllByText('Höhenprofil wird geladen…')).toHaveLength(1)
  })

  it('says when the selected route has no elevation profile', () => {
    render(<NearbyResults results={results} selection={selection({ selectedRoute: 'a' })} />)

    expect(screen.getByText('Kein Höhenprofil verfügbar')).toBeTruthy()
  })
})
