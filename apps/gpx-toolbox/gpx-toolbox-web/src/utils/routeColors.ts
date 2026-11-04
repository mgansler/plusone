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
