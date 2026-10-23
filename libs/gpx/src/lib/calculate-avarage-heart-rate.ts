import { type TrackPoint } from './types'
export function calculateAverageHeartRate(segment: Array<TrackPoint>): number | null {
  if (segment.length < 2) {
    // A single point has no duration, so no average can be calculated
    return segment[0]?.hr ?? null
  }

  let totalWeightedHeartRate = 0
  let totalDurationMs = 0

  for (let i = 0; i < segment.length - 1; i++) {
    const currentPoint = segment[i]
    const nextPoint = segment[i + 1]

    // Only calculate if a heart rate value is present
    if (currentPoint.hr !== undefined) {
      // Calculate the time difference to the next point in milliseconds
      const durationMs = nextPoint.time.getTime() - currentPoint.time.getTime()

      // Plausibility checks (e.g., if timestamps are identical or erroneously run backward)
      if (durationMs > 0) {
        totalWeightedHeartRate += currentPoint.hr * durationMs
        totalDurationMs += durationMs
      }
    }
  }

  // If no valid heart rate data with duration was found
  if (totalDurationMs === 0) {
    return null
  }

  // Calculate and round the time-weighted average
  return Math.round(totalWeightedHeartRate / totalDurationMs)
}
