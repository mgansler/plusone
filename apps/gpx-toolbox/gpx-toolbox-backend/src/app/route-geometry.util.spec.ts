import { routeGeometryColumns } from './route-geometry.util'

describe('routeGeometryColumns', () => {
  it('returns bounding box and distance', () => {
    const columns = routeGeometryColumns(
      [
        { lat: 48.0, lng: 11.2 },
        { lat: 48.1, lng: 11.0 },
      ],
      12_000,
    )
    expect(columns).toEqual({ distance: 12_000, minLat: 48.0, maxLat: 48.1, minLng: 11.0, maxLng: 11.2 })
  })

  it('returns nulls for an empty polyline so the route never becomes a match candidate', () => {
    expect(routeGeometryColumns([], 0)).toEqual({
      distance: null,
      minLat: null,
      maxLat: null,
      minLng: null,
      maxLng: null,
    })
  })
})
