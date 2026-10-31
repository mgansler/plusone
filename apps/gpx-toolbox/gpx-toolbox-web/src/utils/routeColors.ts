/** Distinct track colors for showing several routes at once (nearby search, comparison) */
const routeColors = [
  '#e11d48',
  '#16a34a',
  '#2563eb',
  '#ea580c',
  '#9333ea',
  '#0891b2',
  '#db2777',
  '#65a30d',
  '#b45309',
  '#4f46e5',
]

export function routeColor(index: number): string {
  return routeColors[index % routeColors.length]
}
