import { act, renderHook } from '@testing-library/react'
import type L from 'leaflet'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useSearchArea } from './useSearchArea'

vi.mock('../components/Map', () => ({ defaultCenter: [48.77, 9.16] }))

const fitBounds = vi.fn()
const invalidateSize = vi.fn()
const map = { fitBounds, invalidateSize } as unknown as L.Map

function stubGeolocation(position: { latitude: number; longitude: number } | 'denied') {
  vi.stubGlobal('navigator', {
    geolocation: {
      getCurrentPosition: (onFound: (pos: GeolocationPosition) => void, onError: () => void) => {
        if (position === 'denied') onError()
        else onFound({ coords: position } as GeolocationPosition)
      },
    },
  })
}

describe('useSearchArea', () => {
  beforeEach(() => {
    fitBounds.mockClear()
    invalidateSize.mockClear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('starts at the browser location once the map is ready', () => {
    stubGeolocation({ latitude: 47.5, longitude: 8.5 })
    const { result, rerender } = renderHook(({ m }) => useSearchArea(m), { initialProps: { m: null as L.Map | null } })
    expect(result.current.lat).toBeNull()

    rerender({ m: map })

    expect(result.current.lat).toBe(47.5)
    expect(result.current.lng).toBe(8.5)
    expect(fitBounds).toHaveBeenCalledTimes(1)
    expect(invalidateSize).toHaveBeenCalledTimes(1)
  })

  it('falls back to the default center without a location', () => {
    stubGeolocation('denied')
    const { result } = renderHook(() => useSearchArea(map))

    expect(result.current.lat).toBe(48.77)
    expect(result.current.lng).toBe(9.16)
  })

  it('keeps a location the user picked before the browser answered', () => {
    stubGeolocation({ latitude: 47.5, longitude: 8.5 })
    const { result, rerender } = renderHook(({ m }) => useSearchArea(m), { initialProps: { m: null as L.Map | null } })

    act(() => {
      result.current.setLat(50)
      result.current.setLng(10)
    })
    rerender({ m: map })

    expect(result.current.lat).toBe(50)
    expect(result.current.lng).toBe(10)
  })

  it('moves the center and the map when a location is picked', () => {
    stubGeolocation('denied')
    const { result } = renderHook(() => useSearchArea(map))
    fitBounds.mockClear()

    act(() => result.current.pickLocation(49, 11))

    expect(result.current.lat).toBe(49)
    expect(result.current.lng).toBe(11)
    expect(fitBounds).toHaveBeenCalledTimes(1)
  })

  it('does not move the map when only the center is set, e.g. by a click on the map', () => {
    stubGeolocation('denied')
    const { result } = renderHook(() => useSearchArea(map))
    fitBounds.mockClear()

    act(() => result.current.setLat(49))

    expect(fitBounds).not.toHaveBeenCalled()
  })

  it('shows the center on the map after typed coordinates', () => {
    stubGeolocation('denied')
    const { result } = renderHook(() => useSearchArea(map))
    fitBounds.mockClear()

    act(() => result.current.centerOnCurrent())

    expect(fitBounds).toHaveBeenCalledTimes(1)
  })

  it('centers on the position of the GPS button', () => {
    stubGeolocation('denied')
    const { result } = renderHook(() => useSearchArea(map))
    stubGeolocation({ latitude: 46, longitude: 7 })

    act(() => result.current.locateMe())

    expect(result.current.lat).toBe(46)
    expect(result.current.lng).toBe(7)
    expect(result.current.usingGps).toBe(false)
  })

  it('fits the map to the radius at the time of the pick', () => {
    stubGeolocation('denied')
    const { result } = renderHook(() => useSearchArea(map))
    act(() => result.current.setRadius(10))
    fitBounds.mockClear()

    act(() => result.current.pickLocation(49, 11))

    const bounds = fitBounds.mock.calls[0][0] as L.LatLngBounds
    // A 20 km wide area, not the 4 km of the default radius
    expect(bounds.getNorth() - bounds.getSouth()).toBeGreaterThan(0.15)
  })
})
