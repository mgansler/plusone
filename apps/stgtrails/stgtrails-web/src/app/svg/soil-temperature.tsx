import type { ReactNode } from 'react'
import { Fragment } from 'react'

import type { WeatherDataResponseDto } from '@plusone/stgtrails-api-client'

import { useIsDesktop } from '../use-is-desktop'

import { FROSTED_GLASS_FILTER_ID } from './frosted-glass-filter'
import { getChartHeight, getChartWidth, getXForTimestamp, mightBeFreezing } from './shared'

function getYForTemperature(temperature: number, isDesktop: boolean): number {
  return getChartHeight(isDesktop) / 3 - temperature * 3
}

type SoilTemperatureProps = {
  weather: Array<WeatherDataResponseDto>
  sliderIndex: number
}

export function SoilTemperature({ weather, sliderIndex }: Readonly<SoilTemperatureProps>) {
  const isDesktop = useIsDesktop()

  if (!mightBeFreezing(weather)) {
    return null
  }

  return (
    <Fragment>
      <line
        id={'temperature-threshold'}
        stroke={'orange'}
        x1={0}
        x2={getChartWidth(isDesktop)}
        y1={getChartHeight(isDesktop) / 3}
        y2={getChartHeight(isDesktop) / 3}
      />

      <polyline
        id={'temperature'}
        stroke={'orange'}
        fill={'none'}
        points={weather
          .map(
            (dataPoint, index) =>
              `${getXForTimestamp(new Date(weather[index].time).valueOf(), weather, isDesktop)} ${getYForTemperature(dataPoint.soilTemperature0cm, isDesktop)}`,
          )
          .join(' ')}
      />

      {weather.map(
        (dataPoint, index) =>
          (
            <circle
              key={`soil-temperature-${weather[index].time}`}
              cx={getXForTimestamp(new Date(weather[index].time).valueOf(), weather, isDesktop)}
              cy={getYForTemperature(dataPoint.soilTemperature0cm, isDesktop)}
              r={index === sliderIndex ? 5 : 2}
              fill={'orange'}
            />
          ) as ReactNode,
      )}

      <rect
        x={Math.min(getChartWidth(isDesktop) - 135, (getChartWidth(isDesktop) / (weather.length - 1)) * sliderIndex)}
        y={getYForTemperature(weather[sliderIndex].soilTemperature0cm, isDesktop) - 36}
        width={135}
        height={40}
        fill={'white'}
        filter={`url(#${FROSTED_GLASS_FILTER_ID})`}
      />
      <text
        fontSize={'small'}
        x={Math.min(
          getChartWidth(isDesktop) - 135,
          (getChartWidth(isDesktop) / (weather.length - 1)) * sliderIndex + 5,
        )}
        y={getYForTemperature(weather[sliderIndex].soilTemperature0cm, isDesktop) - 20}
      >
        {new Date(weather[sliderIndex].time).toLocaleTimeString()}
      </text>
      <text
        fontSize={'small'}
        x={Math.min(
          getChartWidth(isDesktop) - 135,
          (getChartWidth(isDesktop) / (weather.length - 1)) * sliderIndex + 5,
        )}
        y={getYForTemperature(weather[sliderIndex].soilTemperature0cm, isDesktop) - 5}
      >
        {`Soil Temperature: ${weather[sliderIndex].soilTemperature0cm.toFixed(1)}˚C`}
      </text>
    </Fragment>
  )
}
