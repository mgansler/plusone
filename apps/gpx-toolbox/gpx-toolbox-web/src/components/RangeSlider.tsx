import { useState, useRef, useCallback } from 'react'

interface RangeSliderProps {
  value: [number, number] // 0-100 range
  onChange: (value: [number, number]) => void
}

export function RangeSlider({ value, onChange }: RangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeThumb, setActiveThumb] = useState<'start' | 'end' | null>(null)

  const clamp = (v: number) => Math.max(0, Math.min(100, v))
  const minRange = 1 // minimum 1% to avoid thumbs crossing

  const handleTrackPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!trackRef.current) return
      e.preventDefault()
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)

      const rect = trackRef.current.getBoundingClientRect()
      const ratio = ((e.clientX - rect.left) / rect.width) * 100
      const clamped = clamp(Math.round(ratio))

      // Determine which thumb is closer
      const distStart = Math.abs(clamped - value[0])
      const distEnd = Math.abs(clamped - value[1])
      const thumb: 'start' | 'end' = distStart <= distEnd ? 'start' : 'end'
      setActiveThumb(thumb)

      // Move the thumb immediately
      if (thumb === 'start') {
        onChange([clamp(clamped), value[1]])
      } else {
        onChange([value[0], clamp(clamped)])
      }
    },
    [value, onChange],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!activeThumb || !trackRef.current) return

      const rect = trackRef.current.getBoundingClientRect()
      const ratio = ((e.clientX - rect.left) / rect.width) * 100
      const clamped = clamp(Math.round(ratio))

      if (activeThumb === 'start') {
        onChange([clamp(Math.min(clamped, value[1] - minRange)), value[1]])
      } else {
        onChange([value[0], clamp(Math.max(clamped, value[0] + minRange))])
      }
    },
    [activeThumb, value, onChange],
  )

  const handlePointerUp = useCallback(() => {
    setActiveThumb(null)
  }, [])

  const handleThumbPointerDown = useCallback(
    (thumb: 'start' | 'end') => (e: React.PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      setActiveThumb(thumb)
    },
    [],
  )

  return (
    <div style={styles.container}>
      <div
        ref={trackRef}
        onPointerDown={handleTrackPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={styles.trackWrapper}
      >
        {/* Background track */}
        <div style={styles.trackBg} />

        {/* Selected range with gradient */}
        <div
          style={{
            ...styles.trackFill,
            left: `${value[0]}%`,
            right: `${100 - value[1]}%`,
          }}
        />

        {/* Start thumb — green */}
        <div
          onPointerDown={handleThumbPointerDown('start')}
          style={{
            ...styles.thumb,
            left: `calc(${value[0]}% - 10px)`,
            background: '#4ade80',
            boxShadow:
              activeThumb === 'start'
                ? '0 0 0 3px rgba(134,239,172,0.4), 0 1px 4px rgba(0,0,0,0.2)'
                : '0 1px 3px rgba(0,0,0,0.15)',
          }}
        />

        {/* End thumb — red */}
        <div
          onPointerDown={handleThumbPointerDown('end')}
          style={{
            ...styles.thumb,
            left: `calc(${value[1]}% - 10px)`,
            background: '#f87171',
            boxShadow:
              activeThumb === 'end'
                ? '0 0 0 3px rgba(252,165,165,0.4), 0 1px 4px rgba(0,0,0,0.2)'
                : '0 1px 3px rgba(0,0,0,0.15)',
          }}
        />
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  trackWrapper: {
    position: 'relative' as const,
    height: '28px',
    cursor: 'pointer',
    userSelect: 'none' as const,
    touchAction: 'none' as const,
  },
  trackBg: {
    position: 'absolute' as const,
    top: '50%',
    left: 0,
    right: 0,
    height: '6px',
    transform: 'translateY(-50%)',
    background: '#334155',
    borderRadius: '3px',
  },
  trackFill: {
    position: 'absolute' as const,
    top: '50%',
    height: '6px',
    transform: 'translateY(-50%)',
    background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
    borderRadius: '3px',
    boxShadow: '0 1px 4px rgba(37,99,235,0.3)',
  },
  thumb: {
    position: 'absolute' as const,
    top: '50%',
    transform: 'translateY(-50%)',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    cursor: 'grab',
    transition: 'box-shadow 0.15s',
    border: '2px solid rgba(255,255,255,0.5)',
  },
} as const
