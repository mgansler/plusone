import './mobile.css'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import type { SunriseSunsetResponseDto, WeatherDataResponseDto } from '@plusone/stgtrails-api-client'

import { DaySvg } from './day-svg'
import { WEEKDAYS } from './svg/shared'
import { useSwipeLeftRight } from './use-swipe-left-right'

type MobileViewProps = {
  weather: Array<Array<WeatherDataResponseDto>>
  sunriseSunset: Array<SunriseSunsetResponseDto>
  threshold: number
}

export function MobileView({ weather, sunriseSunset, threshold }: Readonly<MobileViewProps>) {
  const indexOfToday = weather.findIndex((day) => new Date(day[0].time).getDate() === new Date().getDate())
  const [currentIndex, setCurrentIndex] = useState(indexOfToday)

  const svgContainerRef = useRef<HTMLDivElement>(null)
  const [svgContainerHeight, setSvgContainerHeight] = useState<number>(0)

  const currentWeekdayIndex = currentIndex + new Date(weather[0][0].time).getDay()

  const [direction, setDirection] = useState<'left' | 'right' | null>(null)
  const [sliderIndex, setSliderIndex] = useState<number>(() => new Date().getHours())

  const svgs =
    svgContainerHeight > 0
      ? weather.map((day) => (
          <DaySvg
            key={day[0].time}
            weather={day}
            sunriseSunset={sunriseSunset}
            threshold={threshold}
            sliderIndex={sliderIndex}
          />
        ))
      : []

  const canGoLeft = currentIndex > 0
  const canGoRight = currentIndex < svgs.length - 1

  const handlePrev = useCallback(() => {
    if (canGoLeft) {
      setDirection('left')
      setCurrentIndex(currentIndex - 1)
    }
  }, [canGoLeft, currentIndex])

  const handleNext = useCallback(() => {
    if (canGoRight) {
      setDirection('right')
      setCurrentIndex(currentIndex + 1)
    }
  }, [canGoRight, currentIndex])

  const handleToday = () => {
    if (currentIndex < indexOfToday) {
      setDirection('right')
      setCurrentIndex(indexOfToday)
    } else if (currentIndex > indexOfToday) {
      setDirection('left')
      setCurrentIndex(indexOfToday)
    }
  }

  useEffect(() => {
    if (svgContainerRef.current) {
      // @ts-expect-error global var
      window.__stgtrails = {
        svgHeight: svgContainerRef.current.clientHeight,
        svgWidth: svgContainerRef.current.clientWidth,
      }
      setSvgContainerHeight(svgContainerRef.current.clientHeight)
    }
  }, [])

  const { handleTouchStart, handleTouchEnd } = useSwipeLeftRight(handlePrev, handleNext)

  return (
    <div className="svg-carousel">
      <div className="svg-container" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} ref={svgContainerRef}>
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
          <button onClick={handleToday} disabled={currentIndex === indexOfToday} className="control-button">
            Today
          </button>
          <button onClick={handleNext} disabled={!canGoRight} className="control-button">
            {WEEKDAYS[(currentWeekdayIndex + 1) % 7]} →
          </button>
        </div>
      </div>
    </div>
  )
}
