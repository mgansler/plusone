import { describe, expect, it } from 'vitest'

import { computeBoundingBox, expandBoundingBox } from './bounding-box'

describe('computeBoundingBox', () => {
  it('returns null for an empty track', () => {
    expect(computeBoundingBox([])).toBeNull()
  })

  it('returns min and max of latitude and longitude', () => {
    const box = computeBoundingBox([
      { latitude: 48.1, longitude: 11.5 },
      { latitude: 47.9, longitude: 11.7 },
      { latitude: 48.0, longitude: 11.4 },
    ])
    expect(box).toEqual({ minLat: 47.9, maxLat: 48.1, minLng: 11.4, maxLng: 11.7 })
  })
})

describe('expandBoundingBox', () => {
  it('grows the box by the margin in meters', () => {
    const box = expandBoundingBox({ minLat: 48, maxLat: 48, minLng: 11, maxLng: 11 }, 1113.2)
    expect(box.minLat).toBeCloseTo(47.99, 6)
    expect(box.maxLat).toBeCloseTo(48.01, 6)
    // A degree of longitude is shorter than a degree of latitude at 48°
    expect(box.maxLng - 11).toBeCloseTo(0.01 / Math.cos((48 * Math.PI) / 180), 6)
  })
})
