import { calculateHaversineDistance } from './haversine-distance'

export type GeoPoint = {
  latitude: number
  longitude: number
}

export type TrackSimilarityOptions = {
  /** Spacing used to resample both tracks before comparing them. */
  sampleSpacingMeter?: number
  /**
   * Stop early and return `Infinity` as soon as the result is known to exceed this value.
   * Use it when only distances below a threshold are of interest.
   */
  maxDistanceMeter?: number
}

type XY = { x: number; y: number }

const METERS_PER_DEGREE_LAT = 111_320

/**
 * Compute the Modified Hausdorff Distance (Dubuisson & Jain) between two tracks in meters.
 *
 * Both tracks are resampled at a fixed spacing, so the result is independent of the
 * recording density (a 1 Hz activity vs. a sparse planned route). For every sample of
 * one track the distance to the nearest *segment* of the other track is taken; the
 * result is the larger of the two directed mean distances.
 *
 * Returns `Infinity` if either track has fewer than two points or the distance exceeds
 * `maxDistanceMeter`.
 */
export function computeModifiedHausdorffDistance(
  trackA: Array<GeoPoint>,
  trackB: Array<GeoPoint>,
  options: TrackSimilarityOptions = {},
): number {
  const { sampleSpacingMeter = 25, maxDistanceMeter = Infinity } = options

  if (trackA.length < 2 || trackB.length < 2) return Infinity

  // Project onto a local plane – accurate enough for distances of a few hundred meters
  const origin = trackA[0]
  const metersPerDegreeLng = METERS_PER_DEGREE_LAT * Math.cos((origin.latitude * Math.PI) / 180)
  const project = (p: GeoPoint): XY => ({
    x: (p.longitude - origin.longitude) * metersPerDegreeLng,
    y: (p.latitude - origin.latitude) * METERS_PER_DEGREE_LAT,
  })

  const a = resampleTrack(trackA, sampleSpacingMeter).map(project)
  const b = resampleTrack(trackB, sampleSpacingMeter).map(project)

  const ab = directedMeanDistance(a, b, maxDistanceMeter)
  if (ab === Infinity) return Infinity
  const ba = directedMeanDistance(b, a, maxDistanceMeter)
  return Math.max(ab, ba)
}

/**
 * Resample a track so that consecutive points are `spacingMeter` apart (along the track).
 * Start and end point are always kept.
 */
export function resampleTrack(points: Array<GeoPoint>, spacingMeter: number): Array<GeoPoint> {
  if (points.length < 2) return [...points]

  const result: Array<GeoPoint> = [points[0]]
  let distanceSinceLastSample = 0

  for (let i = 1; i < points.length; i++) {
    const start = points[i - 1]
    const end = points[i]
    const segmentLength = calculateHaversineDistance(start, end)
    if (segmentLength === 0) continue

    let offset = spacingMeter - distanceSinceLastSample
    while (offset <= segmentLength) {
      const t = offset / segmentLength
      result.push({
        latitude: start.latitude + (end.latitude - start.latitude) * t,
        longitude: start.longitude + (end.longitude - start.longitude) * t,
      })
      offset += spacingMeter
    }
    distanceSinceLastSample = segmentLength - (offset - spacingMeter)
  }

  const last = points[points.length - 1]
  const lastSample = result[result.length - 1]
  if (lastSample.latitude !== last.latitude || lastSample.longitude !== last.longitude) {
    result.push(last)
  }

  return result
}

/**
 * Mean distance from every point of `from` to the nearest segment of polyline `to`.
 * Returns `Infinity` once the mean is certain to exceed `maxMean`.
 */
function directedMeanDistance(from: Array<XY>, to: Array<XY>, maxMean: number): number {
  // Distances are non-negative, so once the running sum passes this the mean can't drop below `maxMean`
  const maxTotal = maxMean * from.length
  let total = 0
  for (const p of from) {
    let best = Infinity
    for (let i = 1; i < to.length; i++) {
      const d = squaredDistanceToSegment(p, to[i - 1], to[i])
      if (d < best) best = d
    }
    total += Math.sqrt(best)
    if (total > maxTotal) return Infinity
  }
  return total / from.length
}

function squaredDistanceToSegment(p: XY, a: XY, b: XY): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const lengthSquared = dx * dx + dy * dy
  const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSquared))
  const cx = a.x + t * dx - p.x
  const cy = a.y + t * dy - p.y
  return cx * cx + cy * cy
}
