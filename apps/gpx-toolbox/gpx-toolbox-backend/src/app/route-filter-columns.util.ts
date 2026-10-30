import { computeBoundingBox } from '@plusone/gpx-toolbox-utils'

import { PolylinePoint } from './polyline.util'

export type RouteFilterColumns = {
  distance: number | null
  elevationGain: number | null
  minLat: number | null
  maxLat: number | null
  minLng: number | null
  maxLng: number | null
}

/**
 * Denormalized columns stored next to `polyline` / `stats` so routes can be filtered and
 * sorted in SQL (Activities list, auto-match candidates). Spread the result into every route
 * create/update that writes a polyline.
 */
export function routeFilterColumns(
  polyline: Array<PolylinePoint>,
  stats: { distance: number; elevationGain: number },
): RouteFilterColumns {
  const box = computeBoundingBox(polyline.map((p) => ({ latitude: p.lat, longitude: p.lng })))
  const hasTrack = polyline.length > 0
  return {
    distance: hasTrack ? stats.distance : null,
    elevationGain: hasTrack ? stats.elevationGain : null,
    minLat: box?.minLat ?? null,
    maxLat: box?.maxLat ?? null,
    minLng: box?.minLng ?? null,
    maxLng: box?.maxLng ?? null,
  }
}
