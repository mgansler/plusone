import { type TrackPoint } from './types'
import { calculateHaversineDistance } from './haversine-distance'
import { calculateAverageHeartRate } from './calculate-avarage-heart-rate'

type SegmentType = 'uphill' | 'downhill' | 'flat' | null
type Segment = {
  type: SegmentType
  points: Array<TrackPoint>
  totalDistance: number
  elevationGain: number
  averageHeartRate?: number
  startDistanceSinceStart: number
}

const ELEVATION_THRESHOLD_METER = 10 // m — only real climbs/descents trigger direction changes

/**
 * Classify segments with < 10m net elevation as 'flat', then merge all
 * consecutive flat segments into one combined segment (not into the previous
 * non‑flat segment).
 *
 * Three‑pass algorithm:
 *   Pass 1  – classify each segment by its net elevation gain
 *   Pass 2  – merge consecutive flat segments together
 *   Pass 3  – recalculate elevation gain for all result segments
 *   Pass 4  - calculate average heart rate per segment
 */
export function postProcessSegments(segments: Array<Segment>): Array<Segment> {
  // ──────────────────────────────────────────────
  // Pass 1: classify each segment by net elevation gain
  // ──────────────────────────────────────────────
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    const netGain = Math.abs(seg.points[seg.points.length - 1].elevation - seg.points[0].elevation)
    if (netGain < ELEVATION_THRESHOLD_METER) {
      seg.type = 'flat'
    }
  }

  // ──────────────────────────────────────────────
  // Pass 2: merge all consecutive flat segments together
  // ──────────────────────────────────────────────
  const result: Array<Segment> = []

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]

    if (seg.type === 'flat') {
      // Check if previous result is also flat — merge into it
      if (result.length > 0 && result[result.length - 1].type === 'flat') {
        const prev = result[result.length - 1]
        for (let j = 1; j < seg.points.length; j++) {
          prev.points.push(seg.points[j])
          prev.totalDistance += calculateHaversineDistance(
            prev.points[prev.points.length - 2] as any,
            seg.points[j] as any,
          )
        }
      } else {
        // No previous flat — start a new one
        result.push(seg)
      }
    } else {
      // Non‑flat (uphill/downhill): keep as its own segment
      result.push(seg)
    }
  }

  // ──────────────────────────────────────────────
  // Pass 3: recalculate elevation gain for all final segments
  // ──────────────────────────────────────────────
  for (const seg of result) {
    seg.elevationGain = Math.round(
      seg.points.reduce((acc, _, i) => {
        if (i === 0) return acc
        // Use smoothed elevation when available (segmenter stores it on every point),
        // fall back to raw elevation for segments created outside the smoothing pipeline.
        const ele = (seg.points[i] as { smoothedEle?: number }).smoothedEle ?? seg.points[i].elevation
        const prevEle = (seg.points[i - 1] as { smoothedEle?: number }).smoothedEle ?? seg.points[i - 1].elevation
        const d = ele - prevEle
        return acc + Math.max(d, 0)
      }, 0),
    )
  }

  // ──────────────────────────────────────────────
  // Pass 4: calculate average heart rate per segment
  // ──────────────────────────────────────────────

  segments.forEach((seg) => {
    seg.averageHeartRate = calculateAverageHeartRate(seg.points) ?? undefined
  })

  return result
}
