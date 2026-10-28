import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { TrackPoint } from '@plusone/gpx-toolbox-utils'

import { ElevationProfile } from './ElevationProfile'

const points: Array<TrackPoint> = [
  { latitude: 48.1372, longitude: 11.5756, elevation: 500, time: new Date('2024-01-01T10:00:00Z') },
  { latitude: 48.14, longitude: 11.58, elevation: 550, time: new Date('2024-01-01T10:05:00Z') },
  { latitude: 48.145, longitude: 11.585, elevation: 520, time: new Date('2024-01-01T10:10:00Z') },
]

const totalDistKm = 1.12 // approximate total distance in km, used as the full range

describe('ElevationProfile', () => {
  it('renders an SVG containing the full track line, segment line and area', () => {
    const { container } = render(<ElevationProfile points={points} range={[0, totalDistKm]} />)
    const svg = container.querySelector('svg')
    expect(svg).toBeTruthy()
    // full area + full line + segment area + segment line
    expect(container.querySelectorAll('path').length).toBeGreaterThanOrEqual(3)
    // start + end markers
    expect(container.querySelectorAll('circle').length).toBe(2)
  })

  it('shows the start and end elevation labels for the full range', () => {
    render(<ElevationProfile points={points} range={[0, totalDistKm]} />)
    // start = points[0].elevation (500), end = last point (520)
    expect(screen.getByText('↑ 500 m')).toBeTruthy()
    expect(screen.getByText('520 m ↓')).toBeTruthy()
  })

  it('restricts the end label to the selected sub-range', () => {
    // range [0, 0.45] km → findClosestIndex(points, 0.45) = 1 (cumulative dist at point 1 = 0.45 km)
    render(<ElevationProfile points={points} range={[0, 0.45]} />)
    // endIdx = 1 → end elevation = 550
    expect(screen.getByText('↑ 500 m')).toBeTruthy()
    expect(screen.getByText('550 m ↓')).toBeTruthy()
  })
})
