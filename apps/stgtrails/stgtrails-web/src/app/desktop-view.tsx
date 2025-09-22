import { Fragment, useState } from 'react'

import type { SunriseSunsetResponseDto, WeatherDataResponseDto } from '@plusone/stgtrails-api-client'

import { Frame } from './svg/frame'
import { FrostedGlassFilter } from './svg/frosted-glass-filter'
import { NowAndSlider } from './svg/now-and-slider'
import { RainPerHour } from './svg/rain-per-hour'
import { getChartHeight, getChartWidth, getXForTimestamp, mightBeFreezing } from './svg/shared'
import { SoilMoisture } from './svg/soil-moisture'
import { SoilTemperature } from './svg/soil-temperature'
import { WindGustWarnings } from './svg/wind-gust-warning'
import { useIsDesktop } from './use-is-desktop'

type DesktopViewProps = {
  weather: Array<WeatherDataResponseDto>
  sunriseSunset: Array<SunriseSunsetResponseDto>
  threshold: number
}

export function DesktopView({ weather, sunriseSunset, threshold }: Readonly<DesktopViewProps>) {
  const isDesktop = useIsDesktop()
  const [sliderIndex, setSliderIndex] = useState<number>(() =>
    Math.min(
      weather.length - 1,
      Math.ceil(getXForTimestamp(Date.now(), weather, isDesktop) / (getChartWidth(isDesktop) / weather.length)) - 1,
    ),
  )

  return (
    <Fragment>
      <svg
        style={{ width: '100%', height: 'auto', maxHeight: 1000 }}
        viewBox={`0 0 ${getChartWidth(isDesktop)} ${getChartHeight(isDesktop)}`}
        xmlns={'http://www.w3.org/2000/svg'}
      >
        <defs>
          <FrostedGlassFilter />
        </defs>
        <RainPerHour weather={weather} sliderIndex={sliderIndex} />

        <Frame timestamps={weather.map(({ time }) => new Date(time))} sunriseSunset={sunriseSunset} />

        <WindGustWarnings weather={weather} />

        <NowAndSlider sliderIndex={sliderIndex} timestamps={weather.map(({ time }) => time)} />

        <SoilTemperature weather={weather} sliderIndex={sliderIndex} />
        <SoilMoisture
          weather={weather}
          sliderIndex={sliderIndex}
          moistureThreshold={mightBeFreezing(weather) ? threshold * 0.95 : threshold}
        />
      </svg>

      <input
        type="range"
        style={{ width: '100%' }}
        min={0}
        max={weather.length - 1}
        value={sliderIndex}
        onChange={(event) => setSliderIndex(event.currentTarget.valueAsNumber)}
      />
    </Fragment>
  )
}
