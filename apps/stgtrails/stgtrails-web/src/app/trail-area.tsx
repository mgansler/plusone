import { useMemo } from 'react'

import {
  useValidatedSunriseSunsetDataForTrailArea,
  useValidatedTrailsForTrailArea,
  useValidatedWeatherDataForTrailArea,
} from '@plusone/stgtrails-api-client'

import { DesktopView } from './desktop-view'
import { getUtcOffsetHours } from './get-utc-offset-hours'
import { groupByDay } from './group-by-day'
import { MobileView } from './mobile-view'
import { useIsDesktop } from './use-is-desktop'

type TrailAreaProps = {
  trailAreaId: number
  threshold?: number
  hours: number
}

export function TrailArea({ trailAreaId, threshold = 0.3, hours }: Readonly<TrailAreaProps>) {
  const isDesktop = useIsDesktop()

  const { data: trails } = useValidatedTrailsForTrailArea(trailAreaId)
  const { data: sunriseSunset } = useValidatedSunriseSunsetDataForTrailArea({ trailAreaId, days: hours / 24 })
  const { data: weather } = useValidatedWeatherDataForTrailArea(
    { trailAreaId, hours, utcOffsetHours: getUtcOffsetHours() },
    {
      query: { refetchInterval: 30_000 },
    },
  )
  const groupedPerDay = useMemo(() => groupByDay(weather), [weather])

  if (!weather || !sunriseSunset) {
    return null
  }

  if (weather.length === 0) {
    return <div>Sorry, there is currently no weather data available, check again later.</div>
  }

  const now = Date.now()
  const rainPast24h = weather.reduce((previousValue, currentValue) => {
    const currentTs = new Date(currentValue.time)
    if (currentTs.valueOf() <= now && currentTs.valueOf() >= now - 24 * 60 * 60 * 1_000) {
      return previousValue + currentValue.rain
    }
    return previousValue
  }, 0)

  return (
    <>
      {Array.isArray(trails) && trails.length > 0 ? (
        <ul>
          {trails?.map((trail) => (
            <li key={trail.id}>{trail.name}</li>
          ))}
        </ul>
      ) : null}

      <div style={{ marginLeft: '5px' }}>The total amount of rain over the past 24h was {rainPast24h.toFixed(1)}l.</div>

      {isDesktop ? (
        <DesktopView threshold={threshold} weather={weather} sunriseSunset={sunriseSunset} />
      ) : (
        <MobileView threshold={threshold} weather={groupedPerDay} sunriseSunset={sunriseSunset} />
      )}
    </>
  )
}
