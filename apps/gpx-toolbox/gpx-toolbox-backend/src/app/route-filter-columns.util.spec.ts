import { routeFilterColumns } from './route-filter-columns.util'

describe('routeFilterColumns', () => {
  it('returns distance, elevation gain and bounding box', () => {
    const columns = routeFilterColumns(
      [
        { lat: 48.0, lng: 11.2 },
        { lat: 48.1, lng: 11.0 },
      ],
      { distance: 12_000, elevationGain: 350 },
    )
    expect(columns).toEqual({
      distance: 12_000,
      elevationGain: 350,
      minLat: 48.0,
      maxLat: 48.1,
      minLng: 11.0,
      maxLng: 11.2,
    })
  })

  it('returns nulls for an empty polyline so the route never becomes a match candidate', () => {
    expect(routeFilterColumns([], { distance: 0, elevationGain: 0 })).toEqual({
      distance: null,
      elevationGain: null,
      minLat: null,
      maxLat: null,
      minLng: null,
      maxLng: null,
    })
  })
})
