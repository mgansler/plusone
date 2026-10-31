import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { TrackPoint } from '@plusone/gpx-toolbox-utils'

import { CompareElevationProfile, type ProfileTrack } from './CompareElevationProfile'

// 0.009° latitude ≈ 1.0 km per hop
function points(km: number, elevation: (i: number) => number): Array<TrackPoint> {
  return Array.from({ length: km + 1 }, (_, i) => ({
    latitude: i * 0.009,
    longitude: 0,
    elevation: elevation(i),
    time: new Date(0),
  }))
}

const long: ProfileTrack = { id: 'long', name: 'Lang', color: '#e11d48', points: points(10, (i) => 100 + i * 10) }
const short: ProfileTrack = { id: 'short', name: 'Kurz', color: '#16a34a', points: points(5, () => 150) }

/** Largest x coordinate of an SVG path (viewBox width is 1000) */
function maxX(id: string): number {
  const d = screen.getByTestId(`profile-${id}`).getAttribute('d') ?? ''
  return Math.max(...[...d.matchAll(/[ML](-?[\d.]+),/g)].map((m) => Number(m[1])))
}

describe('CompareElevationProfile', () => {
  it('scales the x axis to the longest track, so shorter tracks end earlier', () => {
    render(<CompareElevationProfile tracks={[long, short]} />)

    expect(maxX('long')).toBeCloseTo(1000, 0)
    expect(maxX('short')).toBeCloseTo(500, -1)
  })

  it('reports only tracks that reach the hovered distance', () => {
    const onHover = vi.fn()
    render(<CompareElevationProfile tracks={[long, short]} onHover={onHover} />)
    const plot = screen.getByTestId('compare-profile-plot')
    plot.getBoundingClientRect = () => ({ left: 0, width: 1000 }) as DOMRect

    fireEvent.mouseMove(plot, { clientX: 200 })
    expect(onHover).toHaveBeenLastCalledWith([
      { id: 'long', point: long.points[2] },
      { id: 'short', point: short.points[2] },
    ])

    fireEvent.mouseMove(plot, { clientX: 800 })
    expect(onHover).toHaveBeenLastCalledWith([{ id: 'long', point: long.points[8] }])

    fireEvent.mouseLeave(plot)
    expect(onHover).toHaveBeenLastCalledWith(null)
  })

  it('skips tracks without elevation data', () => {
    const noElevation = { ...short, id: 'flat', points: points(5, () => NaN) }
    render(<CompareElevationProfile tracks={[long, noElevation]} />)

    expect(screen.queryByTestId('profile-flat')).toBeNull()
    expect(screen.getByTestId('profile-long')).toBeTruthy()
  })
})
