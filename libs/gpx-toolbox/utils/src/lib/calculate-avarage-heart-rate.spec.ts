import { describe, expect, it } from 'vitest'
import { calculateAverageHeartRate } from './calculate-avarage-heart-rate'
import { type TrackPoint } from './types'

const makePoint = (i: number, hr?: number): TrackPoint => ({
  latitude: 44.0 + i * 0.0001,
  longitude: 8.3 + i * 0.0001,
  elevation: 100,
  time: new Date(2026, 0, 1, 10, i, 0),
  ...(hr !== undefined && { hr }),
})

describe('calculateAverageHeartRate', () => {
  it('returns null for empty segment', () => {
    expect(calculateAverageHeartRate([])).toBeNull()
  })

  it('returns the hr of a single point', () => {
    expect(calculateAverageHeartRate([makePoint(0, 140)])).toBe(140)
    expect(calculateAverageHeartRate([makePoint(0)])).toBeNull()
  })

  it('returns constant heart rate when all points have the same hr', () => {
    const segment: TrackPoint[] = [makePoint(0, 150), makePoint(1, 150), makePoint(2, 150)]
    expect(calculateAverageHeartRate(segment)).toBe(150)
  })

  it('computes time-weighted average', () => {
    // First 60s at hr=120, then 120s at hr=180 → weighted avg = (120*60 + 180*120)/180 = 160
    const segment: TrackPoint[] = [
      { ...makePoint(0, 120), time: new Date(2026, 0, 1, 10, 0, 0) },
      { ...makePoint(1, 180), time: new Date(2026, 0, 1, 10, 1, 0) },
      { ...makePoint(2, 180), time: new Date(2026, 0, 1, 10, 3, 0) },
    ]
    expect(calculateAverageHeartRate(segment)).toBe(160)
  })

  it('skips points without hr (only current-point hr is weighted)', () => {
    const segment: TrackPoint[] = [
      makePoint(0, 120),
      makePoint(1), // no hr — its interval is skipped
      makePoint(2, 180),
    ]
    // Point 0 (hr=120) is weighted for 60s. Point 1 has no hr → skipped.
    // Point 2's hr is never used as "current" (loop ends at length-2).
    expect(calculateAverageHeartRate(segment)).toBe(120)
  })

  it('returns null when no points have hr', () => {
    const segment: TrackPoint[] = [makePoint(0), makePoint(1)]
    expect(calculateAverageHeartRate(segment)).toBeNull()
  })

  it('handles zero-duration segments', () => {
    // Two points at the same timestamp with different hr → duration = 0, should be skipped
    const segment: TrackPoint[] = [
      { ...makePoint(0, 120), time: new Date(2026, 0, 1, 10, 0, 0) },
      { ...makePoint(1, 180), time: new Date(2026, 0, 1, 10, 0, 0) },
    ]
    expect(calculateAverageHeartRate(segment)).toBeNull()
  })
})
