import type { ReactNode } from 'react'
import { Fragment } from 'react'

import type { WeatherDataResponseDto } from '@plusone/stgtrails-api-client'

import { CHART_HEIGHT, CHART_WIDTH } from './shared'

export function getXForTimestamp(ts: number, timestamps: Array<WeatherDataResponseDto['time']>): number {
  const firstTs = new Date(timestamps[0])
  const lastTs = new Date(timestamps[timestamps.length - 1])

  const end = lastTs.valueOf() - firstTs.valueOf()
  const now = ts - firstTs.valueOf()

  return (CHART_WIDTH / end) * now
}

type NowAndSliderProps = {
  sliderIndex: number
  timestamps: Array<WeatherDataResponseDto['time']>
}
export function NowAndSlider({ sliderIndex, timestamps }: NowAndSliderProps) {
  const xForCurrentTimestamp = getXForTimestamp(Date.now(), timestamps)

  return (
    <Fragment>
      {new Date(timestamps[sliderIndex]).getDay() !== new Date().getDay()
        ? ((
            <Fragment>
              <text x={xForCurrentTimestamp + 5} y={54}>
                Now
              </text>
              <line
                id={'now'}
                stroke={'blue'}
                strokeDasharray={'5,5'}
                x1={xForCurrentTimestamp}
                x2={xForCurrentTimestamp}
                y1={44}
                y2={CHART_HEIGHT}
              />
            </Fragment>
          ) as ReactNode)
        : null}

      <line
        id={'slider'}
        stroke={'green'}
        strokeDasharray={'5,5'}
        x1={(CHART_WIDTH / (timestamps.length - 1)) * sliderIndex}
        x2={(CHART_WIDTH / (timestamps.length - 1)) * sliderIndex}
        y1={44}
        y2={CHART_HEIGHT}
      />
    </Fragment>
  )
}
