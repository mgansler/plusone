import { computeBoundingBox } from '@plusone/gpx-toolbox-utils'

import { PolylinePoint } from './polyline.util'

export type RouteGeometryColumns = {
  distance: number | null
  minLat: number | null
  maxLat: number | null
  minLng: number | null
  maxLng: number | null
}

/**
 * Denormalized columns stored next to `polyline` / `stats` so candidate routes for
 * auto-matching can be pre-filtered in SQL. Spread the result into every route
 * create/update that writes a polyline.
 */
export function routeGeometryColumns(polyline: Array<PolylinePoint>, distance: number): RouteGeometryColumns {
  const box = computeBoundingBox(polyline.map((p) => ({ latitude: p.lat, longitude: p.lng })))
  return {
    distance: polyline.length > 0 ? distance : null,
    minLat: box?.minLat ?? null,
    maxLat: box?.maxLat ?? null,
    minLng: box?.minLng ?? null,
    maxLng: box?.maxLng ?? null,
  }
}
