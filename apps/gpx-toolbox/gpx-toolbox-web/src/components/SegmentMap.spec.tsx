import { act, fireEvent, render, screen } from '@testing-library/react'
import { useEffect } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { TrackPoint } from '@plusone/gpx-toolbox-utils'

import { SegmentMap } from './SegmentMap'

// ── Mocks ────────────────────────────────────────────────────────────────────
// Leaflet needs real layout to render, so the map, the overlay and the
// clickable polyline are replaced by lightweight fakes.

const fakeMap = { id: 'fake-map' }

vi.mock('./Map', () => ({
  Map: ({ onMapReady }: { onMapReady?: (map: unknown) => void }) => {
    useEffect(() => onMapReady?.(fakeMap), [onMapReady])
    return <div data-testid="map" />
  },
}))

const overlayProps = vi.fn()
vi.mock('./SegmentOverlay', () => ({
  SegmentOverlay: ({ children, ...props }: { children?: React.ReactNode }) => {
    overlayProps(props)
    return <div data-testid="segment-overlay">{children}</div>
  },
}))

type FakePolyline = {
  coords: Array<[number, number]>
  handlers: Record<string, (e: unknown) => void>
  addedTo: unknown
  removed: boolean
}
const polylines: Array<FakePolyline> = []

vi.mock('leaflet', () => {
  const polyline = (coords: Array<[number, number]>) => {
    const line: FakePolyline = { coords, handlers: {}, addedTo: null, removed: false }
    polylines.push(line)
    const api = {
      on: (event: string, handler: (e: unknown) => void) => {
        line.handlers[event] = handler
        return api
      },
      addTo: (map: unknown) => {
        line.addedTo = map
        return api
      },
      remove: () => {
        line.removed = true
      },
    }
    return api
  }
  const divIcon = (_opts: Record<string, unknown>) => ({ id: 'div-icon' })
  const marker = (_latLng: [number, number], opts: { icon?: unknown }) => ({
    setLatLng: vi.fn(),
    setIcon: vi.fn(),
    setOpacity: vi.fn(),
    ...opts,
  })
  return { default: { polyline, divIcon, marker } }
})

// ── Fixture ──────────────────────────────────────────────────────────────────

// 0.009° latitude ≈ 1.0 km per hop
const points: Array<TrackPoint> = [0, 0.009, 0.018, 0.027].map((latitude, i) => ({
  latitude,
  longitude: 0,
  elevation: 400 + i,
  time: new Date(Date.UTC(2024, 0, 1, 10, i)),
}))
const totalDistKm = 3.0

function activePolyline(): FakePolyline {
  const line = polylines.filter((l) => !l.removed).at(-1)
  if (!line) throw new Error('no clickable polyline on the map')
  return line
}

function clickAt(latitude: number) {
  act(() => activePolyline().handlers.click({ latlng: { lat: latitude, lng: 0 } }))
}

describe('SegmentMap', () => {
  beforeEach(() => {
    polylines.length = 0
    overlayProps.mockClear()
  })

  it('renders only the map without a track', () => {
    render(<SegmentMap points={[]} range={[0, 0]} totalDistKm={0} />)
    expect(screen.getByTestId('map')).toBeTruthy()
    expect(screen.queryByTestId('segment-overlay')).toBeNull()
  })

  it('hides the overlay for a segment shorter than 10 m', () => {
    render(<SegmentMap points={points} range={[1, 1.005]} totalDistKm={totalDistKm} />)
    expect(screen.queryByTestId('segment-overlay')).toBeNull()
  })

  it('passes the selected range to the overlay and fits bounds for the full track', () => {
    const { rerender } = render(<SegmentMap points={points} range={[0, totalDistKm]} totalDistKm={totalDistKm} />)
    expect(overlayProps).toHaveBeenLastCalledWith(
      expect.objectContaining({ mapInstance: fakeMap, range: [0, totalDistKm], fitBounds: true }),
    )

    rerender(<SegmentMap points={points} range={[1, 2]} totalDistKm={totalDistKm} />)
    expect(overlayProps).toHaveBeenLastCalledWith(expect.objectContaining({ range: [1, 2], fitBounds: false }))
  })

  it('makes only the selected segment clickable', () => {
    render(<SegmentMap points={points} range={[0.5, 1.5]} totalDistKm={totalDistKm} />)
    const line = activePolyline()
    expect(line.addedTo).toBe(fakeMap)
    expect(line.coords).toEqual([
      [0.009, 0],
      [0.018, 0],
    ])
  })

  it('shows details for the nearest point on click and closes them again', () => {
    render(<SegmentMap points={points} range={[0, totalDistKm]} totalDistKm={totalDistKm} />)

    clickAt(0.0175)
    expect(screen.getByText('Track-Punkt')).toBeTruthy()
    expect(screen.getByText('402 m')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: '×' }))
    expect(screen.queryByText('Track-Punkt')).toBeNull()
  })

  it('toggles the details when the same point is clicked twice', () => {
    render(<SegmentMap points={points} range={[0, totalDistKm]} totalDistKm={totalDistKm} />)

    clickAt(0)
    expect(screen.getByText('400 m')).toBeTruthy()
    clickAt(0)
    expect(screen.queryByText('Track-Punkt')).toBeNull()
  })

  it('clears the selected point when a new track is loaded', () => {
    const { rerender } = render(<SegmentMap points={points} range={[0, totalDistKm]} totalDistKm={totalDistKm} />)
    clickAt(0)
    expect(screen.getByText('Track-Punkt')).toBeTruthy()

    rerender(<SegmentMap points={points.slice(0, 3)} range={[0, 2]} totalDistKm={2} />)
    expect(screen.queryByText('Track-Punkt')).toBeNull()
  })
})
