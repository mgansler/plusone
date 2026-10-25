import { describe, expect, it } from 'vitest'
import { postProcessSegments } from './post-process-segments'
import { type TrackPoint } from './types'
import { calculateHaversineDistance } from './haversine-distance'

const makePoint = (i: number, ele = 100, hr?: number): TrackPoint => ({
  latitude: 44.0 + i * 0.0001,
  longitude: 8.3 + i * 0.0001,
  elevation: ele,
  time: new Date(2026, 0, 1, 10, i, 0),
  ...(hr !== undefined && { hr }),
})

/** Build a mock segment with the raw shape expected by postProcessSegments */
function seg(type: 'uphill' | 'downhill' | 'flat' | null, elevations: number[], hr?: number) {
  const points = elevations.map((e, i) => makePoint(i, e, hr))
  let totalDistance = 0
  for (let i = 1; i < points.length; i++) {
    totalDistance += calculateHaversineDistance(points[i - 1], points[i])
  }
  return {
    type,
    points,
    totalDistance,
    elevationGain: 0,
    startDistanceSinceStart: 0,
  }
}

describe('postProcessSegments', () => {
  it('keeps uphill segments unchanged', () => {
    const segments = [seg('uphill', [100, 120, 150])]
    const result = postProcessSegments(segments)
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('uphill')
  })

  it('keeps downhill segments unchanged', () => {
    const segments = [seg('downhill', [150, 130, 100])]
    const result = postProcessSegments(segments)
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('downhill')
  })

  it('merges consecutive flat segments', () => {
    const segments = [seg('flat', [100, 101, 100]), seg('flat', [100, 99, 100]), seg('uphill', [100, 120, 150])]
    const result = postProcessSegments(segments)
    // First two flat segments merge into one
    expect(result).toHaveLength(2)
    expect(result[0].type).toBe('flat')
    expect(result[0].points.length).toBeGreaterThan(3) // combined points
    expect(result[1].type).toBe('uphill')
  })

  it('merges flat segments separated by uphill/downhill is false', () => {
    // Uphill between two flats should NOT be merged
    const segments = [seg('flat', [100, 101, 100]), seg('uphill', [100, 150, 200]), seg('flat', [200, 201, 200])]
    const result = postProcessSegments(segments)
    expect(result).toHaveLength(3)
  })

  it('recalculates elevation gain for merged segments', () => {
    const segments = [seg('flat', [100, 101, 100]), seg('flat', [100, 102, 100])]
    const result = postProcessSegments(segments)
    expect(result).toHaveLength(1)
    // Elevation gain recalculated for the merged segment
    expect(result[0].elevationGain).toBeGreaterThanOrEqual(0)
  })

  it('classifies small net elevation as flat', () => {
    // Net elevation change is only 5m, below the 10m threshold
    const segments = [
      {
        type: 'uphill' as const,
        points: [makePoint(0, 100), makePoint(1, 105)],
        totalDistance: 100,
        elevationGain: 0,
        startDistanceSinceStart: 0,
      },
    ]
    const result = postProcessSegments(segments)
    expect(result[0].type).toBe('flat')
  })

  it('keeps large net elevation as its original type', () => {
    const segments = [
      {
        type: 'uphill' as const,
        points: [makePoint(0, 100), makePoint(1, 150)],
        totalDistance: 100,
        elevationGain: 0,
        startDistanceSinceStart: 0,
      },
    ]
    const result = postProcessSegments(segments)
    expect(result[0].type).toBe('uphill')
  })

  it('calculates average heart rate per segment', () => {
    const segments = [seg('uphill', [100, 120, 150], 140), seg('downhill', [150, 130, 100], 160)]
    const result = postProcessSegments(segments)
    // Two non-flat segments stay separate, both get averageHeartRate
    expect(result).toHaveLength(2)
    expect(result[0].averageHeartRate).toBe(140)
    expect(result[1].averageHeartRate).toBe(160)
  })
})
