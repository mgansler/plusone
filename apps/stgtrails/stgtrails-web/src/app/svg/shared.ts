import type { TFunction } from 'i18next'

import type { SunriseSunsetResponseDto, WeatherDataResponseDto } from '@plusone/stgtrails-api-client'

// @ts-expect-error global var
export const getChartWidth = (isDesktop: boolean) => (isDesktop ? 980 : window.__stgtrails.svgWidth)
// @ts-expect-error global var
export const getChartHeight = (isDesktop: boolean) => (isDesktop ? 600 : window.__stgtrails.svgHeight)

export const WEEKDAYS = [
  'svg.weekdays.sunday',
  'svg.weekdays.monday',
  'svg.weekdays.tuesday',
  'svg.weekdays.wednesday',
  'svg.weekdays.thursday',
  'svg.weekdays.friday',
  'svg.weekdays.saturday',
]

export function getXForTimestamp(ts: number, weather: Array<WeatherDataResponseDto>, isDesktop: boolean): number {
  const firstTs = new Date(weather[0].time)
  const lastTs = new Date(weather[weather.length - 1].time)

  const end = lastTs.valueOf() - firstTs.valueOf()
  const now = ts - firstTs.valueOf()

  return (getChartWidth(isDesktop) / end) * now
}

export function getSunsetString(t: TFunction, date: Date, sunriseSunsetData: Array<SunriseSunsetResponseDto>): string {
  const sunriseSunsetForDay = sunriseSunsetData.find(
    (sunriseSunsetResponse) =>
      sunriseSunsetResponse.date ===
      `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`,
  )
  return sunriseSunsetForDay
    ? t(['svg.sunset'], { time: new Date(sunriseSunsetForDay.sunset).toLocaleTimeString() })
    : ''
}

export function mightBeFreezing(weather: Array<WeatherDataResponseDto>) {
  return Math.min(...weather.map((w) => w.soilTemperature0cm)) < 5
}
