import { type GeoPoint } from './track-similarity'

/**
 * Decode a polyline in the Google Encoded Polyline Algorithm Format (precision 5),
 * as used by Strava for `map.summary_polyline`.
 *
 * @see https://developers.google.com/maps/documentation/utilities/polylinealgorithm
 */
export function decodePolyline(encoded: string): Array<GeoPoint> {
  const points: Array<GeoPoint> = []
  let index = 0
  let lat = 0
  let lng = 0

  const nextValue = (): number => {
    let result = 0
    let shift = 0
    let byte: number
    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20 && index < encoded.length)
    return result & 1 ? ~(result >> 1) : result >> 1
  }

  while (index < encoded.length) {
    lat += nextValue()
    lng += nextValue()
    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 })
  }

  return points
}
