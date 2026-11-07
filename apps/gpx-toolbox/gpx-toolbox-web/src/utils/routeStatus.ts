import type { UpdateRouteDtoStatus } from '@plusone/gpx-toolbox-api-client'

type RouteStatus = `${UpdateRouteDtoStatus}`

const STATUS_LABELS: Record<RouteStatus, string> = {
  planned: 'Geplant',
  ridden: 'Gefahren',
  foundOnline: 'Online gefunden',
}

const STATUS_COLORS: Record<RouteStatus, string> = {
  planned: '#9c27b0',
  ridden: '#4caf50',
  foundOnline: '#ff5722',
}

const FALLBACK_COLOR = '#9e9e9e'

const SOURCE_COLORS: Record<string, string> = {
  manualImport: '#2196f3',
}

/** Badge color of a route source */
export function routeSourceColor(source: string): string {
  return SOURCE_COLORS[source] ?? FALLBACK_COLOR
}

/** German label of a route status, unknown values are shown as they are */
export function routeStatusLabel(status: string): string {
  return STATUS_LABELS[status as RouteStatus] ?? status
}

/** Badge color of a route status */
export function routeStatusColor(status: string): string {
  return STATUS_COLORS[status as RouteStatus] ?? FALLBACK_COLOR
}
