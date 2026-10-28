import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { TrackPoint } from '@plusone/gpx-toolbox-utils'

import { SegmentStats } from './SegmentStats'

// Three consecutive 5-min hops at ~48°N. Distance / speed depend on the Haversine
// calculation and are not asserted exactly, but the elevation and duration values
// are fully deterministic.
const points: Array<TrackPoint> = [
  { latitude: 48.1372, longitude: 11.5756, elevation: 500, time: new Date('2024-01-01T10:00:00Z') },
  { latitude: 48.14, longitude: 11.58, elevation: 550, time: new Date('2024-01-01T10:05:00Z') },
  { latitude: 48.145, longitude: 11.585, elevation: 520, time: new Date('2024-01-01T10:10:00Z') },
]

describe('SegmentStats', () => {
  it('shows the empty-state hint when fewer than two points are given', () => {
    render(<SegmentStats points={[]} />)
    expect(screen.getByText('Wähle mindestens 2 Punkte aus')).toBeTruthy()
  })

  it('renders the overview labels for a valid segment', () => {
    render(<SegmentStats points={points} />)
    expect(screen.getByText('Distanz')).toBeTruthy()
    expect(screen.getByText('Höhenmeter ↑')).toBeTruthy()
    expect(screen.getByText('Tiefenmeter ↓')).toBeTruthy()
    expect(screen.getByText('Dauer')).toBeTruthy()
    expect(screen.getByText('Ø Geschw.')).toBeTruthy()
    expect(screen.getByText('Max Geschw.')).toBeTruthy()
    expect(screen.getByText('Zeit')).toBeTruthy()
  })

  it('computes deterministic elevation gain, loss and duration', () => {
    render(<SegmentStats points={points} />)
    // 500→550 gives +50 m gain; 550→520 gives 30 m loss; 10:00→10:10 = 600 s
    expect(screen.getByText('50 m')).toBeTruthy() // elevation gain
    expect(screen.getByText('30 m')).toBeTruthy() // elevation loss
    expect(screen.getByText('10m 0s')).toBeTruthy() // duration
  })
})
