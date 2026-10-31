import { calculateHaversineDistance, type TrackPoint } from '@plusone/gpx-toolbox-utils'

/** Distance in meters from the start to every point of the track */
export function cumulativeDistances(points: Array<TrackPoint>): Array<number> {
  const distances = points.length > 0 ? [0] : []
  for (let i = 1; i < points.length; i++) {
    distances.push(distances[i - 1] + calculateHaversineDistance(points[i - 1], points[i]))
  }
  return distances
}

/** Index of the point closest to `distance` (meters) in ascending cumulative `distances` */
export function indexAtDistance(distances: Array<number>, distance: number): number {
  let low = 0
  let high = distances.length - 1
  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    if (distances[mid] < distance) low = mid + 1
    else high = mid
  }
  if (low > 0 && distance - distances[low - 1] < distances[low] - distance) return low - 1
  return low
}

/** Round tick step (1, 2 or 5 × 10ⁿ) so that `max` is split into about `targetTicks` intervals */
export function niceStep(max: number, targetTicks = 6): number {
  if (max <= 0) return 1
  const rough = max / targetTicks
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const normalized = rough / magnitude
  const factor = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
  return factor * magnitude
}
