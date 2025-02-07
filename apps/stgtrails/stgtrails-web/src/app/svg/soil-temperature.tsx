import type { ReactNode } from 'react'
import { Fragment } from 'react'

import type { WeatherDataResponseDto } from '@plusone/stgtrails-api-client'

import { FROSTED_GLASS_FILTER_ID } from './frosted-glass-filter'
import { CHART_HEIGHT, CHART_WIDTH, getXForTimestamp, mightBeFreezing } from './shared'

function getYForTemperature(temperature: number): number {
  return CHART_HEIGHT / 3 - temperature * 3
}

type SoilTemperatureProps = {
  weather: Array<WeatherDataResponseDto>
  sliderIndex: number
}

export function SoilTemperature({ weather, sliderIndex }: SoilTemperatureProps) {
  if (!mightBeFreezing(weather)) {
    return null
  }

  return (
    <Fragment>
      <line
        id={'temperature-threshold'}
        stroke={'orange'}
        x1={0}
        x2={CHART_WIDTH}
        y1={CHART_HEIGHT / 3}
        y2={CHART_HEIGHT / 3}
      />

      <polyline
        id={'temperature'}
        stroke={'orange'}
        fill={'none'}
        points={weather
          .map(
            (dataPoint, index) =>
              `${getXForTimestamp(new Date(weather[index].time).valueOf(), weather)} ${getYForTemperature(dataPoint.soilTemperature0cm)}`,
          )
          .join(' ')}
      />

      {weather.map(
        (dataPoint, index) =>
          (
            <circle
              key={`soil-temperature-${index}`}
              cx={getXForTimestamp(new Date(weather[index].time).valueOf(), weather)}
              cy={getYForTemperature(dataPoint.soilTemperature0cm)}
              r={index === sliderIndex ? 5 : 2}
              fill={'orange'}
            />
          ) as ReactNode,
      )}

      <rect
        x={Math.min(CHART_WIDTH - 135, (CHART_WIDTH / (weather.length - 1)) * sliderIndex)}
        y={getYForTemperature(weather[sliderIndex].soilTemperature0cm) - 36}
        width={135}
        height={40}
        fill={'white'}
        filter={`url(#${FROSTED_GLASS_FILTER_ID})`}
      />
      <text
        fontSize={'small'}
        x={Math.min(CHART_WIDTH - 135, (CHART_WIDTH / (weather.length - 1)) * sliderIndex + 5)}
        y={getYForTemperature(weather[sliderIndex].soilTemperature0cm) - 20}
      >
        {new Date(weather[sliderIndex].time).toLocaleTimeString()}
      </text>
      <text
        fontSize={'small'}
        x={Math.min(CHART_WIDTH - 135, (CHART_WIDTH / (weather.length - 1)) * sliderIndex + 5)}
        y={getYForTemperature(weather[sliderIndex].soilTemperature0cm) - 5}
      >
        {`Soil Temperature: ${weather[sliderIndex].soilTemperature0cm.toFixed(1)}˚C`}
      </text>
    </Fragment>
  )
}
