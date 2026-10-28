import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { parseGpx } from './gpx-parser'
import { computeModifiedHausdorffDistance, resampleTrack } from './track-similarity'

const line = (n: number, latBase = 48.0, lngBase = 11.0, step = 0.0001) =>
  Array.from({ length: n }, (_, i) => ({ latitude: latBase + i * step, longitude: lngBase }))

describe('resampleTrack', () => {
  it('produces evenly spaced points and keeps start and end', () => {
    // ~111 m long, two input points only
    const track = [
      { latitude: 48.0, longitude: 11.0 },
      { latitude: 48.001, longitude: 11.0 },
    ]
    const result = resampleTrack(track, 25)

    expect(result[0]).toEqual(track[0])
    expect(result[result.length - 1]).toEqual(track[1])
    expect(result).toHaveLength(6) // 0, 25, 50, 75, 100, 111
  })
})

describe('computeModifiedHausdorffDistance', () => {
  it('returns Infinity for tracks with fewer than two points', () => {
    expect(computeModifiedHausdorffDistance([{ latitude: 48, longitude: 11 }], line(10))).toBe(Infinity)
  })

  it('returns ~0 for identical geometry with different point density', () => {
    const dense = line(101, 48.0, 11.0, 0.00001)
    const sparse = line(11, 48.0, 11.0, 0.0001)
    expect(computeModifiedHausdorffDistance(dense, sparse)).toBeLessThan(1)
  })

  it('returns the lateral offset for parallel tracks', () => {
    // 0.0005° longitude at 48° latitude ≈ 37 m
    const a = line(20)
    const b = line(20, 48.0, 11.0005)
    const mhd = computeModifiedHausdorffDistance(a, b)
    expect(mhd).toBeGreaterThan(35)
    expect(mhd).toBeLessThan(40)
  })

  it('is large when one track only covers part of the other', () => {
    // ~2.2 km vs. ~110 m of the same line
    const long = line(200)
    const short = line(10)
    expect(computeModifiedHausdorffDistance(long, short)).toBeGreaterThan(500)
  })

  it('returns Infinity when the distance exceeds maxDistanceMeter', () => {
    const a = line(20)
    const b = line(20, 48.0, 11.0005) // ~37 m apart
    expect(computeModifiedHausdorffDistance(a, b, { maxDistanceMeter: 30 })).toBe(Infinity)
    expect(computeModifiedHausdorffDistance(a, b, { maxDistanceMeter: 40 })).toBeCloseTo(
      computeModifiedHausdorffDistance(a, b),
      6,
    )
  })

  it('stays close to the fine result with a coarse sample spacing', () => {
    const tracks = join(__dirname, '../../tracks')
    const ride = parseGpx(readFileSync(join(tracks, 'Timmelsjoch-Fahrt.gpx'), 'utf8'))
    const route = parseGpx(readFileSync(join(tracks, 'Timmelsjoch-Route.gpx'), 'utf8'))

    const fine = computeModifiedHausdorffDistance(ride, route)
    const coarse = computeModifiedHausdorffDistance(ride, route, { sampleSpacingMeter: 200 })
    expect(Math.abs(coarse - fine)).toBeLessThan(50)
  })

  it('matches a recorded ride with the planned Strava route (Timmelsjoch)', () => {
    const tracks = join(__dirname, '../../tracks')
    const ride = parseGpx(readFileSync(join(tracks, 'Timmelsjoch-Fahrt.gpx'), 'utf8'))
    const route = parseGpx(readFileSync(join(tracks, 'Timmelsjoch-Route.gpx'), 'utf8'))

    expect(computeModifiedHausdorffDistance(ride, route)).toBeLessThan(50)
  })
})
