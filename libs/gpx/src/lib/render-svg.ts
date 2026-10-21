import { type TrackPoint } from './types'
import { calculateBearing } from './haversine-distance'

// ─────────────────────────────────────────────────────────────────────────────
// Equirectangular projection
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert lat/lng to (x, y) using equirectangular projection.
 *
 * For small areas (< 50 km) the distortion is negligible. The centre
 * latitude is used as the secant to keep distances accurate on average.
 *
 * Returns raw radian offsets — these are intentionally unscaled so that
 * the caller can map them into an arbitrary coordinate space (e.g. pixel
 * space).
 */
export function projectPoint(lat: number, lng: number, centreLat: number): { x: number; y: number } {
  const toRad = (deg: number) => (deg * Math.PI) / 180

  const phi1 = toRad(centreLat)

  // Equirectangular: x = lng * cos(centreLat), y = lat (in radians)
  const x = toRad(lng) * Math.cos(phi1)
  const y = toRad(lat)

  return { x, y }
}

// ─────────────────────────────────────────────────────────────────────────────
// Bounding box
// ─────────────────────────────────────────────────────────────────────────────

export type BoundingBox = {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

export function computeBoundingBox(points: Array<{ x: number; y: number }>): BoundingBox {
  if (points.length === 0) {
    return { minX: 0, minY: 0, maxX: 1, maxY: 1 }
  }

  return {
    minX: Math.min(...points.map((p) => p.x)),
    minY: Math.min(...points.map((p) => p.y)),
    maxX: Math.max(...points.map((p) => p.x)),
    maxY: Math.max(...points.map((p) => p.y)),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Rotation helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Rotate points around a center by the given angle (in degrees, clockwise).
 *
 * Uses the standard 2D rotation matrix. Y-axis is inverted (north = up in SVG).
 */
function rotatePoints(
  points: Array<{ x: number; y: number }>,
  cx: number,
  cy: number,
  angleDeg: number,
): Array<{ x: number; y: number }> {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const cos = Math.cos(toRad(angleDeg))
  const sin = Math.sin(toRad(angleDeg))

  return points.map((p) => {
    const dx = p.x - cx
    const dy = p.y - cy
    return {
      x: dx * cos - dy * sin + cx,
      y: dx * sin + dy * cos + cy,
    }
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Coordinate mapping — raw projection → pixel space
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Map raw projected coordinates into SVG pixel space.
 *
 * This is the critical step that was missing: the original code fed raw
 * radian values directly into the viewBox, producing a viewport of only
 * ~0.002 × ~0.001 units — far too small for accurate rendering.
 *
 * The function:
 *   1. Computes the bounding box of projected points
 *   2. Applies padding as a fraction of the bounding box extent
 *   3. Maps the padded box into [0, svgWidth] × [0, svgHeight]
 *      (inverted Y so that north = up)
 */
function mapToPixelSpace(
  points: Array<{ x: number; y: number }>,
  svgWidth: number,
  svgHeight: number,
  padding = 0.05,
): { mapped: Array<{ x: number; y: number }>; bb: BoundingBox } {
  const bb = computeBoundingBox(points)

  // Extent of the bounding box
  const dx = bb.maxX - bb.minX
  const dy = bb.maxY - bb.minY

  // Apply padding
  const padX = dx * padding
  const padY = dy * padding

  const viewWidth = dx + 2 * padX
  const viewHeight = dy + 2 * padY

  // Uniform scale to preserve aspect ratio
  const scale = Math.min(svgWidth / viewWidth, svgHeight / viewHeight)

  const scaledW = viewWidth * scale
  const scaledH = viewHeight * scale

  // Map each point into pixel space (Y inverted: north → up)
  const mapped = points.map((p) => ({
    x: (svgWidth - scaledW) / 2 + ((p.x - (bb.minX - padX)) / viewWidth) * scaledW,
    y: (svgHeight - scaledH) / 2 + svgHeight - ((p.y - (bb.minY - padY)) / viewHeight) * scaledH,
  }))

  return { mapped, bb }
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG path generation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build an SVG `<path d="…">` string from pixel-space points.
 *
 * Uses Catmull-Rom → cubic bezier for smooth curves.
 */
export function buildPath(points: Array<{ x: number; y: number }>, useSmooth = true): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`

  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`

  if (useSmooth && points.length > 2) {
    // Catmull-Rom → cubic bezier for a smooth curve
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(i - 1, 0)]
      const p1 = points[i]
      const p2 = points[i + 1]
      const p3 = points[Math.min(i + 2, points.length - 1)]

      const cp1x = p1.x + (p2.x - p0.x) / 6
      const cp1y = p1.y + (p2.y - p0.y) / 6
      const cp2x = p2.x - (p3.x - p1.x) / 6
      const cp2y = p2.y - (p3.y - p1.y) / 6

      d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
    }
  } else {
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x.toFixed(2)} ${points[i].y.toFixed(2)}`
    }
  }

  return d
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export type RenderSvgOptions = {
  /** Track points to render (lat/lng in WGS‑84) */
  points: Array<TrackPoint>
  /** SVG width in pixels (default: 800) */
  width?: number
  /** SVG height in pixels (default: 600) */
  height?: number
  /** Stroke colour */
  stroke?: string
  /** Stroke width in SVG user units */
  strokeWidth?: number
  /** Fill for the area under the track (gradient stop) */
  fill?: string
  /** Whether to use smooth Catmull-Rom curves (default: true) */
  smooth?: boolean
  /** Padding around the bounding box as a fraction (default: 0.05) */
  padding?: number
  /** Whether to include an opacity gradient fill under the path */
  gradientFill?: boolean
  /**
   * Rotate track so start is at top and end is at bottom.
   * When true, width/height are swapped (portrait orientation).
   */
  rotate?: boolean
  /** Show start/end markers (default: true when rotate is false) */
  markers?: boolean
  /** Marker size in SVG user units (side length of square, default: 14) */
  markerSize?: number
  /** Start marker colour */
  startMarkerColor?: string
  /** End marker colour */
  endMarkerColor?: string
}

export type RenderSvgResult = {
  /** The complete SVG document as a string */
  svg: string
  /** The computed viewBox string */
  viewBox: string
}

/**
 * Render a GPX track as an SVG string.
 *
 * The function:
 *   1. Projects all points via equirectangular projection (radian offsets)
 *   2. Maps projected coordinates into SVG pixel space
 *   3. Optionally rotates the track so start is at top and end at bottom
 *   4. Builds a smooth Catmull-Rom path
 *   5. Optionally draws start/end markers
 *   6. Wraps everything in a self-contained SVG with optional gradient fill
 */
export function renderSvg(options: RenderSvgOptions): RenderSvgResult {
  const {
    points,
    width = 800,
    height = 600,
    stroke = '#2563eb',
    strokeWidth = 2,
    fill = '#2563eb',
    smooth = true,
    padding = 0.05,
    gradientFill = true,
    rotate = false,
    markers = !rotate,
    markerSize = 14,
    startMarkerColor = '#22c55e',
    endMarkerColor = '#ef4444',
  } = options

  if (points.length < 2) {
    return { svg: '', viewBox: '' }
  }

  // Centre latitude for projection (keeps distortion minimal)
  const centreLat = points.reduce((sum, p) => sum + p.latitude, 0) / points.length

  // Project all points to raw radian offsets
  const projected = points.map((p) => projectPoint(p.latitude, p.longitude, centreLat))

  // ── Rotation (on raw radian points, before pixel scaling) ─────────────────
  let rotated = projected

  if (rotate) {
    // Bearing from start to end (geographic angle, 0° = north, clockwise)
    const bearing = calculateBearing(points[0], points[points.length - 1])

    // Rotation angle: align the start→end vector with the south direction (-Y).
    // bearing - 180° gives the counter-clockwise rotation needed in radian space:
    //   bearing 0°  (→ north)  → -180° (flip)
    //   bearing 90° (→ east)   →  -90°  (90° CW)
    //   bearing 180° (→ south) →    0°  (no rotation)
    //   bearing 270° (→ west)  →  +90°  (90° CCW)
    const rotationDeg = bearing - 180

    // Rotate around the bounding-box center
    const bb = computeBoundingBox(projected)
    const cx = (bb.minX + bb.maxX) / 2
    const cy = (bb.minY + bb.maxY) / 2

    rotated = rotatePoints(projected, cx, cy, rotationDeg)
  }

  // viewBox in pixel space
  const svgWidth = rotate ? height : width
  const svgHeight = rotate ? width : height

  // Map into SVG pixel space — this is the key step
  const { mapped } = mapToPixelSpace(rotated, svgWidth, svgHeight, padding)
  const viewBox = `0 0 ${svgWidth} ${svgHeight}`

  // Path data
  const pathD = buildPath(mapped, smooth)

  // Gradient fill (area under the track)
  const gradientDef = gradientFill
    ? `<linearGradient id="trackGrad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${fill}" stop-opacity="0.3"/>
    <stop offset="100%" stop-color="${fill}" stop-opacity="0.02"/>
  </linearGradient>`
    : ''

  const fillPath = gradientFill
    ? (() => {
        const first = mapped[0]
        const last = mapped[mapped.length - 1]
        // Close the shape at the bottom of the viewBox
        return `<path d="${pathD} L ${last.x.toFixed(2)} ${svgHeight} L ${first.x.toFixed(2)} ${svgHeight} Z" fill="url(#trackGrad)"/>`
      })()
    : ''

  // ── Markers ─────────────────────────────────────────────────────────────
  const markerEls = markers
    ? (() => {
        const half = markerSize / 2

        const startRect = `<rect x="${(mapped[0].x - half).toFixed(2)}" y="${(mapped[0].y - half).toFixed(2)}" width="${markerSize}" height="${markerSize}" fill="${startMarkerColor}" rx="1"/>`
        const endRect = `<rect x="${(mapped[mapped.length - 1].x - half).toFixed(2)}" y="${(mapped[mapped.length - 1].y - half).toFixed(2)}" width="${markerSize}" height="${markerSize}" fill="${endMarkerColor}" rx="1"/>`

        return `\n    ${startRect}
    ${endRect}`
      })()
    : ''

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${svgWidth}" height="${svgHeight}" style="max-width: 100%; height: auto;">
  ${gradientDef}
  <g>
    ${fillPath}
    <path d="${pathD}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>${markerEls}
  </g>
</svg>`

  return { svg, viewBox }
}
