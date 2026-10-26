import { parseGpx } from './gpx-parser'
import { serializeGpx } from './gpx-serializer'
import { type TrackPoint } from './types'

describe('serializeGpx', () => {
  it('produces XML starting with the XML declaration', () => {
    const gpx = serializeGpx([])
    expect(gpx.startsWith('<?xml')).toBe(true)
    expect(gpx).toContain('<gpx')
    expect(gpx).toContain('</gpx>')
  })

  it('emits trkpt elements with ele and time', () => {
    const gpx = serializeGpx([
      { latitude: 48.0, longitude: 11.0, elevation: 100, time: new Date('2024-01-01T10:00:00Z') },
    ])
    expect(gpx).toContain('<trkpt lat="48" lon="11">')
    expect(gpx).toContain('<ele>100</ele>')
    expect(gpx).toContain('<time>2024-01-01T10:00:00.000Z</time>')
  })

  it('includes hr/cad in a gpxtpx extension only when present', () => {
    const gpx = serializeGpx([
      { latitude: 1, longitude: 2, elevation: 0, time: new Date('2024-01-01T10:00:00Z'), hr: 150, cad: 90 },
    ])
    expect(gpx).toContain('<gpxtpx:hr>150</gpxtpx:hr>')
    expect(gpx).toContain('<gpxtpx:cad>90</gpxtpx:cad>')

    // No extensions block when neither hr nor cad is present
    const plain = serializeGpx([{ latitude: 1, longitude: 2, elevation: 0, time: new Date() }])
    expect(plain).not.toContain('<extensions>')
  })

  it('escapes XML special characters in the track name', () => {
    const gpx = serializeGpx([{ latitude: 1, longitude: 2, elevation: 0, time: new Date() }], 'A & B <C>')
    expect(gpx).toContain('<name>A &amp; B &lt;C&gt;</name>')
  })

  it('round-trips through parseGpx', () => {
    const points: TrackPoint[] = [
      { latitude: 48.0, longitude: 11.0, elevation: 100, time: new Date('2024-01-01T10:00:00Z'), hr: 150, cad: 90 },
      { latitude: 48.001, longitude: 11.001, elevation: 120, time: new Date('2024-01-01T10:02:00Z'), hr: 160 },
    ]
    const parsed = parseGpx(serializeGpx(points))

    expect(parsed).toHaveLength(2)
    expect(parsed[0]).toEqual({
      latitude: 48.0,
      longitude: 11.0,
      elevation: 100,
      time: new Date('2024-01-01T10:00:00Z'),
      hr: 150,
      cad: 90,
    })
    expect(parsed[1].hr).toBe(160)
    expect(parsed[1].cad).toBeUndefined()
  })
})
