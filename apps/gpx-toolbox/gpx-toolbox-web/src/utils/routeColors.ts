/** Distinct track styles using Okabe-Ito palette for showing several routes at once (nearby search, comparison) */
export type RouteStyle = { color: string; dashArray: string }

const accessiblePalette: Array<RouteStyle> = [
  { color: '#CC79A7', dashArray: '8, 8' },
  { color: '#0072B2', dashArray: '12, 6' },
  { color: '#D55E00', dashArray: '4, 4, 8, 4' },
  { color: '#009E73', dashArray: '4, 8' },
  { color: '#E69F00', dashArray: '20, 5, 5, 5' },
  { color: '#56B4E9', dashArray: '16, 4, 4, 4' },
  { color: '#F0E442', dashArray: '6, 6' },
  { color: '#000000', dashArray: '16, 8' },
]

export function routeStyle(index: number): RouteStyle {
  return accessiblePalette[index % accessiblePalette.length]
}

/** Color-only convenience for UI elements that don't render polylines (swatches, card stripes) */
export function routeColor(index: number): string {
  return accessiblePalette[index % accessiblePalette.length].color
}

/** Badge colors per route source type */
export const sourceColors: Record<string, string> = {
  manualImport: '#2196f3',
}

/** Human-readable labels per route source type */
export const sourceLabels: Record<string, string> = {
  manualImport: 'Manuell',
}

// ── Map layer colors ────────────────────────────────────────────────────────

/** Hover marker on the map (elevation profile crosshair) */
export const mapHoverMarker = '#60a5fa'

/** "My location" marker ring color */
export const mapLocateMarkerRing = '#3b82f6'

/** "My location" marker fill (same as hover marker) */
export const mapLocateMarkerFill = '#60a5fa'

/** "My location" accuracy circle fill */
export const mapLocateCircleFill = '#60a5fa'

/** Full track line when a segment is selected (greyed out) */
export const mapFullTrack = '#94a3b8'

/** Selected segment highlight line */
export const mapSelectedSegment = '#2563eb'

/** Start marker square background */
export const mapStartMarker = '#22c55e'

/** End marker square background */
export const mapEndMarker = '#ef4444'

/** Invisible click handler polyline color (matches marker border for contrast) */
export const mapClickHandler = '#fff'

// ── PointDetails panel colors ───────────────────────────────────────────────

/** PointDetails panel background */
export const mapPanelBackground = '#fff'

/** PointDetails title and value text */
export const mapPanelText = '#1a1a1a'

/** PointDetails close button color */
export const mapPanelClose = '#999'

/** PointDetails label text */
export const mapPanelLabel = '#666'
