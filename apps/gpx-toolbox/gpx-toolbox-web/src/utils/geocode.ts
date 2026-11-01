export type GeocodeResult = { id: number; lat: number; lng: number; label: string }

/**
 * Resolve a place name to candidate coordinates via the free, CORS-enabled Open-Meteo
 * geocoding API (the same provider the project already uses for weather).
 * Returns up to `count` matches, most relevant first; empty if nothing was found.
 */
export async function geocodePlace(place: string, count = 8): Promise<Array<GeocodeResult>> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=${count}&language=de&format=json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Geocoding failed: ${res.status}`)
  const json = (await res.json()) as {
    results?: Array<{
      id: number
      name: string
      latitude: number
      longitude: number
      admin1?: string
      admin2?: string
      country?: string
    }>
  }
  return (json.results ?? []).map((r) => ({
    id: r.id,
    lat: r.latitude,
    lng: r.longitude,
    // admin2 (district) helps telling apart places with the same name in one state
    label: [r.name, r.admin2, r.admin1, r.country].filter(Boolean).join(', '),
  }))
}
