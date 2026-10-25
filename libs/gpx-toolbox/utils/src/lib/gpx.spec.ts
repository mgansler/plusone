import { parseGpx } from './gpx-parser'
import { segmentTrack } from './segmenter'
import { analyzeGpx } from './track-stats'
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
import { type TrackPoint } from './types'

function makeGpx(points: Array<{ lat: number; lon: number; ele?: number; time?: string; hr?: number }>): string {
  const trkpts = points
    .map(
      (p) =>
        `<trkpt lat="${p.lat}" lon="${p.lon}">${p.ele !== undefined ? `<ele>${p.ele}</ele>` : ''}${p.time ? `<time>${p.time}</time>` : ''}${p.hr !== undefined ? `<extensions><gpxtpx:TrackPointExtension><gpxtpx:hr>${p.hr}</gpxtpx:hr></gpxtpx:TrackPointExtension></extensions>` : ''}</trkpt>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx>
  <trk><trkseg>
    ${trkpts}
  </trkseg></trk>
</gpx>`
}

describe('parseGpx', () => {
  it('parses a minimal track', () => {
    const xml = makeGpx([{ lat: 48.0, lon: 11.0, ele: 100, time: '2024-01-01T10:00:00Z' }])
    const result = parseGpx(xml)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      latitude: 48.0,
      longitude: 11.0,
      elevation: 100,
      time: new Date('2024-01-01T10:00:00Z'),
    })
  })

  it('parses heart rate from extensions', () => {
    const xml = makeGpx([{ lat: 48.0, lon: 11.0, ele: 100, time: '2024-01-01T10:00:00Z', hr: 150 }])
    const result = parseGpx(xml)
    expect(result[0].hr).toBe(150)
  })
})

describe('segmentTrack', () => {
  function flatTrack(count: number): TrackPoint[] {
    return Array.from({ length: count }, (_, i) => ({
      latitude: 48 + i * 0.0001,
      longitude: 11,
      elevation: 100,
      time: new Date(2024, 0, 1, 10, 0, i),
    }))
  }

  it('returns empty for fewer than 2 points', () => {
    expect(segmentTrack([])).toEqual([])
    expect(segmentTrack([flatTrack(1)[0]])).toEqual([])
  })

  it('returns a single flat segment for constant elevation', () => {
    const points = flatTrack(20)
    const segments = segmentTrack(points)
    expect(segments).toHaveLength(1)
    expect(segments[0].type).toBe('flat')
  })
})

describe('analyzeGpx', () => {
  it('returns empty overview for empty GPX', () => {
    const result = analyzeGpx(makeGpx([]))
    expect(result.segments).toEqual([])
    expect(result.totalDistance).toBe(0)
    expect(result.totalDuration).toBe(0)
    expect(result.overallAvgHeartRate).toBeNull()
  })

  it('returns structured overview for a simple track', () => {
    const xml = makeGpx([
      { lat: 48.0, lon: 11.0, ele: 100, time: '2024-01-01T10:00:00Z' },
      { lat: 48.001, lon: 11.001, ele: 150, time: '2024-01-01T10:05:00Z' },
      { lat: 48.002, lon: 11.002, ele: 120, time: '2024-01-01T10:10:00Z' },
    ])
    const result = analyzeGpx(xml)

    expect(result.segments).toHaveLength(1)
    expect(result.totalDistance).toBeGreaterThan(0)
    expect(result.totalDuration).toBeGreaterThan(0)
    expect(result.segments[0].distance).toBe(result.totalDistance)
    expect(result.segments[0].duration).toBeDefined()
  })
})

describe('track-stats', () => {
  const pts = (baseEle = 0): TrackPoint[] =>
    Array.from({ length: 5 }, (_, i) => ({
      latitude: 48 + i * 0.0001,
      longitude: 11,
      elevation: baseEle + i * 10,
      time: new Date(2024, 0, 1, 10, i, 0),
    }))

  describe('calculateTotalDistance', () => {
    it('sums haversine distances', () => {
      const result = calculateTotalDistance(pts() as any)
      expect(result).toBeGreaterThan(0)
    })
  })

  describe('calculateElevationGain', () => {
    it('counts only positive changes', () => {
      expect(calculateElevationGain(pts(0))).toBe(40) // 10 * 4
    })
  })

  describe('calculateElevationLoss', () => {
    it('counts only negative changes', () => {
      const descending = pts(40).map((p) => ({ ...p, elevation: 40 - p.elevation }))
      expect(calculateElevationLoss(descending as any)).toBe(40)
    })
  })

  describe('calculateDuration', () => {
    it('returns seconds between first and last point', () => {
      expect(calculateDuration(pts())).toBe(240) // 4 * 60 seconds apart
    })
    it('returns 0 for fewer than 2 points', () => {
      expect(calculateDuration([])).toBe(0)
    })
  })

  describe('calculateAvgSpeed', () => {
    it('returns 0 for zero duration', () => {
      expect(calculateAvgSpeed(1000, 0)).toBe(0)
    })
    it('returns km/h', () => {
      // 1 km in 3600s = 1 hour → 1 km/h
      expect(calculateAvgSpeed(1000, 3600)).toBe(1)
    })
  })

  describe('calculateMaxSpeed', () => {
    it('returns 0 for fewer than 2 points', () => {
      expect(calculateMaxSpeed([])).toBe(0)
    })
  })

  describe('getTimeRange', () => {
    it('returns formatted time range', () => {
      const result = getTimeRange(pts())
      expect(result).toContain('–')
    })
    it('returns empty for fewer than 2 points', () => {
      expect(getTimeRange([])).toBe('')
    })
  })

  describe('formatTime', () => {
    it('formats as HH:mm de-DE', () => {
      expect(formatTime(new Date('2024-01-01T10:05:00Z'))).toContain(':')
    })
  })
})
