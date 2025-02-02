import type { ReactNode } from 'react'
import { Fragment } from 'react'

import type { WeatherDataResponseDto } from '@plusone/stgtrails-api-client'

import { FROSTED_GLASS_FILTER_ID } from './frosted-glass-filter'
import { CHART_HEIGHT, CHART_WIDTH, getXForTimestamp } from './shared'

function scaleRain(rain: number): number {
  return Math.min(1, Math.log10(rain + 1) * 1.1)
}

type RainPerHourProps = {
  weather: Array<WeatherDataResponseDto>
  sliderIndex: number
}
export function RainPerHour({ weather, sliderIndex }: RainPerHourProps) {
  return (
    <Fragment>
      {weather.map((dataPoint, index) => {
        return dataPoint.rain === 0
          ? null
          : ((
              <rect
                key={`rain-per-hour-${index}`}
                x={getXForTimestamp(new Date(weather[index].time).valueOf(), weather) - 2.5}
                y={CHART_HEIGHT - CHART_HEIGHT * scaleRain(dataPoint.rain)}
                width={index === 0 || index === weather.length - 1 ? 2.5 : 5}
                height={CHART_HEIGHT * scaleRain(dataPoint.rain)}
                fill={index === sliderIndex ? 'lightskyblue' : 'lightblue'}
              />
            ) as ReactNode)
      })}

      <rect
        x={Math.min(CHART_WIDTH - 90, (CHART_WIDTH / (weather.length - 1)) * sliderIndex)}
        y={CHART_HEIGHT - 46}
        width={90}
        height={40}
        fill={'white'}
        filter={`url(#${FROSTED_GLASS_FILTER_ID})`}
      />
      <text
        fontSize={'small'}
        x={Math.min(CHART_WIDTH - 90, (CHART_WIDTH / (weather.length - 1)) * sliderIndex + 5)}
        y={CHART_HEIGHT - 30}
      >
        {new Date(weather[sliderIndex].time).toLocaleTimeString()}
      </text>
      <text
        fontSize={'small'}
        x={Math.min(CHART_WIDTH - 90, (CHART_WIDTH / (weather.length - 1)) * sliderIndex + 5)}
        y={CHART_HEIGHT - 15}
      >
        {`Rain: ${weather[sliderIndex].rain.toFixed(2)} l/m\xB2`}
      </text>
    </Fragment>
  )
}
