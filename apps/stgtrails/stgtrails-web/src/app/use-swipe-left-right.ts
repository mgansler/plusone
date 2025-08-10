import type { TouchEventHandler } from 'react'
import { useRef } from 'react'

export function useSwipeLeftRight(onLeft: () => void, onRight: () => void) {
  const touchStartX = useRef<number | null>(null)
  const minSwipeDistance = 50

  const handleTouchStart: TouchEventHandler<HTMLDivElement> = (event) => {
    touchStartX.current = event.touches[0].clientX
  }

  const handleTouchEnd: TouchEventHandler<HTMLDivElement> = (event) => {
    if (touchStartX.current == null) {
      return
    }

    const touchEndX = event.changedTouches[0].clientX
    const distance = touchStartX.current - touchEndX

    if (distance > minSwipeDistance) {
      onRight()
    } else if (distance < -minSwipeDistance) {
      onLeft()
    }

    touchStartX.current = null
  }

  return {
    handleTouchStart,
    handleTouchEnd,
  }
}
