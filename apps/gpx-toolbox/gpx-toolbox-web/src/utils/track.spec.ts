import { afterEach, describe, expect, it, vi } from 'vitest'

import type { TrackPoint } from '@plusone/gpx-toolbox-utils'

import { downloadFile, findClosestIndex, slicePointsByDistance } from './track'

// Four points along the equator meridian, 0.009° latitude apart ≈ 1.0 km per hop
const points: Array<TrackPoint> = [0, 0.009, 0.018, 0.027].map((latitude, i) => ({
  latitude,
  longitude: 0,
  elevation: 100,
  time: new Date(`2024-01-01T10:0${i}:00Z`),
}))

describe('findClosestIndex', () => {
  it('returns the first point for distance 0', () => {
    expect(findClosestIndex(points, 0)).toBe(0)
  })

  it('returns the first point at or beyond the target distance', () => {
    expect(findClosestIndex(points, 1.5)).toBe(2)
  })

  it('returns the last point when the target exceeds the track length', () => {
    expect(findClosestIndex(points, 10)).toBe(3)
  })
})

describe('slicePointsByDistance', () => {
  it('returns all points for the full range', () => {
    expect(slicePointsByDistance(points, [0, 10])).toEqual(points)
  })

  it('cuts points off at the start and the end', () => {
    expect(slicePointsByDistance(points, [0.5, 1.5])).toEqual(points.slice(1, 3))
  })
})

describe('downloadFile', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates a blob link with the given file name, clicks it and cleans up', () => {
    const createObjectURL = vi.fn().mockReturnValue('blob:test')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)

    downloadFile('<gpx />', 'application/gpx+xml', 'track.gpx')

    const clicked = click.mock.contexts[0] as HTMLAnchorElement
    const blob = createObjectURL.mock.calls[0][0] as Blob
    expect(blob.type).toBe('application/gpx+xml')
    expect(clicked.download).toBe('track.gpx')
    expect(clicked.href).toBe('blob:test')
    expect(document.body.contains(clicked)).toBe(false)
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test')

    vi.unstubAllGlobals()
  })
})
