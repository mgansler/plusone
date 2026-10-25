import { describe, expect, it } from 'vitest'
import {
  calculateTotalDistance,
  calculateElevationGain,
  calculateElevationLoss,
  calculateDuration,
  calculateAvgSpeed,
  calculateMaxSpeed,
  getTimeRange,
  formatTime,
} from './track-stats'

/** Create points with given elevations at sequential lat/lng positions */
const pts = (elevations: number[], times: string[]) =>
  elevations.map((e, i) => ({
    latitude: 44.0 + i * 0.001,
    longitude: 8.3 + i * 0.001,
    elevation: e,
    time: new Date(times[i]),
  }))

/** Create points at the exact same lat/lng (zero distance) */
const samePts = (elevations: number[], times: string[]) =>
  elevations.map((e, i) => ({
    latitude: 44.0,
    longitude: 8.3,
    elevation: e,
    time: new Date(times[i]),
  }))

describe('calculateTotalDistance', () => {
  it('returns 0 for fewer than 2 points', () => {
    expect(calculateTotalDistance([])).toBe(0)
    expect(calculateTotalDistance([pts([100], ['2026-01-01T10:00:00Z'])[0]])).toBe(0)
  })

  it('returns the sum of all segment distances', () => {
    const points = pts([100, 120, 110], ['2026-01-01T10:00:00Z', '2026-01-01T10:01:00Z', '2026-01-01T10:02:00Z'])
    const total = calculateTotalDistance(points)
    expect(total).toBeGreaterThan(0)
  })

  it('returns 0 for identical points (same lat/lng)', () => {
    const points = samePts([100, 100], ['2026-01-01T10:00:00Z', '2026-01-01T10:01:00Z'])
    expect(calculateTotalDistance(points)).toBe(0)
  })
})

describe('calculateElevationGain', () => {
  it('returns 0 for flat tracks', () => {
    const points = pts([100, 100, 100], ['2026-01-01T10:00:00Z', '2026-01-01T10:01:00Z', '2026-01-01T10:02:00Z'])
    expect(calculateElevationGain(points)).toBe(0)
  })

  it('sums only positive elevation changes', () => {
    const points = pts(
      [100, 120, 110, 150],
      ['2026-01-01T10:00:00Z', '2026-01-01T10:01:00Z', '2026-01-01T10:02:00Z', '2026-01-01T10:03:00Z'],
    )
    const gain = calculateElevationGain(points)
    expect(gain).toBe(60) // 100→120 (+20) + 110→150 (+40)
  })

  it('ignores negative changes', () => {
    const points = pts([100, 80], ['2026-01-01T10:00:00Z', '2026-01-01T10:01:00Z'])
    expect(calculateElevationGain(points)).toBe(0)
  })
})

describe('calculateElevationLoss', () => {
  it('returns 0 for flat tracks', () => {
    const points = pts([100, 100, 100], ['2026-01-01T10:00:00Z', '2026-01-01T10:01:00Z', '2026-01-01T10:02:00Z'])
    expect(calculateElevationLoss(points)).toBe(0)
  })

  it('sums only negative elevation changes', () => {
    const points = pts(
      [100, 120, 110, 150],
      ['2026-01-01T10:00:00Z', '2026-01-01T10:01:00Z', '2026-01-01T10:02:00Z', '2026-01-01T10:03:00Z'],
    )
    const loss = calculateElevationLoss(points)
    expect(loss).toBe(10) // 120→110 (-10)
  })

  it('ignores positive changes', () => {
    const points = pts([100, 120], ['2026-01-01T10:00:00Z', '2026-01-01T10:01:00Z'])
    expect(calculateElevationLoss(points)).toBe(0)
  })
})

describe('calculateDuration', () => {
  it('returns 0 for fewer than 2 points', () => {
    expect(calculateDuration([])).toBe(0)
    expect(calculateDuration([pts([100], ['2026-01-01T10:00:00Z'])[0]])).toBe(0)
  })

  it('returns the duration in seconds', () => {
    const points = pts([100, 120], ['2026-01-01T10:00:00Z', '2026-01-01T10:02:00Z'])
    expect(calculateDuration(points)).toBe(120)
  })

  it('handles multi-hour tracks', () => {
    const points = pts([100, 120], ['2026-01-01T08:00:00Z', '2026-01-01T11:30:00Z'])
    expect(calculateDuration(points)).toBe(3.5 * 3600)
  })
})

describe('calculateAvgSpeed', () => {
  it('returns 0 for zero duration', () => {
    expect(calculateAvgSpeed(1000, 0)).toBe(0)
  })

  it('calculates correct average speed', () => {
    // 1 km in 1 hour → 1 km/h
    expect(calculateAvgSpeed(1000, 3600)).toBe(1)
    // 1 km in 1 minute → 60 km/h
    expect(calculateAvgSpeed(1000, 60)).toBe(60)
  })
})

describe('calculateMaxSpeed', () => {
  it('returns 0 for fewer than 2 points', () => {
    expect(calculateMaxSpeed([])).toBe(0)
    expect(calculateMaxSpeed([pts([100], ['2026-01-01T10:00:00Z'])[0]])).toBe(0)
  })

  it('returns 0 for identical points (same lat/lng)', () => {
    const points = samePts([100, 100], ['2026-01-01T10:00:00Z', '2026-01-01T10:01:00Z'])
    expect(calculateMaxSpeed(points)).toBe(0)
  })

  it('finds the maximum speed across all segments', () => {
    const points = [
      { latitude: 44.0, longitude: 8.3, elevation: 100, time: new Date('2026-01-01T10:00:00Z') },
      { latitude: 44.0, longitude: 8.31, elevation: 100, time: new Date('2026-01-01T10:00:30Z') },
      { latitude: 44.0, longitude: 8.32, elevation: 100, time: new Date('2026-01-01T10:02:00Z') },
    ]
    const maxSpeed = calculateMaxSpeed(points)
    // First segment: 30s over ~1.1 km → ~96 km/h (fast sprint)
    // Second segment: 90s over ~1.1 km → ~32 km/h
    expect(maxSpeed).toBeGreaterThan(90) // first segment is fastest
  })
})

describe('getTimeRange', () => {
  it('returns empty string for fewer than 2 points', () => {
    expect(getTimeRange([])).toBe('')
    expect(getTimeRange([pts([100], ['2026-01-01T10:00:00Z'])[0]])).toBe('')
  })

  it('returns a time range string', () => {
    const points = pts([100, 120], ['2026-01-01T10:00:00Z', '2026-01-01T10:02:00Z'])
    const range = getTimeRange(points)
    expect(range).toMatch(/\d{2}:\d{2}/)
    expect(range).toContain(' – ')
  })
})

describe('formatTime', () => {
  it('formats a Date as HH:mm', () => {
    const date = new Date('2026-01-01T14:30:00Z')
    expect(formatTime(date)).toMatch(/\d{2}:\d{2}/)
  })
})
