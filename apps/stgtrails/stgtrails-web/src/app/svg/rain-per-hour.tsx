import type { ReactNode } from 'react'
import { Fragment } from 'react'

import type { WeatherDataResponseDto } from '@plusone/stgtrails-api-client'

import { useIsDesktop } from '../use-is-desktop'

import { FROSTED_GLASS_FILTER_ID } from './frosted-glass-filter'
import { getChartHeight, getChartWidth, getXForTimestamp } from './shared'

function scaleRain(rain: number): number {
  return Math.min(1, Math.log10(rain + 1) * 1.1)
}

type RainPerHourProps = {
  weather: Array<WeatherDataResponseDto>
  sliderIndex: number
}
export function RainPerHour({ weather, sliderIndex }: Readonly<RainPerHourProps>) {
  const isDesktop = useIsDesktop()

  return (
    <Fragment>
      {weather.map((dataPoint, index) => {
        return dataPoint.rain === 0
          ? null
          : ((
              <rect
                key={`rain-per-hour-${weather[index].time}`}
                x={getXForTimestamp(new Date(weather[index].time).valueOf(), weather, isDesktop) - 2.5}
                y={getChartHeight(isDesktop) - getChartHeight(isDesktop) * scaleRain(dataPoint.rain)}
                width={index === 0 || index === weather.length - 1 ? 2.5 : 5}
                height={getChartHeight(isDesktop) * scaleRain(dataPoint.rain)}
                fill={index === sliderIndex ? 'lightskyblue' : 'lightblue'}
              />
            ) as ReactNode)
      })}

      <rect
        x={Math.min(getChartWidth(isDesktop) - 90, (getChartWidth(isDesktop) / (weather.length - 1)) * sliderIndex)}
        y={getChartHeight(isDesktop) - 46}
        width={90}
        height={40}
        fill={'white'}
        filter={`url(#${FROSTED_GLASS_FILTER_ID})`}
      />
      <text
        fontSize={'small'}
        x={Math.min(getChartWidth(isDesktop) - 90, (getChartWidth(isDesktop) / (weather.length - 1)) * sliderIndex + 5)}
        y={getChartHeight(isDesktop) - 30}
      >
        {new Date(weather[sliderIndex].time).toLocaleTimeString()}
      </text>
      <text
        fontSize={'small'}
        x={Math.min(getChartWidth(isDesktop) - 90, (getChartWidth(isDesktop) / (weather.length - 1)) * sliderIndex + 5)}
        y={getChartHeight(isDesktop) - 15}
      >
        {`Rain: ${weather[sliderIndex].rain.toFixed(2)} l/m\xB2`}
      </text>
    </Fragment>
  )
}
