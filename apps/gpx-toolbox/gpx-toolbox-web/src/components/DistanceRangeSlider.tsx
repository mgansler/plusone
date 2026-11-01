import { useCallback, useMemo, useRef, useState } from 'react'

import type { TrackPoint } from '@plusone/gpx-toolbox-utils'
import { calculateHaversineDistance } from '@plusone/gpx-toolbox-utils'

type DistanceRangeSliderProps = {
  points: Array<TrackPoint>
  value: [number, number] // distance range in km
  onChange: (value: [number, number]) => void
}

/** Range slider that operates on cumulative distance (km) instead of index */
export function DistanceRangeSlider({ points, value, onChange }: DistanceRangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeThumb, setActiveThumb] = useState<'start' | 'end' | null>(null)

  // Cumulative distances in km
  const dists = useMemo(() => {
    const result: Array<number> = [0]
    for (let i = 1; i < points.length; i++) {
      result.push(result[i - 1] + calculateHaversineDistance(points[i - 1], points[i]))
    }
    return result
  }, [points])

  const totalDist = dists[dists.length - 1] / 1000
  const minDist = 0.05 // minimum 50m to avoid thumbs crossing

  // Position in percent of the track; a track without distance (all points at one spot) has no range
  const percent = (km: number) => (totalDist > 0 ? (km / totalDist) * 100 : 0)

  // Clamp to valid range
  const clamp = (v: number) => Math.max(0, Math.min(totalDist, v))

  const handleTrackPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!trackRef.current) return
      e.preventDefault()
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)

      const rect = trackRef.current.getBoundingClientRect()
      const ratio = ((e.clientX - rect.left) / rect.width) * 100
      const distKm = (ratio / 100) * totalDist
      const snapped = clamp(Math.round(distKm * 100) / 100)

      // Determine which thumb is closer
      const distStart = Math.abs(snapped - value[0])
      const distEnd = Math.abs(snapped - value[1])
      const thumb: 'start' | 'end' = distStart <= distEnd ? 'start' : 'end'
      setActiveThumb(thumb)

      if (thumb === 'start') {
        onChange([clamp(snapped), value[1]])
      } else {
        onChange([value[0], clamp(snapped)])
      }
    },
    [totalDist, value, onChange, clamp],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!activeThumb || !trackRef.current) return

      const rect = trackRef.current.getBoundingClientRect()
      const ratio = ((e.clientX - rect.left) / rect.width) * 100
      const distKm = (ratio / 100) * totalDist
      const snapped = clamp(Math.round(distKm * 100) / 100)

      if (activeThumb === 'start') {
        onChange([clamp(Math.min(snapped, value[1] - minDist)), value[1]])
      } else {
        onChange([value[0], clamp(Math.max(snapped, value[0] + minDist))])
      }
    },
    [activeThumb, totalDist, value, onChange, clamp, minDist],
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
            left: `${percent(value[0])}%`,
            right: `${100 - percent(value[1])}%`,
          }}
        />

        {/* Start thumb — green */}
        <div
          onPointerDown={handleThumbPointerDown('start')}
          style={{
            ...styles.thumb,
            left: `${percent(value[0])}%`,
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
            left: `${percent(value[1])}%`,
            background: '#f87171',
            boxShadow:
              activeThumb === 'end'
                ? '0 0 0 3px rgba(252,165,165,0.4), 0 1px 4px rgba(0,0,0,0.2)'
                : '0 1px 3px rgba(0,0,0,0.15)',
          }}
        />
      </div>

      {/* Distance labels */}
      <div style={styles.labels}>
        <span style={{ ...styles.label, color: '#4ade80' }}>{value[0].toFixed(2)} km</span>
        <span style={{ ...styles.label, color: '#64748b' }}>{(value[1] - value[0]).toFixed(2)} km</span>
        <span style={{ ...styles.label, color: '#f87171' }}>{value[1].toFixed(2)} km</span>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
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
  labels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.65rem',
    fontFamily: 'monospace',
  },
  label: {
    color: '#64748b',
  },
} as const
