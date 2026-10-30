import { Activity, Route } from '@plusone/gpx-toolbox-persistence'

/** Daily weather summary from Open-Meteo, stored as JSON string in `Activity.weather` */
export type WeatherSummary = {
  date: string
  temperature2m: { max?: number; min?: number }
  rain: { sum?: number }
  windGusts: { max?: number }
}

export type ActivityResponse = {
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

export type ActivityWithRouteResponse = ActivityResponse & {
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

export function formatActivity(activity: Activity): ActivityResponse {
  return {
    id: activity.id,
    routeId: activity.routeId,
    title: activity.title,
    riddenAt: activity.riddenAt,
    duration: activity.duration,
    avgHr: activity.avgHr,
    maxHr: activity.maxHr,
    notes: activity.notes,
    weather: activity.weather ? (JSON.parse(activity.weather) as WeatherSummary) : null,
    createdAt: activity.createdAt,
    updatedAt: activity.updatedAt,
  }
}

/** Like `formatActivity`, plus name, status and stats of the parent route */
export function formatActivityWithRoute(activity: Activity & { route?: Route | null }): ActivityWithRouteResponse {
  const { route } = activity
  return {
    ...formatActivity(activity),
    routeName: route?.name,
    route: route ? { id: route.id, name: route.name, status: route.status, stats: route.stats } : undefined,
  }
}
