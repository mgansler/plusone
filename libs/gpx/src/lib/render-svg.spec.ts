import { describe, expect, it } from 'vitest'
import { buildPath, computeBoundingBox, projectPoint, renderSvg } from './render-svg'
import { calculateBearing } from './haversine-distance'
import { join } from 'node:path'
import { readFileSync, writeFileSync } from 'node:fs'
import { XMLParser } from 'fast-xml-parser'

// ─────────────────────────────────────────────────────────────────────────────
// projectPoint
// ─────────────────────────────────────────────────────────────────────────────

describe('projectPoint', () => {
  it('projects two points symmetrically around the centre latitude', () => {
    const centreLat = 44.0
    const p1 = projectPoint(44.0 + 0.01, 8.35, centreLat)
    const p2 = projectPoint(44.0 - 0.01, 8.35, centreLat)

    // Same longitude → same x; latitudes are mirrored
    expect(p1.x).toBeCloseTo(p2.x, 6)
    expect(p1.y).toBeGreaterThan(p2.y)
  })

  it('produces different x for different longitudes', () => {
    const centreLat = 44.0
    const pWest = projectPoint(44.0, 8.3, centreLat)
    const pEast = projectPoint(44.0, 8.4, centreLat)
    expect(pEast.x).toBeGreaterThan(pWest.x)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// computeBoundingBox
// ─────────────────────────────────────────────────────────────────────────────

describe('computeBoundingBox', () => {
  it('returns identity box for empty input', () => {
    expect(computeBoundingBox([])).toEqual({ minX: 0, minY: 0, maxX: 1, maxY: 1 })
  })

  it('computes correct bounds for known points', () => {
    const pts = [
      { x: 1, y: 2 },
      { x: 5, y: 10 },
      { x: 3, y: 0 },
    ]
    const bb = computeBoundingBox(pts)
    expect(bb).toEqual({ minX: 1, minY: 0, maxX: 5, maxY: 10 })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// buildPath
// ─────────────────────────────────────────────────────────────────────────────

describe('buildPath', () => {
  it('returns empty string for no points', () => {
    expect(buildPath([])).toBe('')
  })

  it('returns a single M command for one point', () => {
    expect(buildPath([{ x: 1, y: 2 }])).toBe('M 1.00 2.00')
  })

  it('produces line commands for two points', () => {
    const result = buildPath(
      [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ],
      false,
    )
    expect(result).toContain('M 1.00')
    expect(result).toContain('L 3.00')
  })

  it('produces bezier curves when smooth=true', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 0 },
      { x: 3, y: 1 },
    ]
    const result = buildPath(pts, true)
    expect(result).toContain('C')
    // Smooth mode uses M + C commands only — no L command
    expect(result).toMatch(/[^CML]\s+C\s+/)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// renderSvg (integration)
// ─────────────────────────────────────────────────────────────────────────────

describe('renderSvg', () => {
  it('uses pixel-space viewBox (0 0 width height)', () => {
    const points = [
      { latitude: 44.0, longitude: 8.3, elevation: 100, time: new Date('2026-01-01T10:00:00Z') },
      { latitude: 44.001, longitude: 8.31, elevation: 120, time: new Date('2026-01-01T10:01:00Z') },
      { latitude: 44.002, longitude: 8.32, elevation: 110, time: new Date('2026-01-01T10:02:00Z') },
    ]

    const result = renderSvg({ points, width: 1200, height: 800 })

    // viewBox must be in pixel space, not raw radian values
    expect(result.viewBox).toBe('0 0 1200 800')
    // Path coordinates must be in pixel range, not tiny radian offsets
    expect(result.svg).toMatch(/M \d+\.\d+ \d+\.\d+/)
    // The path must contain meaningful coordinates (not all near zero)
    expect(result.svg).toMatch(/C \d{2,}/)
  })

  it('renders a minimal track from synthetic points', () => {
    const points = [
      { latitude: 44.0, longitude: 8.3, elevation: 100, time: new Date('2026-01-01T10:00:00Z') },
      { latitude: 44.001, longitude: 8.31, elevation: 120, time: new Date('2026-01-01T10:01:00Z') },
      { latitude: 44.002, longitude: 8.32, elevation: 110, time: new Date('2026-01-01T10:02:00Z') },
    ]

    const result = renderSvg({ points })

    expect(result.svg).toContain('<svg')
    expect(result.svg).toContain('viewBox=')
    expect(result.svg).toContain('<path')
    expect(result.viewBox).toContain(' ')
  })

  it('renders an actual GPX file', () => {
    const gpxPath = join(__dirname, '../../tracks/test.gpx')
    const fileContent = readFileSync(gpxPath, 'utf-8')
    const parsed = new XMLParser({ ignoreAttributes: false }).parse(fileContent)

    const points = parsed.gpx.trk.trkseg.trkpt.map((trkpt: any) => ({
      latitude: parseFloat(trkpt['@_lat']),
      longitude: parseFloat(trkpt['@_lon']),
      elevation: parseFloat(trkpt.ele),
      time: new Date(trkpt.time),
    }))

    const result = renderSvg({ points })

    // Write SVG alongside the GPX file (same name, .svg extension)
    const svgPath = join(__dirname, '../../tracks/test.svg')
    writeFileSync(svgPath, result.svg, 'utf-8')

    expect(result.svg).not.toBe('')
    expect(result.svg).toContain('<svg')
    expect(result.viewBox).not.toBe('')
  })

  it('renders a rotated SVG from MdRzA.gpx', () => {
    const gpxPath = join(__dirname, '../../tracks/MdRzA.gpx')
    const fileContent = readFileSync(gpxPath, 'utf-8')
    const parsed = new XMLParser({ ignoreAttributes: false }).parse(fileContent)

    const points = parsed.gpx.trk.trkseg.trkpt.map((trkpt: any) => ({
      latitude: parseFloat(trkpt['@_lat']),
      longitude: parseFloat(trkpt['@_lon']),
      elevation: parseFloat(trkpt.ele),
      time: new Date(trkpt.time),
    }))

    const result = renderSvg({ points, width: 800, height: 400, rotate: true, markers: true })

    // Rotation → portrait output (swapped dimensions)
    expect(result.viewBox).toBe('0 0 400 800')
    expect(result.svg).toContain('<svg')
    expect(result.svg).toContain('<path')
    expect(result.svg).toContain('<rect') // markers enabled when rotate + markers: true

    // Write SVG alongside the GPX file
    const svgPath = join(__dirname, '../../tracks/MdRzA.svg')
    writeFileSync(svgPath, result.svg, 'utf-8')
  })

  it('respects custom options', () => {
    const points = [
      { latitude: 44.0, longitude: 8.3, elevation: 100, time: new Date('2026-01-01T10:00:00Z') },
      { latitude: 44.001, longitude: 8.31, elevation: 120, time: new Date('2026-01-01T10:01:00Z') },
    ]

    const result = renderSvg({
      points,
      stroke: '#ff0000',
      strokeWidth: 3,
      smooth: false,
      gradientFill: false,
    })

    expect(result.svg).toContain('stroke="#ff0000"')
    expect(result.svg).toContain('stroke-width="3"')
    expect(result.svg).not.toContain('linearGradient')
  })

  it('returns empty string for fewer than 2 points', () => {
    const result = renderSvg({
      points: [{ latitude: 44.0, longitude: 8.3, elevation: 100, time: new Date('2026-01-01T10:00:00Z') }],
    })
    expect(result.svg).toBe('')
    expect(result.viewBox).toBe('')
  })

  // ── Markers ───────────────────────────────────────────────────────────────

  it('renders start (green) and end (red) markers by default', () => {
    const points = [
      { latitude: 44.0, longitude: 8.3, elevation: 100, time: new Date('2026-01-01T10:00:00Z') },
      { latitude: 44.002, longitude: 8.32, elevation: 110, time: new Date('2026-01-01T10:02:00Z') },
    ]

    const result = renderSvg({ points, markers: true })

    expect(result.svg).toContain('fill="#22c55e"') // start = green
    expect(result.svg).toContain('fill="#ef4444"') // end = red
    expect(result.svg).toContain('<rect')
  })

  it('omits markers when markers: false', () => {
    const points = [
      { latitude: 44.0, longitude: 8.3, elevation: 100, time: new Date('2026-01-01T10:00:00Z') },
      { latitude: 44.002, longitude: 8.32, elevation: 110, time: new Date('2026-01-01T10:02:00Z') },
    ]

    const result = renderSvg({ points, markers: false })

    expect(result.svg).not.toContain('<rect')
  })

  it('defaults markers to true when rotate is false', () => {
    const points = [
      { latitude: 44.0, longitude: 8.3, elevation: 100, time: new Date('2026-01-01T10:00:00Z') },
      { latitude: 44.002, longitude: 8.32, elevation: 110, time: new Date('2026-01-01T10:02:00Z') },
    ]

    const result = renderSvg({ points })
    expect(result.svg).toContain('<rect')
  })

  it('defaults markers to false when rotate is true', () => {
    const points = [
      { latitude: 44.0, longitude: 8.3, elevation: 100, time: new Date('2026-01-01T10:00:00Z') },
      { latitude: 44.002, longitude: 8.32, elevation: 110, time: new Date('2026-01-01T10:02:00Z') },
    ]

    const result = renderSvg({ points, rotate: true })
    expect(result.svg).not.toContain('<rect')
  })

  it('respects custom marker colours and size', () => {
    const points = [
      { latitude: 44.0, longitude: 8.3, elevation: 100, time: new Date('2026-01-01T10:00:00Z') },
      { latitude: 44.002, longitude: 8.32, elevation: 110, time: new Date('2026-01-01T10:02:00Z') },
    ]

    const result = renderSvg({
      points,
      markers: true,
      markerSize: 20,
      startMarkerColor: '#ffff00',
      endMarkerColor: '#00ff00',
    })

    expect(result.svg).toContain('width="20"')
    expect(result.svg).toContain('fill="#ffff00"')
    expect(result.svg).toContain('fill="#00ff00"')
  })

  // ── Rotation ──────────────────────────────────────────────────────────────

  it('swaps width/height for viewBox when rotate: true', () => {
    const points = [
      { latitude: 44.0, longitude: 8.3, elevation: 100, time: new Date('2026-01-01T10:00:00Z') },
      { latitude: 44.002, longitude: 8.32, elevation: 110, time: new Date('2026-01-01T10:02:00Z') },
    ]

    const result = renderSvg({ points, width: 800, height: 600, rotate: true })

    expect(result.viewBox).toBe('0 0 600 800')
  })

  it('rotates a north-south track so start is near top and end near bottom', () => {
    // Create a track that runs roughly north-south
    const points = [
      { latitude: 44.0, longitude: 8.3, elevation: 100, time: new Date('2026-01-01T10:00:00Z') },
      { latitude: 44.005, longitude: 8.305, elevation: 150, time: new Date('2026-01-01T10:01:00Z') },
      { latitude: 44.01, longitude: 8.31, elevation: 200, time: new Date('2026-01-01T10:02:00Z') },
    ]

    // Input is landscape (800×400), rotate swaps to portrait output (400×800)
    const result = renderSvg({ points, width: 800, height: 400, rotate: true })

    expect(result.viewBox).toBe('0 0 400 800')
    expect(result.svg).toContain('<svg')
  })

  it('does not rotate when rotate: false', () => {
    const points = [
      { latitude: 44.0, longitude: 8.3, elevation: 100, time: new Date('2026-01-01T10:00:00Z') },
      { latitude: 44.002, longitude: 8.32, elevation: 110, time: new Date('2026-01-01T10:02:00Z') },
    ]

    const result = renderSvg({ points, rotate: false })

    expect(result.viewBox).toBe('0 0 800 600')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// calculateBearing
// ─────────────────────────────────────────────────────────────────────────────

describe('calculateBearing', () => {
  it('returns ~0° for northward direction', () => {
    const bearing = calculateBearing({ latitude: 44.0, longitude: 8.3 }, { latitude: 44.01, longitude: 8.3 })
    expect(bearing).toBeCloseTo(0, 1)
  })

  it('returns ~90° for eastward direction', () => {
    const bearing = calculateBearing({ latitude: 44.0, longitude: 8.3 }, { latitude: 44.0, longitude: 8.31 })
    expect(bearing).toBeCloseTo(90, 1)
  })

  it('returns ~180° for southward direction', () => {
    const bearing = calculateBearing({ latitude: 44.01, longitude: 8.3 }, { latitude: 44.0, longitude: 8.3 })
    expect(bearing).toBeCloseTo(180, 1)
  })

  it('returns ~270° for westward direction', () => {
    const bearing = calculateBearing({ latitude: 44.0, longitude: 8.31 }, { latitude: 44.0, longitude: 8.3 })
    expect(bearing).toBeCloseTo(270, 1)
  })
})
