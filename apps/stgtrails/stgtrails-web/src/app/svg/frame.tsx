import type { ReactNode } from 'react'
import { Fragment } from 'react'

import type { SunriseSunsetResponseDto } from '@plusone/stgtrails-api-client'

import { useIsDesktop } from '../use-is-desktop'

import { getChartHeight, getChartWidth, getSunsetString, WEEKDAYS } from './shared'

function getXForTimestamp(timestamp: Date, first: Date, last: Date, isDesktop: boolean): number {
  const end = last.valueOf() - first.valueOf()
  const now = timestamp.valueOf() - first.valueOf()

  return (getChartWidth(isDesktop) / end) * now
}

type FrameProps = {
  timestamps: Array<Date>
  sunriseSunset: Array<SunriseSunsetResponseDto>
}

export function Frame({ timestamps, sunriseSunset }: Readonly<FrameProps>) {
  const isDesktop = useIsDesktop()

  return (
    <Fragment>
      <rect
        id={'outer-frame'}
        x={0}
        y={0}
        width={getChartWidth(isDesktop)}
        height={getChartHeight(isDesktop)}
        stroke={'black'}
        fill={'none'}
      />

      {
        timestamps
          .filter((datetime) => datetime.getHours() === 0)
          .map((datetime) => {
            const x = getXForTimestamp(datetime, timestamps[0], timestamps[timestamps.length - 1], isDesktop)
            return (
              <Fragment key={datetime.toLocaleDateString()}>
                <text x={x + 5} y={20}>
                  {WEEKDAYS[datetime.getDay()]}, {datetime.toLocaleDateString()}
                </text>
                <text x={x + 5} y={36}>
                  {getSunsetString(datetime, sunriseSunset)}
                </text>
                <line stroke={'black'} x1={x} x2={x} y1={0} y2={getChartHeight(isDesktop)} />
              </Fragment>
            )
          }) as ReactNode
      }
    </Fragment>
  )
}
