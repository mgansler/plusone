import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { TrackPoint } from '@plusone/gpx-toolbox-utils'

import type * as TrackUtils from '../utils/track'

import { TrackAnalysis } from './TrackAnalysis'

const downloadFile = vi.fn()
vi.mock('../utils/track', async (importOriginal) => ({
  ...(await importOriginal<typeof TrackUtils>()),
  downloadFile: (...args: Array<unknown>) => downloadFile(...args),
}))

// 0.009° latitude ≈ 1.0 km per hop, 5 minutes apart
const points: Array<TrackPoint> = [
  { latitude: 0, longitude: 0, elevation: 500, time: new Date('2024-01-01T10:00:00Z') },
  { latitude: 0.009, longitude: 0, elevation: 550, time: new Date('2024-01-01T10:05:00Z') },
  { latitude: 0.018, longitude: 0, elevation: 520, time: new Date('2024-01-01T10:10:00Z') },
]

// Same geometry, but without any time progression (e.g. a planned route)
const untimedPoints = points.map((p) => ({ ...p, time: new Date('2024-01-01T10:00:00Z') }))

function renderAnalysis(props: Partial<Parameters<typeof TrackAnalysis>[0]> = {}) {
  return render(<TrackAnalysis points={points} range={[0, 2.1]} onRangeChange={vi.fn()} {...props} />)
}

describe('TrackAnalysis', () => {
  beforeEach(() => {
    downloadFile.mockClear()
  })

  it('renders nothing for fewer than two points', () => {
    const { container } = renderAnalysis({ points: points.slice(0, 1) })
    expect(container.innerHTML).toBe('')
  })

  it('renders the "Gesamt" and "Segment" sections', () => {
    renderAnalysis()
    expect(screen.getByRole('heading', { name: 'Gesamt' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Segment' })).toBeTruthy()
    expect(screen.getAllByRole('button', { name: 'GPX' })).toHaveLength(2)
    expect(screen.getAllByRole('button', { name: 'SVG' })).toHaveLength(2)
  })

  it('leaves out the "Gesamt" section on request', () => {
    renderAnalysis({ showOverview: false })
    expect(screen.queryByRole('heading', { name: 'Gesamt' })).toBeNull()
    expect(screen.getByRole('heading', { name: 'Segment' })).toBeTruthy()
    expect(screen.getAllByRole('button', { name: 'GPX' })).toHaveLength(1)
  })

  it('shows time-based stats only when the track has timestamps', () => {
    // Both "Gesamt" and the segment stats list the speed
    const { unmount } = renderAnalysis()
    expect(screen.getAllByText('Ø Geschw.')).toHaveLength(2)
    unmount()

    renderAnalysis({ points: untimedPoints })
    expect(screen.getByText('Abstieg ↓')).toBeTruthy()
    // "Gesamt" hides speed; only the segment stats still list it
    expect(screen.getAllByText('Ø Geschw.')).toHaveLength(1)
  })

  it('exports the full track with a sanitized file name', () => {
    renderAnalysis({ name: 'Runde um / den See!' })
    fireEvent.click(screen.getAllByRole('button', { name: 'GPX' })[0])

    expect(downloadFile).toHaveBeenCalledTimes(1)
    const [content, mimeType, fileName] = downloadFile.mock.calls[0]
    expect(mimeType).toBe('application/gpx+xml')
    expect(fileName).toBe('Runde_um_den_See.gpx')
    expect((content as string).match(/<trkpt /g)).toHaveLength(3)
    expect(content).toContain('<name>Runde um / den See!</name>')
  })

  it('exports only the selected segment', () => {
    // The segment ends at the first point at or beyond 0.5 km → points 0 and 1
    renderAnalysis({ range: [0, 0.5] })
    fireEvent.click(screen.getAllByRole('button', { name: 'GPX' })[1])

    const [content, , fileName] = downloadFile.mock.calls[0]
    expect(fileName).toBe('track_segment.gpx')
    expect((content as string).match(/<trkpt /g)).toHaveLength(2)
  })

  it('exports SVG files', () => {
    renderAnalysis({ name: 'Runde' })
    fireEvent.click(screen.getAllByRole('button', { name: 'SVG' })[1])

    const [content, mimeType, fileName] = downloadFile.mock.calls[0]
    expect(mimeType).toBe('image/svg+xml')
    expect(fileName).toBe('Runde_segment.svg')
    expect(content).toContain('<svg')
  })
})
