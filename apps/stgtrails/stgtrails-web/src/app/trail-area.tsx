import { useValidatedTrailsForTrailArea, useValidatedWeatherDataForTrailArea } from '@plusone/stgtrails-api-client'

import { rootRoute } from '../routes'

import { WeatherDiagramLegacy } from './weather-diagram-legacy'
import { WeatherDiagramSvg } from './weather-diagram-svg'

type TrailAreaProps = {
  trailAreaId: number
  threshold?: number
  hours: number
}

export function TrailArea({ trailAreaId, threshold = 0.3, hours }: TrailAreaProps) {
  const { data: trails } = useValidatedTrailsForTrailArea(trailAreaId)
  const { data: weather } = useValidatedWeatherDataForTrailArea(
    trailAreaId,
    { hours },
    {
      query: { refetchInterval: 30_000 },
    },
  )
  const { legacy } = rootRoute.useSearch()

  if (!weather) {
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
      {legacy ? (
        <WeatherDiagramLegacy hours={hours} weather={weather} />
      ) : (
        <WeatherDiagramSvg threshold={threshold} weather={weather} />
      )}
    </>
  )
}
