import { parsePolyline } from './polyline.util'

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
