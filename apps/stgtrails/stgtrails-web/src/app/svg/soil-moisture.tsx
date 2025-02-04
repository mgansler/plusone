import type { ReactNode } from 'react'
import { Fragment } from 'react'

import type { WeatherDataResponseDto } from '@plusone/stgtrails-api-client'

import { FROSTED_GLASS_FILTER_ID } from './frosted-glass-filter'
import { CHART_HEIGHT, CHART_WIDTH, getXForTimestamp } from './shared'

function getYForMoisture(moisture: number): number {
  return CHART_HEIGHT - moisture * CHART_HEIGHT
}

type SoilMoistureProps = {
  weather: Array<WeatherDataResponseDto>
  sliderIndex: number
  moistureThreshold: number
}

export function SoilMoisture({ weather, sliderIndex, moistureThreshold }: SoilMoistureProps) {
  return (
    <Fragment>
      <line
        id={'moisture-threshold'}
        stroke={'red'}
        x1={0}
        x2={CHART_WIDTH}
        y1={CHART_HEIGHT * (1 - moistureThreshold)}
        y2={CHART_HEIGHT * (1 - moistureThreshold)}
      />

      <polyline
        id={'moisture'}
        stroke={'blue'}
        fill={'none'}
        points={weather
          .map((dataPoint, index) => {
            return `${getXForTimestamp(new Date(weather[index].time).valueOf(), weather)} ${getYForMoisture(dataPoint.soilMoisture0To1cm)}`
          })
          .join(' ')}
      />

      {weather.map(
        (dataPoint, index) =>
          (
            <circle
              key={`soil-moisture-${index}`}
              cx={getXForTimestamp(new Date(weather[index].time).valueOf(), weather)}
              cy={getYForMoisture(dataPoint.soilMoisture0To1cm)}
              r={index === sliderIndex ? 5 : 2}
              fill={'blue'}
            />
          ) as ReactNode,
      )}

      <rect
        x={Math.min(CHART_WIDTH - 120, (CHART_WIDTH / (weather.length - 1)) * sliderIndex)}
        y={getYForMoisture(weather[sliderIndex].soilMoisture0To1cm) - 36}
        width={120}
        height={40}
        fill={'white'}
        filter={`url(#${FROSTED_GLASS_FILTER_ID})`}
      />
      <text
        fontSize={'small'}
        x={Math.min(CHART_WIDTH - 120, (CHART_WIDTH / (weather.length - 1)) * sliderIndex + 5)}
        y={getYForMoisture(weather[sliderIndex].soilMoisture0To1cm) - 20}
      >
        {new Date(weather[sliderIndex].time).toLocaleTimeString()}
      </text>
      <text
        fontSize={'small'}
        x={Math.min(CHART_WIDTH - 120, (CHART_WIDTH / (weather.length - 1)) * sliderIndex + 5)}
        y={getYForMoisture(weather[sliderIndex].soilMoisture0To1cm) - 5}
      >
        {`Soil Moisture: ${weather[sliderIndex].soilMoisture0To1cm.toFixed(2)}%`}
      </text>
    </Fragment>
  )
}
