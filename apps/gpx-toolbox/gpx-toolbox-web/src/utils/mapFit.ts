import L from 'leaflet'

/** Zoom the map so the whole search circle is visible */
export function fitSearchArea(map: L.Map, lat: number, lng: number, radiusKm: number) {
  map.fitBounds(L.latLng(lat, lng).toBounds(radiusKm * 2 * 1000), { padding: [16, 16] })
}

/** Maximum width (in meters) the map should show when fitting a route */
const MAX_ROUTE_WIDTH_M = 10000

/** Zoom the map to fit a route's polyline, with a max width of 10km */
export function fitRouteToMap(map: L.Map, polyline: Array<{ lat: number; lng: number }>) {
  if (polyline.length < 2) {
    // Single point: center on it
    map.setView([polyline[0].lat, polyline[0].lng], 15)
    return
  }

  const bounds = L.latLngBounds(polyline.map((p) => [p.lat, p.lng] as [number, number]))
  // Calculate the width of the bounds in meters at the center latitude
  const centerLat = bounds.getCenter().lat
  const lngDiff = bounds.getWest() - bounds.getEast()
  // Approximate meters per degree of longitude at this latitude
  const metersPerDegreeLng = 111320 * Math.cos((centerLat * Math.PI) / 180)
  const widthM = Math.abs(lngDiff) * metersPerDegreeLng

  if (widthM <= MAX_ROUTE_WIDTH_M) {
    // Route fits within 10km width — show the whole thing
    map.fitBounds(bounds, { padding: [48, 48] })
  } else {
    // Route is too wide — center on the start point
    map.setView([polyline[0].lat, polyline[0].lng], 15)
  }
}
