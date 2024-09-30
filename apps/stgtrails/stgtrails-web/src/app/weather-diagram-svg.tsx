import { Fragment, useEffect, useRef, useState } from 'react'

import type { WeatherDataResponseDto } from '@plusone/stgtrails-api-client'

import { Circle, Rect } from './svg'

const CHART_WIDTH = 980
const CHART_HEIGHT = 600

function getXForTimestamp(ts: number, weather: Array<WeatherDataResponseDto>): number {
  const firstTs = new Date(weather[0].time)
  const lastTs = new Date(weather[weather.length - 1].time)

  const end = lastTs.valueOf() - firstTs.valueOf()
  const now = ts - firstTs.valueOf()

  return (CHART_WIDTH / end) * now
}

type WeatherDiagramSvgProps = {
  weather: Array<WeatherDataResponseDto>
  threshold: number
}

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function WeatherDiagramSvg({ weather, threshold }: WeatherDiagramSvgProps) {
  const portalRef = useRef<HTMLDivElement | null>(null)
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null)
  useEffect(() => {
    if (portalRef.current) {
      setPortalElement(portalRef.current)
    }
  }, [])

  const xForCurrentTimestamp = getXForTimestamp(Date.now(), weather)
  const yForThreshold = CHART_HEIGHT * (1 - threshold)

  return (
    <>
      <div ref={portalRef} />
      {portalElement && (
        <svg
          style={{ width: '100%', height: 'auto', maxHeight: 1000 }}
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          xmlns={'http://www.w3.org/2000/svg'}
        >
          {/* frame */}
          <rect x={0} y={0} width={CHART_WIDTH} height={CHART_HEIGHT} stroke={'black'} fill={'none'} />

          {/* amount of rain per hour (capped at 10mm/sqm) */}
          {weather.map((w, i) => (
            <Rect
              key={i}
              text={w.rain.toFixed(2) + ' l/m\xB2'}
              x={getXForTimestamp(new Date(weather[i].time).valueOf(), weather)}
              y={CHART_HEIGHT - (Math.min(10, w.rain) * CHART_HEIGHT) / 10}
              width={5}
              height={(Math.min(10, w.rain) * CHART_HEIGHT) / 10}
              fill={'lightblue'}
              portal={portalElement}
            />
          ))}

          {/* horizontal line for threshold */}
          <line stroke={'red'} x1={0} x2={CHART_WIDTH} y1={yForThreshold} y2={yForThreshold} />

          {/* vertical line representing "now" */}
          <text x={xForCurrentTimestamp + 5} y={54}>
            Now
          </text>
          <line
            stroke={'blue'}
            strokeDasharray={'5,5'}
            x1={xForCurrentTimestamp}
            x2={xForCurrentTimestamp}
            y1={44}
            y2={CHART_HEIGHT}
          />

          {/* vertical lines for days */}
          {weather
            .filter((w) => new Date(w.time).getUTCHours() === 0)
            .map((w) => {
              const date = new Date(w.time)
              const x = getXForTimestamp(new Date(w.time).valueOf(), weather)
              return (
                <Fragment key={w.time}>
                  <text x={x + 5} y={20}>
                    {date.toLocaleDateString()}
                  </text>
                  <text x={x + 5} y={36}>
                    {weekdays[date.getDay()]}
                  </text>
                  <line stroke={'black'} x1={x} x2={x} y1={0} y2={CHART_HEIGHT} />
                </Fragment>
              )
            })}

          {/* soil moisture */}
          <polyline
            stroke={'blue'}
            fill={'none'}
            points={weather
              .map((w, i) => {
                return `${getXForTimestamp(new Date(weather[i].time).valueOf(), weather)} ${CHART_HEIGHT - w.soilMoisture0To1cm * CHART_HEIGHT}`
              })
              .join(' ')}
          />
          {weather.map((w, i) => (
            <Circle
              key={i}
              text={w.soilMoisture0To1cm.toFixed(2) + ' %'}
              cx={getXForTimestamp(new Date(weather[i].time).valueOf(), weather)}
              cy={CHART_HEIGHT - w.soilMoisture0To1cm * CHART_HEIGHT}
              r={3}
              fill={'blue'}
              portal={portalElement}
            />
          ))}
        </svg>
      )}
    </>
  )
}
