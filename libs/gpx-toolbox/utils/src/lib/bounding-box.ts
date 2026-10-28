import { type GeoPoint } from './track-similarity'

export type BoundingBox = {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}

const METERS_PER_DEGREE_LAT = 111_320

/** Smallest latitude/longitude rectangle containing all points, `null` for an empty track. */
export function computeBoundingBox(points: Array<GeoPoint>): BoundingBox | null {
  if (points.length === 0) return null

  const box = { minLat: Infinity, maxLat: -Infinity, minLng: Infinity, maxLng: -Infinity }
  for (const p of points) {
    box.minLat = Math.min(box.minLat, p.latitude)
    box.maxLat = Math.max(box.maxLat, p.latitude)
    box.minLng = Math.min(box.minLng, p.longitude)
    box.maxLng = Math.max(box.maxLng, p.longitude)
  }
  return box
}

/** Grow a bounding box by `marginMeter` in every direction. */
export function expandBoundingBox(box: BoundingBox, marginMeter: number): BoundingBox {
  const marginLat = marginMeter / METERS_PER_DEGREE_LAT
  const centerLat = (box.minLat + box.maxLat) / 2
  const marginLng = marginLat / Math.max(0.01, Math.cos((centerLat * Math.PI) / 180))
  return {
    minLat: box.minLat - marginLat,
    maxLat: box.maxLat + marginLat,
    minLng: box.minLng - marginLng,
    maxLng: box.maxLng + marginLng,
  }
}
