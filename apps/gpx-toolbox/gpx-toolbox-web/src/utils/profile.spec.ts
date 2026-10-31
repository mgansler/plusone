import { describe, expect, it } from 'vitest'

import type { TrackPoint } from '@plusone/gpx-toolbox-utils'

import { cumulativeDistances, indexAtDistance, niceStep } from './profile'

// 0.009° latitude ≈ 1.0 km per hop
function track(hops: number): Array<TrackPoint> {
  return Array.from({ length: hops + 1 }, (_, i) => ({
    latitude: i * 0.009,
    longitude: 0,
    elevation: 100,
    time: new Date(0),
  }))
}

describe('cumulativeDistances', () => {
  it('starts at 0 and grows by the distance between points', () => {
    const distances = cumulativeDistances(track(3))

    expect(distances).toHaveLength(4)
    expect(distances[0]).toBe(0)
    expect(distances[3]).toBeCloseTo(3000, -1)
  })

  it('is empty for an empty track', () => {
    expect(cumulativeDistances([])).toEqual([])
  })
})

describe('indexAtDistance', () => {
  const distances = [0, 1000, 2000, 3000]

  it('returns the closest point', () => {
    expect(indexAtDistance(distances, 0)).toBe(0)
    expect(indexAtDistance(distances, 1400)).toBe(1)
    expect(indexAtDistance(distances, 1600)).toBe(2)
  })

  it('clamps beyond the end of the track', () => {
    expect(indexAtDistance(distances, 5000)).toBe(3)
  })
})

describe('niceStep', () => {
  it('picks 1, 2 or 5 times a power of ten', () => {
    expect(niceStep(60_000)).toBe(10_000)
    expect(niceStep(42_000)).toBe(10_000)
    expect(niceStep(11_000)).toBe(2000)
    expect(niceStep(3000)).toBe(500)
  })
})
