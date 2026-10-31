import { downsamplePolyline, parsePolyline } from './polyline.util'

describe('parsePolyline', () => {
  it('returns a plain array of points unchanged', () => {
    const points = [
      { lat: 48.0, lng: 11.0 },
      { lat: 48.1, lng: 11.1 },
    ]

    expect(parsePolyline(points)).toEqual(points)
  })

  it('parses a JSON string (legacy / test data)', () => {
    const points = [
      { lat: 48.0, lng: 11.0 },
      { lat: 48.1, lng: 11.1 },
    ]

    expect(parsePolyline(JSON.stringify(points))).toEqual(points)
  })

  it('parses the { points: string } shape (current write path)', () => {
    const points = [
      { lat: 48.0, lng: 11.0 },
      { lat: 48.1, lng: 11.1 },
    ]

    expect(parsePolyline({ points: JSON.stringify(points) })).toEqual(points)
  })

  it('accepts { points: array }', () => {
    const points = [{ lat: 48.0, lng: 11.0 }]

    expect(parsePolyline({ points })).toEqual(points)
  })

  it('returns an empty array for a JSON string that is not an array', () => {
    expect(parsePolyline('{"not":"array"}')).toEqual([])
  })

  it('returns an empty array for invalid JSON', () => {
    expect(parsePolyline('not json')).toEqual([])
    expect(parsePolyline({ points: 'not json' })).toEqual([])
  })

  it('returns an empty array for null, undefined or a bare object', () => {
    expect(parsePolyline(null)).toEqual([])
    expect(parsePolyline(undefined)).toEqual([])
    expect(parsePolyline({ foo: 'bar' })).toEqual([])
  })
})

describe('downsamplePolyline', () => {
  const points = Array.from({ length: 101 }, (_, i) => ({ lat: 48 + i / 1000, lng: 11 }))

  it('returns short polylines unchanged', () => {
    expect(downsamplePolyline(points.slice(0, 5), 10)).toEqual(points.slice(0, 5))
  })

  it('reduces long polylines to maxPoints, keeping first and last point', () => {
    const result = downsamplePolyline(points, 11)

    expect(result).toHaveLength(11)
    expect(result[0]).toEqual(points[0])
    expect(result[10]).toEqual(points[100])
    expect(result[5]).toEqual(points[50])
  })
})
