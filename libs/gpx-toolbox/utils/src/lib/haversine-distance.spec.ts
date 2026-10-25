import { describe, expect, it } from 'vitest'
import { calculateHaversineDistance, calculateBearing } from './haversine-distance'

describe('calculateHaversineDistance', () => {
  it('returns 0 for identical points', () => {
    expect(calculateHaversineDistance({ latitude: 44.0, longitude: 8.3 }, { latitude: 44.0, longitude: 8.3 })).toBe(0)
  })

  it('returns ~111 km for 1 degree latitude difference at equator', () => {
    // ~111 km per degree of latitude
    const result = calculateHaversineDistance({ latitude: 0.0, longitude: 0.0 }, { latitude: 1.0, longitude: 0.0 })
    expect(result).toBeGreaterThan(110_000)
    expect(result).toBeLessThan(112_000)
  })

  it('returns ~111 km for 1 degree latitude difference at mid-latitudes', () => {
    const result = calculateHaversineDistance({ latitude: 44.0, longitude: 0.0 }, { latitude: 45.0, longitude: 0.0 })
    expect(result).toBeGreaterThan(110_000)
    expect(result).toBeLessThan(112_000)
  })

  it('returns 0 for same point', () => {
    expect(calculateHaversineDistance({ latitude: 44.0, longitude: 8.3 }, { latitude: 44.0, longitude: 8.3 })).toBe(0)
  })

  it('returns symmetric distance', () => {
    const a = { latitude: 44.0, longitude: 8.3 }
    const b = { latitude: 44.01, longitude: 8.32 }
    expect(calculateHaversineDistance(a, b)).toBeCloseTo(calculateHaversineDistance(b, a), 0)
  })

  it('handles small distances', () => {
    // ~100 m apart
    const a = { latitude: 44.0, longitude: 8.3 }
    const b = { latitude: 44.0001, longitude: 8.3 }
    const dist = calculateHaversineDistance(a, b)
    expect(dist).toBeGreaterThan(0)
    expect(dist).toBeLessThan(200) // should be ~11 m
  })
})

describe('calculateBearing', () => {
  it('returns ~0° for northward direction', () => {
    const bearing = calculateBearing({ latitude: 44.0, longitude: 8.3 }, { latitude: 44.01, longitude: 8.3 })
    expect(bearing).toBeCloseTo(0, 1)
  })

  it('returns ~90° for eastward direction', () => {
    const bearing = calculateBearing({ latitude: 44.0, longitude: 8.3 }, { latitude: 44.0, longitude: 8.31 })
    expect(bearing).toBeCloseTo(90, 1)
  })

  it('returns ~180° for southward direction', () => {
    const bearing = calculateBearing({ latitude: 44.01, longitude: 8.3 }, { latitude: 44.0, longitude: 8.3 })
    expect(bearing).toBeCloseTo(180, 1)
  })

  it('returns ~270° for westward direction', () => {
    const bearing = calculateBearing({ latitude: 44.0, longitude: 8.31 }, { latitude: 44.0, longitude: 8.3 })
    expect(bearing).toBeCloseTo(270, 1)
  })

  it('returns bearing in [0, 360)', () => {
    const bearing = calculateBearing({ latitude: 44.0, longitude: 8.3 }, { latitude: 44.01, longitude: 8.31 })
    expect(bearing).toBeGreaterThanOrEqual(0)
    expect(bearing).toBeLessThan(360)
    // NE direction → between 0° and 90°
    expect(bearing).toBeGreaterThan(0)
    expect(bearing).toBeLessThan(90)
  })
})
