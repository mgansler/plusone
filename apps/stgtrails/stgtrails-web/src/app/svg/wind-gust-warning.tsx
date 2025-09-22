import { Fragment } from 'react'

import type { WeatherDataResponseDto } from '@plusone/stgtrails-api-client'

import { useIsDesktop } from '../use-is-desktop'

import { getChartWidth } from './shared'

type WindGustWarningsProps = {
  weather: Array<WeatherDataResponseDto>
  threshold?: number
}

export function WindGustWarnings({ weather, threshold = 30 }: Readonly<WindGustWarningsProps>) {
  const isDesktop = useIsDesktop()

  if (!weather || weather.length === 0) return null

  // Determine the unique midnight timestamps within the range, similar to Frame
  const timestamps = weather.map(({ time }) => new Date(time))
  const firstTs = timestamps[0]
  const lastTs = timestamps[timestamps.length - 1]

  const midnightDates = timestamps.filter((dt) => dt.getHours() === 0)

  // Helper: format same-day comparison
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

  return (
    <Fragment>
      {midnightDates.map((date) => {
        const hasStrongGust = weather.some((w) => {
          const wDate = new Date(w.time)
          const gust = w.windGusts10m
          return isSameDay(wDate, date) && gust > threshold
        })

        if (!hasStrongGust) return null

        const x =
          (getChartWidth(isDesktop) / (lastTs.valueOf() - firstTs.valueOf())) * (date.valueOf() - firstTs.valueOf()) + 5
        const y = 52 // below the date (y=20) and sunset (y=36) labels

        return (
          <g key={`gust-warning-${date.toISOString()}`}>
            <text x={x} y={y} fill={'#b30000'} fontSize={12} fontWeight={600}>
              {`⚠️ Wind gusts > ${threshold} km/h`}
            </text>
          </g>
        )
      })}
    </Fragment>
  )
}
