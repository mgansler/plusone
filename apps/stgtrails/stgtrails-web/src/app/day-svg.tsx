import type { SunriseSunsetResponseDto, WeatherDataResponseDto } from '@plusone/stgtrails-api-client'

import { Frame } from './svg/frame'
import { FrostedGlassFilter } from './svg/frosted-glass-filter'
import { NowAndSlider } from './svg/now-and-slider'
import { RainPerHour } from './svg/rain-per-hour'
import { getChartHeight, getChartWidth, mightBeFreezing } from './svg/shared'
import { SoilMoisture } from './svg/soil-moisture'
import { SoilTemperature } from './svg/soil-temperature'
import { useIsDesktop } from './use-is-desktop'

type DaySvgProps = {
  weather: Array<WeatherDataResponseDto>
  sunriseSunset: Array<SunriseSunsetResponseDto>
  threshold: number
  sliderIndex: number
}
export function DaySvg({ weather, sunriseSunset, threshold, sliderIndex }: DaySvgProps) {
  const isDesktop = useIsDesktop()
  return (
    <svg
      style={{ width: '100%', height: 'auto', maxHeight: 1000 }}
      viewBox={`0 0 ${getChartWidth(isDesktop)} ${getChartHeight(isDesktop)}`}
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
  )
}
