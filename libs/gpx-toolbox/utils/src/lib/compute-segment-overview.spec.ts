import { describe, expect, it } from 'vitest'
import { computeSegmentOverview } from './track-stats'
import { type ProcessedSegment } from './types'

const makePoint = (i: number, ele = 100, hr?: number) => ({
  latitude: 44.0 + i * 0.0001,
  longitude: 8.3 + i * 0.0001,
  elevation: ele,
  time: new Date(2026, 0, 1, 10, 0, i * 10),
  ...(hr !== undefined && { hr }),
})

function mockSegment(overrides: Partial<ProcessedSegment> = {}): ProcessedSegment {
  return {
    type: 'flat',
    points: [makePoint(0), makePoint(1, 100, 140), makePoint(2)],
    totalDistance: 200,
    elevationGain: 10,
    startDistanceSinceStart: 1000,
    ...overrides,
  }
}

describe('computeSegmentOverview', () => {
  it('returns a structured overview object', () => {
    const seg = mockSegment()
    const overview = computeSegmentOverview(seg)

    expect(overview.type).toBe('flat')
    expect(overview.points).toBe(3)
    expect(overview.startTime).toBeDefined()
    expect(overview.endTime).toBeDefined()
    expect(overview.durationSeconds).toBeGreaterThan(0)
    expect(overview.duration).toMatch(/^\d{2}:\d{2}:\d{2}$/)
    expect(overview.distance).toBeGreaterThan(0)
    expect(overview.startDistanceSinceStart).toBeDefined()
    expect(overview.endDistanceSinceStart).toBeDefined()
    expect(overview.elevationGain).toBe(10)
    expect(overview.vam).toBeDefined()
    expect(overview.hfVamQuotient).toBeDefined()
  })

  it('computes correct duration', () => {
    // 3 points at t=0, t=10, t=20 → duration = 20 seconds
    const seg = mockSegment({
      points: [makePoint(0), makePoint(1, 100), makePoint(2)],
    })
    const overview = computeSegmentOverview(seg)
    expect(overview.durationSeconds).toBe(20)
  })

  it('formats duration as HH:MM:SS', () => {
    const seg = mockSegment({
      points: [makePoint(0), makePoint(1, 100), makePoint(2)],
    })
    const overview = computeSegmentOverview(seg)
    expect(overview.duration).toBe('00:00:20')
  })

  it('computes VAM (vertical ascent per hour)', () => {
    // elevationGain = 10m, duration = 20s → VAM = 10 / (20/3600) = 1800
    const seg = mockSegment({ elevationGain: 10, points: [makePoint(0), makePoint(1, 100), makePoint(2)] })
    const overview = computeSegmentOverview(seg)
    expect(overview.vam).toBe(1800)
  })

  it('sets hfVamQuotient when both hr and vam are available', () => {
    const seg = mockSegment({
      averageHeartRate: 144,
      elevationGain: 10,
      points: [makePoint(0), makePoint(1, 100), makePoint(2)],
    })
    const overview = computeSegmentOverview(seg)
    // 144 / 1800 = 0.08
    expect(overview.hfVamQuotient).toBe('0.08')
  })

  it('returns empty hfVamQuotient when no heart rate', () => {
    const seg = mockSegment({ averageHeartRate: undefined })
    const overview = computeSegmentOverview(seg)
    expect(overview.hfVamQuotient).toBe('')
  })

  it('returns empty hfVamQuotient when vam is zero', () => {
    const seg = mockSegment({ averageHeartRate: 140, elevationGain: 0 })
    const overview = computeSegmentOverview(seg)
    expect(overview.hfVamQuotient).toBe('')
  })

  it('rounds distance to integer meters', () => {
    const seg = mockSegment()
    const overview = computeSegmentOverview(seg)
    expect(overview.distance).toBe(Math.round(overview.distance))
  })

  it('rounds elevation gain to integer', () => {
    const seg = mockSegment({ elevationGain: 10.7 })
    const overview = computeSegmentOverview(seg)
    expect(overview.elevationGain).toBe(11)
  })

  it('formats distance since start in km with 2 decimals', () => {
    const seg = mockSegment({ startDistanceSinceStart: 1234 })
    const overview = computeSegmentOverview(seg)
    expect(overview.startDistanceSinceStart).toMatch(/^\d+\.\d{2}$/)
    expect(overview.startDistanceSinceStart).toBe('1.23')
  })
})
