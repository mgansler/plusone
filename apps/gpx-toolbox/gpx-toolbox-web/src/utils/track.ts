import { calculateHaversineDistance, type TrackPoint } from '@plusone/gpx-toolbox-utils'

/**
 * Index of the first point whose cumulative distance from the start reaches `targetDistKm`.
 */
export function findClosestIndex(points: Array<TrackPoint>, targetDistKm: number): number {
  let dist = 0
  for (let i = 1; i < points.length; i++) {
    if (dist / 1000 >= targetDistKm) return i - 1
    dist += calculateHaversineDistance(points[i - 1], points[i])
  }
  return points.length - 1
}

/**
 * Points between `range[0]` and `range[1]` (both in km from the start).
 */
export function slicePointsByDistance(points: Array<TrackPoint>, range: [number, number]): Array<TrackPoint> {
  const startIdx = findClosestIndex(points, range[0])
  const endIdx = findClosestIndex(points, range[1])
  return points.slice(startIdx, endIdx + 1)
}

/**
 * Trigger a browser download for in-memory text content.
 */
export function downloadFile(content: string, mimeType: string, fileName: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
