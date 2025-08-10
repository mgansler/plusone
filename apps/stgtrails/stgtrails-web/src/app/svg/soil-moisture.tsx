import type { ReactNode } from 'react'
import { Fragment } from 'react'

import type { WeatherDataResponseDto } from '@plusone/stgtrails-api-client'

import { useIsDesktop } from '../use-is-desktop'

import { FROSTED_GLASS_FILTER_ID } from './frosted-glass-filter'
import { getChartHeight, getChartWidth, getXForTimestamp } from './shared'

function getYForMoisture(moisture: number, isDesktop: boolean): number {
  return getChartHeight(isDesktop) - moisture * getChartHeight(isDesktop)
}

type SoilMoistureProps = {
  weather: Array<WeatherDataResponseDto>
  sliderIndex: number
  moistureThreshold: number
}

export function SoilMoisture({ weather, sliderIndex, moistureThreshold }: Readonly<SoilMoistureProps>) {
  const isDesktop = useIsDesktop()

  return (
    <Fragment>
      <line
        id={'moisture-threshold'}
        stroke={'red'}
        x1={0}
        x2={getChartWidth(isDesktop)}
        y1={getChartHeight(isDesktop) * (1 - moistureThreshold)}
        y2={getChartHeight(isDesktop) * (1 - moistureThreshold)}
      />

      <polyline
        id={'moisture'}
        stroke={'blue'}
        fill={'none'}
        points={weather
          .map((dataPoint, index) => {
            return `${getXForTimestamp(new Date(weather[index].time).valueOf(), weather, isDesktop)} ${getYForMoisture(dataPoint.soilMoisture0To1cm, isDesktop)}`
          })
          .join(' ')}
      />

      {weather.map(
        (dataPoint, index) =>
          (
            <circle
              key={`soil-moisture-${weather[index].time}`}
              cx={getXForTimestamp(new Date(weather[index].time).valueOf(), weather, isDesktop)}
              cy={getYForMoisture(dataPoint.soilMoisture0To1cm, isDesktop)}
              r={index === sliderIndex ? 5 : 2}
              fill={'blue'}
            />
          ) as ReactNode,
      )}

      <rect
        x={Math.min(getChartWidth(isDesktop) - 120, (getChartWidth(isDesktop) / (weather.length - 1)) * sliderIndex)}
        y={getYForMoisture(weather[sliderIndex].soilMoisture0To1cm, isDesktop) - 36}
        width={120}
        height={40}
        fill={'white'}
        filter={`url(#${FROSTED_GLASS_FILTER_ID})`}
      />
      <text
        fontSize={'small'}
        x={Math.min(
          getChartWidth(isDesktop) - 120,
          (getChartWidth(isDesktop) / (weather.length - 1)) * sliderIndex + 5,
        )}
        y={getYForMoisture(weather[sliderIndex].soilMoisture0To1cm, isDesktop) - 20}
      >
        {new Date(weather[sliderIndex].time).toLocaleTimeString()}
      </text>
      <text
        fontSize={'small'}
        x={Math.min(
          getChartWidth(isDesktop) - 120,
          (getChartWidth(isDesktop) / (weather.length - 1)) * sliderIndex + 5,
        )}
        y={getYForMoisture(weather[sliderIndex].soilMoisture0To1cm, isDesktop) - 5}
      >
        {`Soil Moisture: ${weather[sliderIndex].soilMoisture0To1cm.toFixed(2)}%`}
      </text>
    </Fragment>
  )
}
