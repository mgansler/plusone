/** Distinct track colors using Okabe-Ito palette for showing several routes at once (nearby search, comparison) */
const accessiblePalette = ['#000000', '#0072B2', '#009E73', '#56B4E9', '#CC79A7', '#D55E00', '#E69F00', '#F0E442']

export function routeColor(index: number): string {
  return accessiblePalette[index % accessiblePalette.length]
}
