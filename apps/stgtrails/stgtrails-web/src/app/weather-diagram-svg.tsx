import { Fragment, useState } from 'react'

import type { SunriseSunsetResponseDto, WeatherDataResponseDto } from '@plusone/stgtrails-api-client'

import { Frame } from './svg/frame'
import { FrostedGlassFilter } from './svg/frosted-glass-filter'
import { NowAndSlider } from './svg/now-and-slider'
import { RainPerHour } from './svg/rain-per-hour'
import { CHART_HEIGHT, CHART_WIDTH, getXForTimestamp, mightBeFreezing } from './svg/shared'
import { SoilMoisture } from './svg/soil-moisture'
import { SoilTemperature } from './svg/soil-temperature'

type WeatherDiagramSvgProps = {
  weather: Array<WeatherDataResponseDto>
  sunriseSunset: Array<SunriseSunsetResponseDto>
  threshold: number
}

export function WeatherDiagramSvg({ weather, sunriseSunset, threshold }: WeatherDiagramSvgProps) {
  const [sliderIndex, setSliderIndex] = useState<number>(() =>
    Math.min(weather.length - 1, Math.ceil(getXForTimestamp(Date.now(), weather) / (CHART_WIDTH / weather.length)) - 1),
  )

  return (
    <Fragment>
      <svg
        style={{ width: '100%', height: 'auto', maxHeight: 1000 }}
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        xmlns={'http://www.w3.org/2000/svg'}
      >
        <defs>
          <FrostedGlassFilter />
        </defs>

        <Frame timestamps={weather.map(({ time }) => new Date(time))} sunriseSunset={sunriseSunset} />

        <NowAndSlider sliderIndex={sliderIndex} timestamps={weather.map(({ time }) => time)} />

        <RainPerHour weather={weather} sliderIndex={sliderIndex} />
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
