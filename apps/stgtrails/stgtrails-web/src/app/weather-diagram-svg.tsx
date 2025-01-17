import { Fragment, useEffect, useRef, useState } from 'react'

import type { SunriseSunsetResponseDto, WeatherDataResponseDto } from '@plusone/stgtrails-api-client'

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

function scaleRain(rain: number): number {
  return Math.min(1, Math.log10(rain + 1) * 1.1)
}

function getSunsetString(date: Date, sunriseSunsetData: Array<SunriseSunsetResponseDto>): string {
  const sunriseSunsetForDay = sunriseSunsetData.find(
    (sunriseSunsetResponse) =>
      sunriseSunsetResponse.date ===
      `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`,
  )
  return sunriseSunsetForDay ? `, Sunset at ${new Date(sunriseSunsetForDay.sunset).toLocaleTimeString()}` : ''
}

function getYForTemperature(temp: number): number {
  return CHART_HEIGHT / 3 - temp * 3
}

type WeatherDiagramSvgProps = {
  weather: Array<WeatherDataResponseDto>
  sunriseSunset: Array<SunriseSunsetResponseDto>
  threshold: number
}

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function WeatherDiagramSvg({ weather, sunriseSunset, threshold }: WeatherDiagramSvgProps) {
  const portalRef = useRef<HTMLDivElement | null>(null)
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null)
  useEffect(() => {
    if (portalRef.current) {
      setPortalElement(portalRef.current)
    }
  }, [])

  const xForCurrentTimestamp = getXForTimestamp(Date.now(), weather)
  const yForTemperatureThreshold = CHART_HEIGHT / 3
  const yForMoistureThreshold = CHART_HEIGHT * (1 - threshold)

  const mightBeFreezing = Math.min(...weather.map((w) => w.soilTemperature0cm)) < 5

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

          {/* amount of rain per hour */}
          {weather.map((w, i) => (
            <Rect
              key={i}
              text={w.rain.toFixed(2) + ' l/m\xB2'}
              timestamp={new Date(w.time)}
              x={getXForTimestamp(new Date(weather[i].time).valueOf(), weather)}
              y={CHART_HEIGHT - CHART_HEIGHT * scaleRain(w.rain)}
              width={5}
              height={CHART_HEIGHT * scaleRain(w.rain)}
              fill={'lightblue'}
              portal={portalElement}
            />
          ))}

          {mightBeFreezing && (
            <line
              stroke={'orange'}
              x1={0}
              x2={CHART_WIDTH}
              y1={yForTemperatureThreshold}
              y2={yForTemperatureThreshold}
            />
          )}
          {/* horizontal line moisture for threshold */}
          <line stroke={'red'} x1={0} x2={CHART_WIDTH} y1={yForMoistureThreshold} y2={yForMoistureThreshold} />

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
            .filter((w) => new Date(w.time).getHours() === 0)
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
                    {getSunsetString(date, sunriseSunset)}
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
              text={`Soil Moisture: ${w.soilMoisture0To1cm.toFixed(2)}%`}
              timestamp={new Date(w.time)}
              cx={getXForTimestamp(new Date(weather[i].time).valueOf(), weather)}
              cy={CHART_HEIGHT - w.soilMoisture0To1cm * CHART_HEIGHT}
              r={3}
              fill={'blue'}
              portal={portalElement}
            />
          ))}

          {/* soil temperature*/}
          {mightBeFreezing && (
            <polyline
              stroke={'orange'}
              fill={'none'}
              points={weather
                .map((w, i) => {
                  return `${getXForTimestamp(new Date(weather[i].time).valueOf(), weather)} ${getYForTemperature(w.soilTemperature0cm)}`
                })
                .join(' ')}
            />
          )}
          {mightBeFreezing &&
            weather.map((w, i) => (
              <Circle
                key={i}
                text={`Soil Temperature: ${w.soilTemperature0cm.toFixed(1)}˚C`}
                timestamp={new Date(w.time)}
                cx={getXForTimestamp(new Date(weather[i].time).valueOf(), weather)}
                cy={getYForTemperature(w.soilTemperature0cm)}
                r={3}
                fill={'orange'}
                portal={portalElement}
              />
            ))}
        </svg>
      )}
    </>
  )
}
