import type { ReactNode } from 'react'
import { Fragment } from 'react'

import type { SunriseSunsetResponseDto } from '@plusone/stgtrails-api-client'

import { CHART_HEIGHT, CHART_WIDTH, getSunsetString } from './shared'

function getXForTimestamp(timestamp: Date, first: Date, last: Date) {
  const end = last.valueOf() - first.valueOf()
  const now = timestamp.valueOf() - first.valueOf()

  return (CHART_WIDTH / end) * now
}

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

type FrameProps = {
  timestamps: Array<Date>
  sunriseSunset: Array<SunriseSunsetResponseDto>
}

export function Frame({ timestamps, sunriseSunset }: FrameProps) {
  return (
    <Fragment>
      <rect x={0} y={0} width={CHART_WIDTH} height={CHART_HEIGHT} stroke={'black'} fill={'none'} />

      {
        timestamps
          .filter((datetime) => datetime.getHours() === 0)
          .map((datetime) => {
            const x = getXForTimestamp(datetime, timestamps[0], timestamps[timestamps.length - 1])
            return (
              <Fragment key={datetime.toLocaleTimeString()}>
                <text x={x + 5} y={20}>
                  {datetime.toLocaleDateString()}
                </text>
                <text x={x + 5} y={36}>
                  {weekdays[datetime.getDay()]}
                  {getSunsetString(datetime, sunriseSunset)}
                </text>
                <line stroke={'black'} x1={x} x2={x} y1={0} y2={CHART_HEIGHT} />
              </Fragment>
            )
          }) as ReactNode
      }
    </Fragment>
  )
}
