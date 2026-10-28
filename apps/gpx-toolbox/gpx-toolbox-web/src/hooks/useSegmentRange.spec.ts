import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { TrackPoint } from '@plusone/gpx-toolbox-utils'

import { useSegmentRange } from './useSegmentRange'

// 0.009° latitude ≈ 1.0 km per hop
function track(hops: number): Array<TrackPoint> {
  return Array.from({ length: hops + 1 }, (_, i) => ({
    latitude: i * 0.009,
    longitude: 0,
    elevation: 100,
    time: new Date(Date.UTC(2024, 0, 1, 10, i)),
  }))
}

describe('useSegmentRange', () => {
  it('starts with an empty range for an empty track', () => {
    const { result } = renderHook(() => useSegmentRange([]))
    expect(result.current.totalDistKm).toBe(0)
    expect(result.current.segmentRange).toEqual([0, 0])
  })

  it('selects the full track initially', () => {
    const { result } = renderHook(() => useSegmentRange(track(2)))
    expect(result.current.totalDistKm).toBeCloseTo(2, 1)
    expect(result.current.segmentRange).toEqual([0, result.current.totalDistKm])
  })

  it('updates the range via the setter', () => {
    const points = track(2)
    const { result } = renderHook(() => useSegmentRange(points))

    act(() => result.current.setSegmentRange([0.5, 1.5]))

    expect(result.current.segmentRange).toEqual([0.5, 1.5])
  })

  it('resets to the full track when new points are loaded', () => {
    const { result, rerender } = renderHook(({ points }) => useSegmentRange(points), {
      initialProps: { points: track(2) },
    })
    act(() => result.current.setSegmentRange([0.5, 1.5]))

    rerender({ points: track(3) })

    expect(result.current.totalDistKm).toBeCloseTo(3, 1)
    expect(result.current.segmentRange).toEqual([0, result.current.totalDistKm])
  })
})
