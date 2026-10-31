/**
 * Normalize a stored route `polyline` into an array of `{ lat, lng }` points.
 *
 * `Route.polyline` is a Prisma `Json` column, so depending on how a route was
 * written the value comes back in different shapes:
 *   - a plain `Array<{ lat, lng }>`  — the schema's intended shape
 *   - a JSON string (`JSON.stringify(...)`) — legacy / test data
 *   - an object `{ points: string | Array<...> }` — the current write path
 *
 * `JSON.parse(route.polyline as string)` throws on the object shapes
 * ("[object Object]" is not valid JSON), so this guards against every shape.
 */

export type PolylinePoint = {
  lat: number
  lng: number
}

export function parsePolyline(polyline: unknown): Array<PolylinePoint> {
  if (Array.isArray(polyline)) {
    return polyline
  }

  if (typeof polyline === 'string') {
    return parseJsonArray(polyline)
  }

  // `{ points: ... }` shape used by the current write path.
  if (polyline && typeof polyline === 'object') {
    const points = (polyline as { points?: unknown }).points
    if (typeof points === 'string') {
      return parseJsonArray(points)
    }
    if (Array.isArray(points)) {
      return points
    }
  }

  return []
}

function parseJsonArray(value: string): Array<PolylinePoint> {
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? (parsed as Array<PolylinePoint>) : []
  } catch {
    return []
  }
}

/**
 * Thin out a polyline to at most `maxPoints` points by keeping every n-th point.
 * First and last point are always kept so the track keeps its start and end.
 * Good enough for overview maps, where several routes are drawn at once.
 */
export function downsamplePolyline(points: Array<PolylinePoint>, maxPoints: number): Array<PolylinePoint> {
  if (points.length <= maxPoints) return points
  const step = (points.length - 1) / (maxPoints - 1)
  return Array.from({ length: maxPoints }, (_, i) => points[Math.round(i * step)])
}
