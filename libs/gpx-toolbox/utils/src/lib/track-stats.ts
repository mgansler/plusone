import { type ProcessedSegment, type SegmentOverview, type TrackOverview } from './types'
import { calculateHaversineDistance } from './haversine-distance'
import { calculateAverageHeartRate } from './calculate-avarage-heart-rate'
import { parseGpx } from './gpx-parser'
import { segmentTrack } from './segmenter'

// ──────────────────────────────────────────────────
// Segment-level statistics
// ──────────────────────────────────────────────────

/**
 * Compute the overview row for a single processed segment.
 */
export function computeSegmentOverview(segment: ProcessedSegment): SegmentOverview {
  const startTime = segment.points[0].time
  const endTime = segment.points[segment.points.length - 1].time
  const durationSeconds = (endTime.getTime() - startTime.getTime()) / 1000

  const distance = Math.round(
    segment.points.reduce((acc, point, index) => {
      if (index === 0) return acc
      return acc + calculateHaversineDistance(segment.points[index - 1], point)
    }, 0),
  )

  const vam = Math.round(segment.elevationGain / (durationSeconds / 3600)) // VAM in m/h

  return {
    type: segment.type,
    points: segment.points.length,
    startTime: startTime.toLocaleTimeString(),
    endTime: endTime.toLocaleTimeString(),
    durationSeconds,
    duration: formatDuration(durationSeconds),
    distance,
    startDistanceSinceStart: (segment.startDistanceSinceStart / 1000).toFixed(2),
    endDistanceSinceStart: ((segment.startDistanceSinceStart + distance) / 1000).toFixed(2),
    elevationGain: Math.round(segment.elevationGain),
    vam,
    averageHeartRate: segment.averageHeartRate,
    hfVamQuotient: segment.averageHeartRate && vam > 0 ? (segment.averageHeartRate / vam).toFixed(2) : '',
  }
}

/**
 * Format seconds as "HH:MM:SS".
 */
function formatDuration(totalSeconds: number): string {
  const seconds = Math.floor(totalSeconds)
  return `${Math.floor(seconds / 3600)
    .toString()
    .padStart(2, '0')}:${Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, '0')}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0')}`
}

// ──────────────────────────────────────────────────
// Track-level statistics
// ──────────────────────────────────────────────────

/**
 * Compute the total distance of a track (sum of all segment distances).
 */
export function calculateTotalDistance(points: Array<{ latitude: number; longitude: number }>): number {
  let total = 0
  for (let i = 1; i < points.length; i++) {
    total += calculateHaversineDistance(points[i - 1], points[i])
  }
  return total
}

/**
 * Compute cumulative elevation gain (only positive elevation changes).
 */
export function calculateElevationGain(points: { elevation: number }[]): number {
  let gain = 0
  for (let i = 1; i < points.length; i++) {
    const diff = points[i].elevation - points[i - 1].elevation
    if (diff > 0) gain += diff
  }
  return gain
}

/**
 * Compute cumulative elevation loss (only negative elevation changes).
 */
export function calculateElevationLoss(points: { elevation: number }[]): number {
  let loss = 0
  for (let i = 1; i < points.length; i++) {
    const diff = points[i - 1].elevation - points[i].elevation
    if (diff > 0) loss += diff
  }
  return loss
}

/**
 * Compute the duration between first and last point in seconds.
 */
export function calculateDuration(points: { time: Date }[]): number {
  if (points.length < 2) return 0
  return (points[points.length - 1].time.getTime() - points[0].time.getTime()) / 1000
}

/**
 * Compute average speed in km/h from distance (meters) and duration (seconds).
 */
export function calculateAvgSpeed(distance: number, duration: number): number {
  if (duration === 0) return 0
  return Math.round((distance / 1000 / (duration / 3600)) * 10) / 10
}

/**
 * Compute maximum speed in km/h across all consecutive point pairs.
 */
export function calculateMaxSpeed(
  points: Array<{
    latitude: number
    longitude: number
    time: Date
  }>,
): number {
  let maxSpeed = 0
  for (let i = 1; i < points.length; i++) {
    const dt = (points[i].time.getTime() - points[i - 1].time.getTime()) / 1000
    if (dt > 0) {
      const dist = calculateHaversineDistance(points[i - 1], points[i])
      const speed = dist / 1000 / (dt / 3600)
      if (speed > maxSpeed) maxSpeed = speed
    }
  }
  return Math.round(maxSpeed * 10) / 10
}

/**
 * Compute the time range as "HH:mm – HH:mm" string.
 */
export function getTimeRange(points: { time: Date }[]): string {
  if (points.length < 2) return ''
  const start = points[0].time
  const end = points[points.length - 1].time
  return `${formatTime(start)} – ${formatTime(end)}`
}

/**
 * Format a Date as "HH:mm" (de-DE locale).
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

// ──────────────────────────────────────────────────
// Pipeline orchestration
// ──────────────────────────────────────────────────

/**
 * Full GPX analysis pipeline: parse → segment → compute overview.
 *
 * Returns a structured `TrackOverview` with per-segment statistics
 * and track-level totals. No side effects (no console output).
 */
export function analyzeGpx(xml: string, segmentOptions = {}): TrackOverview {
  const allPoints = parseGpx(xml)

  if (allPoints.length === 0) {
    return { segments: [], totalDistance: 0, totalDuration: 0, overallAvgHeartRate: null }
  }

  const segments = segmentTrack(allPoints, segmentOptions)
  const overview = segments.map(computeSegmentOverview)

  const totalDistance = overview.reduce((acc, segment) => acc + segment.distance, 0)
  const totalDuration = overview.reduce((acc, segment) => acc + segment.durationSeconds, 0)

  // Time-weighted average heart rate across all segments
  const allTrackPoints = segments.flatMap((s) => s.points)
  const overallAvgHr = calculateAverageHeartRate(allTrackPoints)

  return { segments: overview, totalDistance, totalDuration, overallAvgHeartRate: overallAvgHr }
}
