import { Fahrt, Route } from '@plusone/gpx-toolbox-persistence'

/** Daily weather summary from Open-Meteo, stored as JSON string in `Fahrt.weather` */
export type WeatherSummary = {
  date: string
  temperature2m: { max?: number; min?: number }
  rain: { sum?: number }
  windGusts: { max?: number }
}

export type FahrtResponse = {
  id: string
  routeId: string
  title: string | null
  riddenAt: Date
  duration: number | null
  avgHr: number | null
  maxHr: number | null
  notes: string | null
  weather: WeatherSummary | null
  createdAt: Date
  updatedAt: Date
}

export type FahrtWithRouteResponse = FahrtResponse & {
  routeName?: string
  route?: Pick<Route, 'id' | 'name' | 'status' | 'stats'>
}

export type PaginatedResponse<T> = {
  items: Array<T>
  total: number
  page: number
  limit: number
  totalPages: number
}

export function formatFahrt(fahrt: Fahrt): FahrtResponse {
  return {
    id: fahrt.id,
    routeId: fahrt.routeId,
    title: fahrt.title,
    riddenAt: fahrt.riddenAt,
    duration: fahrt.duration,
    avgHr: fahrt.avgHr,
    maxHr: fahrt.maxHr,
    notes: fahrt.notes,
    weather: fahrt.weather ? (JSON.parse(fahrt.weather) as WeatherSummary) : null,
    createdAt: fahrt.createdAt,
    updatedAt: fahrt.updatedAt,
  }
}

/** Like `formatFahrt`, plus name, status and stats of the parent route */
export function formatFahrtWithRoute(fahrt: Fahrt & { route?: Route | null }): FahrtWithRouteResponse {
  const { route } = fahrt
  return {
    ...formatFahrt(fahrt),
    routeName: route?.name,
    route: route ? { id: route.id, name: route.name, status: route.status, stats: route.stats } : undefined,
  }
}
