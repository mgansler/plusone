import type { SunriseSunsetResponseDto, WeatherDataResponseDto } from '@plusone/stgtrails-api-client'

export const CHART_WIDTH = 980
export const CHART_HEIGHT = 600

export function getXForTimestamp(ts: number, weather: Array<WeatherDataResponseDto>): number {
  const firstTs = new Date(weather[0].time)
  const lastTs = new Date(weather[weather.length - 1].time)

  const end = lastTs.valueOf() - firstTs.valueOf()
  const now = ts - firstTs.valueOf()

  return (CHART_WIDTH / end) * now
}

export function getSunsetString(date: Date, sunriseSunsetData: Array<SunriseSunsetResponseDto>): string {
  const sunriseSunsetForDay = sunriseSunsetData.find(
    (sunriseSunsetResponse) =>
      sunriseSunsetResponse.date ===
      `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`,
  )
  return sunriseSunsetForDay ? `, Sunset at ${new Date(sunriseSunsetForDay.sunset).toLocaleTimeString()}` : ''
}
