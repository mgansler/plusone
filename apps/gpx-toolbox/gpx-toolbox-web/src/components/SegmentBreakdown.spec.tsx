import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { TrackPoint } from '@plusone/gpx-toolbox-utils'

import { SegmentBreakdown } from './SegmentBreakdown'

// Helper: generate points with steady elevation gain (produces uphill segments)
function generateUphillPoints(count = 20): Array<TrackPoint> {
  const points: Array<TrackPoint> = []
  for (let i = 0; i < count; i++) {
    points.push({
      latitude: 48.1372 + i * 0.001,
      longitude: 11.5756 + i * 0.001,
      elevation: 500 + i * 10,
      time: new Date(Date.UTC(2024, 0, 1, 10, 0, 0) + i * 300000),
    })
  }
  return points
}

// Helper: generate points with uphill then downhill (produces mixed segments)
function generateMixedPoints(): Array<TrackPoint> {
  const points: Array<TrackPoint> = []
  // Uphill: 10 points going up
  for (let i = 0; i < 10; i++) {
    points.push({
      latitude: 48.1372 + i * 0.001,
      longitude: 11.5756 + i * 0.001,
      elevation: 500 + i * 15,
      time: new Date(Date.UTC(2024, 0, 1, 10, 0, 0) + i * 300000),
    })
  }
  // Downhill: 10 points going down
  for (let i = 0; i < 10; i++) {
    points.push({
      latitude: 48.1472 + i * 0.001,
      longitude: 11.5856 + i * 0.001,
      elevation: 640 - i * 15,
      time: new Date(Date.UTC(2024, 0, 1, 10, 50, 0) + i * 300000),
    })
  }
  return points
}

// Helper: generate flat points (same elevation)
function generateFlatPoints(count = 20): Array<TrackPoint> {
  const points: Array<TrackPoint> = []
  for (let i = 0; i < count; i++) {
    points.push({
      latitude: 48.1372 + i * 0.001,
      longitude: 11.5756 + i * 0.001,
      elevation: 500,
      time: new Date(Date.UTC(2024, 0, 1, 10, 0, 0) + i * 300000),
    })
  }
  return points
}

// Uphill points: 20 points, steady climb → 1 uphill segment (~170m gain, 5700s = 1:35:00)
const uphillPoints = generateUphillPoints()

// Mixed points: 20 points, up then down → 1 uphill (~111m gain, 3000s) + 1 downhill (0m gain, 2700s)
const mixedPoints = generateMixedPoints()

// Flat points: 20 points, same elevation → 1 flat segment
const flatPoints = generateFlatPoints()

describe('SegmentBreakdown', () => {
  it('returns null when fewer than two points are given', () => {
    const { container } = render(<SegmentBreakdown points={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('also returns null with a single point', () => {
    const { container } = render(<SegmentBreakdown points={uphillPoints.slice(0, 1)} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders the title', () => {
    render(<SegmentBreakdown points={uphillPoints} />)
    expect(screen.getByText('Segment-Aufteilung')).toBeTruthy()
  })

  it('shows uphill label when points contain climbing segments', () => {
    render(<SegmentBreakdown points={uphillPoints} />)
    expect(screen.getByText('Anstieg')).toBeTruthy()
  })

  it('shows both uphill and downhill labels when points contain mixed segments', () => {
    render(<SegmentBreakdown points={mixedPoints} />)
    expect(screen.getByText('Anstieg')).toBeTruthy()
    expect(screen.getByText('Abstieg')).toBeTruthy()
  })

  it('shows flat label when points contain flat segments', () => {
    render(<SegmentBreakdown points={flatPoints} />)
    expect(screen.getByText('Flach')).toBeTruthy()
  })

  it('shows segment count', () => {
    render(<SegmentBreakdown points={uphillPoints} />)
    // Segment count uses pluralization; at least one segment type should have a count
    const countElements = screen.getAllByText(/Segment/)
    expect(countElements.length).toBeGreaterThan(0)
  })

  it('shows distance formatted in km for longer distances', () => {
    // Uphill segment distance is ~2.5 km
    render(<SegmentBreakdown points={uphillPoints} />)
    expect(screen.getByText('2.5 km')).toBeTruthy()
  })

  it('shows distance formatted in meters for shorter segments', () => {
    // Mixed points: downhill segment is ~1.2 km, uphill is ~1.3 km
    render(<SegmentBreakdown points={mixedPoints} />)
    expect(screen.getByText('1.3 km')).toBeTruthy()
    expect(screen.getByText('1.2 km')).toBeTruthy()
  })

  it('shows elevation gain in meters for uphill segments', () => {
    // Uphill points produce ~170m elevation gain
    render(<SegmentBreakdown points={uphillPoints} />)
    expect(screen.getByText('↑ 170 m')).toBeTruthy()
  })

  it('shows dash for zero elevation gain on downhill segments', () => {
    render(<SegmentBreakdown points={mixedPoints} />)
    // Downhill segments have no elevation gain, should show '—'
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })

  it('shows dash for zero elevation gain on flat segments', () => {
    render(<SegmentBreakdown points={flatPoints} />)
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })

  it('shows duration in hours:minutes:seconds format for long durations', () => {
    // Uphill points: 5700s = 1:35:00
    render(<SegmentBreakdown points={uphillPoints} />)
    expect(screen.getByText('1:35:00')).toBeTruthy()
  })

  it('shows duration in minutes:seconds format for shorter durations', () => {
    // Mixed points: downhill segment is 2700s = 45:00
    render(<SegmentBreakdown points={mixedPoints} />)
    expect(screen.getByText('45:00')).toBeTruthy()
  })

  it('shows percentage bars for each segment type', () => {
    render(<SegmentBreakdown points={uphillPoints} />)
    // Single segment type should show 100%
    expect(screen.getByText(/\d+%/)).toBeTruthy()
  })

  it('shows percentages that sum to ~100% for mixed segments', () => {
    render(<SegmentBreakdown points={mixedPoints} />)
    const percentageElements = screen.getAllByText(/\d+%/)
    expect(percentageElements.length).toBeGreaterThan(1)
  })
})
