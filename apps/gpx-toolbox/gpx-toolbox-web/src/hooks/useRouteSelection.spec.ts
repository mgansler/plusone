import { act, renderHook } from '@testing-library/react'
import type L from 'leaflet'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useRouteSelection } from './useRouteSelection'

const gpx = (withElevation: boolean) => `<?xml version="1.0"?>
<gpx version="1.1" creator="test"><trk><trkseg>
  <trkpt lat="48.00" lon="9.0">${withElevation ? '<ele>300</ele>' : ''}</trkpt>
  <trkpt lat="48.01" lon="9.0">${withElevation ? '<ele>350</ele>' : ''}</trkpt>
</trkseg></trk></gpx>`

let exported: string | undefined
const enabledFor: Array<string> = []

vi.mock('@plusone/gpx-toolbox-api-client', () => ({
  useGetRoute: () => ({ data: undefined }),
  useExportRoute: (id: string, options: { query: { enabled: boolean } }) => {
    if (options.query.enabled) enabledFor.push(id)
    return { data: options.query.enabled ? exported : undefined, isLoading: false }
  },
}))

const fitBounds = vi.fn()
const setView = vi.fn()
const map = { fitBounds, setView } as unknown as L.Map
const polyline = [
  { lat: 48, lng: 9 },
  { lat: 48.01, lng: 9.01 },
]

describe('useRouteSelection', () => {
  beforeEach(() => {
    fitBounds.mockClear()
    setView.mockClear()
    enabledFor.length = 0
    exported = undefined
  })

  it('selects a route from the list and zooms the map to it', () => {
    const { result } = renderHook(() => useRouteSelection(map))

    act(() => result.current.selectFromList({ id: 'a', polyline }))

    expect(result.current.selectedRoute).toBe('a')
    expect(fitBounds).toHaveBeenCalledTimes(1)
  })

  it('deselects without moving the map when the selected route is clicked again', () => {
    const { result } = renderHook(() => useRouteSelection(map))
    act(() => result.current.selectFromList({ id: 'a', polyline }))
    fitBounds.mockClear()

    act(() => result.current.selectFromList({ id: 'a', polyline }))

    expect(result.current.selectedRoute).toBeNull()
    expect(fitBounds).not.toHaveBeenCalled()
  })

  it('toggles the selection from the map without zooming', () => {
    const { result } = renderHook(() => useRouteSelection(map))

    act(() => result.current.toggle('a'))
    expect(result.current.selectedRoute).toBe('a')
    act(() => result.current.toggle('b'))
    expect(result.current.selectedRoute).toBe('b')
    act(() => result.current.toggle('b'))
    expect(result.current.selectedRoute).toBeNull()
    expect(fitBounds).not.toHaveBeenCalled()
  })

  it('highlights the hovered route over the selected one', () => {
    const { result } = renderHook(() => useRouteSelection(map))
    act(() => result.current.toggle('a'))
    expect(result.current.highlightedRoute).toBe('a')

    act(() => result.current.setHovered('b', true))
    expect(result.current.highlightedRoute).toBe('b')

    act(() => result.current.setHovered('b', false))
    expect(result.current.highlightedRoute).toBe('a')
  })

  it('ignores the end of a hover that already moved on to another route', () => {
    const { result } = renderHook(() => useRouteSelection(map))
    act(() => result.current.setHovered('a', true))
    act(() => result.current.setHovered('b', true))

    act(() => result.current.setHovered('a', false))

    expect(result.current.hoveredRoute).toBe('b')
  })

  it('loads the GPX only for the selected route', () => {
    const { result } = renderHook(() => useRouteSelection(map))
    expect(enabledFor).toEqual([])

    act(() => result.current.toggle('a'))

    expect(enabledFor).toContain('a')
  })

  it('provides points, length and elevation of the selected route', () => {
    exported = gpx(true)
    const { result } = renderHook(() => useRouteSelection(map))
    act(() => result.current.toggle('a'))

    expect(result.current.points).toHaveLength(2)
    expect(result.current.distanceKm).toBeGreaterThan(1)
    expect(result.current.hasElevation).toBe(true)
  })

  it('reports a track without elevation', () => {
    exported = gpx(false)
    const { result } = renderHook(() => useRouteSelection(map))
    act(() => result.current.toggle('a'))

    expect(result.current.points).toHaveLength(2)
    expect(result.current.hasElevation).toBe(false)
  })

  it('forgets the profile point when the selection changes', () => {
    const { result } = renderHook(() => useRouteSelection(map))
    act(() => result.current.toggle('a'))
    act(() => result.current.setProfilePoint({ latitude: 1, longitude: 2, elevation: 3, time: new Date() }))
    expect(result.current.profilePoint).not.toBeNull()

    act(() => result.current.toggle('b'))

    expect(result.current.profilePoint).toBeNull()
  })
})
