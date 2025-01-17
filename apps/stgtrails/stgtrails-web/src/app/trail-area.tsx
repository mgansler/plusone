import {
  useValidatedSunriseSunsetDataForTrailArea,
  useValidatedTrailsForTrailArea,
  useValidatedWeatherDataForTrailArea,
} from '@plusone/stgtrails-api-client'

import { getUtcOffsetHours } from './get-utc-offset-hours'
import { WeatherDiagramSvg } from './weather-diagram-svg'

type TrailAreaProps = {
  trailAreaId: number
  threshold?: number
  hours: number
}

export function TrailArea({ trailAreaId, threshold = 0.3, hours }: TrailAreaProps) {
  const { data: trails } = useValidatedTrailsForTrailArea(trailAreaId)
  const { data: sunriseSunset } = useValidatedSunriseSunsetDataForTrailArea({ trailAreaId, days: hours / 24 })
  const { data: weather } = useValidatedWeatherDataForTrailArea(
    { trailAreaId, hours, utcOffsetHours: getUtcOffsetHours() },
    {
      query: { refetchInterval: 30_000 },
    },
  )
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
      <ul>{trails?.map((trail) => <li key={trail.id}>{trail.name}</li>)}</ul>
      <div>The total amount of rain over the past 24h was {rainPast24h.toFixed(1)}l.</div>

      <WeatherDiagramSvg threshold={threshold as number} weather={weather} sunriseSunset={sunriseSunset} />
    </>
  )
}
