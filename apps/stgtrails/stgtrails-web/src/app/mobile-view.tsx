import './carousel.css'

import React, { useState } from 'react'

import type { SunriseSunsetResponseDto, WeatherDataResponseDto } from '@plusone/stgtrails-api-client'

import { DaySvg } from './day-svg'
import { WEEKDAYS } from './svg/shared'

type MobileViewProps = {
  weather: Array<Array<WeatherDataResponseDto>>
  sunriseSunset: Array<SunriseSunsetResponseDto>
  threshold: number
}

export function MobileView({ weather, sunriseSunset, threshold }: MobileViewProps) {
  const [currentIndex, setCurrentIndex] = useState(() => {
    return weather.findIndex((day) => new Date(day[0].time).getDate() === new Date().getDate())
  })

  const currentWeekdayIndex = currentIndex + new Date(weather[0][0].time).getDay()

  const [direction, setDirection] = useState<'left' | 'right' | null>(null)
  const [sliderIndex, setSliderIndex] = useState<number>(() => new Date().getHours())

  const svgs = weather.map((day) => (
    <DaySvg
      key={day[0].time}
      weather={day}
      sunriseSunset={sunriseSunset}
      threshold={threshold}
      sliderIndex={sliderIndex}
    />
  ))

  const canGoLeft = currentIndex > 0
  const canGoRight = currentIndex < svgs.length - 1

  const handlePrev = () => {
    if (canGoLeft) {
      setDirection('left')
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (canGoRight) {
      setDirection('right')
      setCurrentIndex(currentIndex + 1)
    }
  }

  return (
    <div className="svg-carousel">
      <div className="svg-container">
        <div className={`svg-item ${direction ? `slide-in-${direction}` : ''}`} key={currentIndex}>
          {svgs[currentIndex]}
        </div>
      </div>

      <div className="controls">
        <input
          type="range"
          style={{ width: '100%' }}
          min={0}
          max={23}
          value={sliderIndex}
          onChange={(event) => setSliderIndex(event.currentTarget.valueAsNumber)}
        />

        <div className={'day-controls'}>
          <button onClick={handlePrev} disabled={!canGoLeft} className="control-button">
            ← {WEEKDAYS[(currentWeekdayIndex - 1) % 7]}
          </button>
          <button onClick={handleNext} disabled={!canGoRight} className="control-button">
            {WEEKDAYS[(currentWeekdayIndex + 1) % 7]} →
          </button>
        </div>
      </div>
    </div>
  )
}
