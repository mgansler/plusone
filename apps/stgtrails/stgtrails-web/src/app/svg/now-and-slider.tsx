import type { ReactNode } from 'react'
import { Fragment } from 'react'

import type { WeatherDataResponseDto } from '@plusone/stgtrails-api-client'

import { useIsDesktop } from '../use-is-desktop'

import { getChartHeight, getChartWidth } from './shared'

export function getXForTimestamp(timestamps: Array<WeatherDataResponseDto['time']>, isDesktop: boolean): number {
  const firstTs = new Date(timestamps[0])
  const lastTs = new Date(timestamps[timestamps.length - 1])

  const end = lastTs.valueOf() - firstTs.valueOf()
  const now = Date.now() - firstTs.valueOf()

  return (getChartWidth(isDesktop) / end) * now
}

type NowAndSliderProps = {
  sliderIndex: number
  timestamps: Array<WeatherDataResponseDto['time']>
}
export function NowAndSlider({ sliderIndex, timestamps }: Readonly<NowAndSliderProps>) {
  const isDesktop = useIsDesktop()
  const xForCurrentTimestamp = getXForTimestamp(timestamps, isDesktop)

  return (
    <Fragment>
      {new Date(timestamps[sliderIndex]).getDay() !== new Date().getDay()
        ? ((
            <Fragment>
              {isDesktop ? (
                <text x={xForCurrentTimestamp + 5} y={66}>
                  Now
                </text>
              ) : null}
              <line
                id={'now'}
                stroke={'blue'}
                strokeDasharray={'5,5'}
                x1={xForCurrentTimestamp}
                x2={xForCurrentTimestamp}
                y1={56}
                y2={getChartHeight(isDesktop)}
              />
            </Fragment>
          ) as ReactNode)
        : null}

      <line
        id={'slider'}
        stroke={'green'}
        strokeDasharray={'5,5'}
        x1={(getChartWidth(isDesktop) / (timestamps.length - 1)) * sliderIndex}
        x2={(getChartWidth(isDesktop) / (timestamps.length - 1)) * sliderIndex}
        y1={56}
        y2={getChartHeight(isDesktop)}
      />
    </Fragment>
  )
}
