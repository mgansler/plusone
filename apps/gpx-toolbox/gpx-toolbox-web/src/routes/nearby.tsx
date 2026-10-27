import { type RefObject, useEffect, useRef, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import L from 'leaflet'

import { useFindNearbyRoutes, useGetRoute } from '@plusone/gpx-toolbox-api-client'

import { Map } from '../components/Map'
import { formatElevation } from '../utils/format'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type NearbyRoute = {
  id: string
  name: string
  distance: number
  distanceKm: string
  status: string
  source: string
  stats: Record<string, unknown> | null
}

const sourceColors: Record<string, string> = {
  manualImport: '#2196f3',
  stravaRoute: '#4caf50',
  stravaActivity: '#ff9800',
}

const statusColors: Record<string, string> = {
  planned: '#9c27b0',
  ridden: '#4caf50',
  'found-online': '#ff5722',
}

/**
 * Resolve a place name to coordinates via the free, CORS-enabled Open-Meteo
 * geocoding API (the same provider the project already uses for weather).
 */
async function geocodePlace(place: string): Promise<{ lat: number; lng: number; label: string } | null> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=1&language=de&format=json`
  const res = await fetch(url)
  if (!res.ok) return null
  const json = (await res.json()) as {
    results?: Array<{ name: string; latitude: number; longitude: number; admin1?: string; country?: string }>
  }
  const first = json.results?.[0]
  if (!first) return null
  const label = [first.name, first.admin1, first.country].filter(Boolean).join(', ')
  return { lat: first.latitude, lng: first.longitude, label }
}

export const Route = createFileRoute('/nearby')({
  component: NearbySearch,
})

function NearbySearch() {
  const mapRef: RefObject<L.Map | null> = useRef(null)
  const [map, setMap] = useState<L.Map | null>(null)
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [radius, setRadius] = useState<number>(50)
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null)
  const [usingGPS, setUsingGPS] = useState(false)

  // Place-name search
  const [place, setPlace] = useState('')
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  // Leaflet layers for the search center (kept across renders, updated in place)
  const markerRef = useRef<L.Marker | null>(null)
  const circleRef = useRef<L.Circle | null>(null)

  const {
    data: results,
    isLoading: loading,
    error,
    isError,
  } = useFindNearbyRoutes({ lat: lat ?? 0, lng: lng ?? 0, radius }, { query: { enabled: lat != null && lng != null } })

  // Fetch the selected route so its polyline can be drawn on the map.
  // Disabled while nothing is selected (empty id would otherwise fire the query).
  const { data: selectedRouteDetail } = useGetRoute(selectedRoute ?? '', {
    query: { enabled: selectedRoute != null },
  })

  // Recenter the map only when the user explicitly picks a location
  // (GPS / place / typed coordinates) — not when they click/drag the map,
  // where the view is already where they want it.
  function centerOn(nextLat: number, nextLng: number, zoom = 12) {
    mapRef.current?.setView([nextLat, nextLng], zoom)
  }

  // Create the draggable center marker + radius circle once the map is ready,
  // and let a click anywhere on the map move the search center there.
  useEffect(() => {
    if (!map) return

    // The map DOM container may not be in the document yet when this effect
    // runs (onMapReady fires during the same render cycle). Defer to the
    // next macrotask so the browser has committed the layout first.
    const initLat = lat ?? 48.77
    const initLng = lng ?? 9.16
    let onMapClick: ((e: L.LeafletMouseEvent) => void) | null = null

    setTimeout(() => {
      if (!map) return

      if (!markerRef.current) {
        const marker = L.marker([initLat, initLng], { draggable: true, title: 'Suchzentrum' }).addTo(map)
        marker.on('dragend', () => {
          const p = marker.getLatLng()
          setLat(p.lat)
          setLng(p.lng)
        })
        markerRef.current = marker
      }

      if (!circleRef.current) {
        circleRef.current = L.circle([initLat, initLng], {
          radius: radius * 1000,
          color: '#2196f3',
          weight: 2,
          fillColor: '#2196f3',
          fillOpacity: 0.08,
        }).addTo(map)
      }

      onMapClick = (e: L.LeafletMouseEvent) => {
        setLat(e.latlng.lat)
        setLng(e.latlng.lng)
      }
      map.on('click', onMapClick)
    }, 50)

    return () => {
      onMapClick && map.off('click', onMapClick)
    }
    // Only (re)create the layers when the map is first available.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])

  // Keep the marker + circle in sync with the current search center / radius.
  useEffect(() => {
    if (lat == null || lng == null) return
    markerRef.current?.setLatLng([lat, lng])
    circleRef.current?.setLatLng([lat, lng]).setRadius(radius * 1000)
  }, [lat, lng, radius])

  // Draw the selected route's track as an overlay — without moving the map.
  useEffect(() => {
    if (!map) return
    // The generated type says string[], but the backend returns Array<{lat,lng}>
    // (from parsePolyline). Route through unknown to satisfy the cast.
    const polyline = (selectedRouteDetail?.polyline ?? []) as unknown as Array<{ lat: number; lng: number }>
    if (polyline.length < 2) return

    const layer = L.layerGroup()
    L.polyline(
      polyline.map((p) => [p.lat, p.lng] as [number, number]),
      { color: '#e11d48', weight: 4, opacity: 0.95 },
    ).addTo(layer)
    layer.addTo(map)

    return () => {
      layer.remove()
    }
  }, [map, selectedRouteDetail])

  async function handleGeocode() {
    if (!place.trim()) return
    setGeoLoading(true)
    setGeoError(null)
    try {
      const result = await geocodePlace(place)
      if (!result) {
        setGeoError(`Ort „${place}" nicht gefunden`)
        return
      }
      setLat(result.lat)
      setLng(result.lng)
      centerOn(result.lat, result.lng, 13)
    } catch {
      setGeoError('Ort konnte nicht aufgelöst werden')
    } finally {
      setGeoLoading(false)
    }
  }

  const center: [number, number] | undefined = lat != null && lng != null ? [lat, lng] : undefined

  // Unified formatter for elevation stats: rounds to integer, appends 'm'.
  const formatElev = (val: number | undefined): string => (val != null ? formatElevation(val) : '-')

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <h2 style={styles.heading}>Routen in der Nähe</h2>

        {/* Place search */}
        <div style={styles.section}>
          <label style={styles.label}>Ort suchen</label>
          <div style={styles.placeRow}>
            <input
              type="text"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleGeocode()
              }}
              style={styles.input}
              placeholder="z. B. Ulm, Schwäbische Alb"
            />
            <button onClick={() => void handleGeocode()} style={styles.searchButton} disabled={geoLoading}>
              {geoLoading ? '…' : 'Suchen'}
            </button>
          </div>
          {geoError && <div style={styles.geoError}>{geoError}</div>}
          <div style={styles.hint}>Tipp: auf die Karte klicken oder den Marker ziehen, um den Suchort zu setzen.</div>
        </div>

        {/* Location input */}
        <div style={styles.section}>
          <label style={styles.label}>Breitengrad (lat)</label>
          <input
            type="number"
            step="0.0001"
            value={lat ?? ''}
            onChange={(e) => setLat(parseFloat(e.target.value) || null)}
            onBlur={() => {
              if (lat != null && lng != null) centerOn(lat, lng)
            }}
            style={styles.input}
            placeholder="48.77"
          />
          <label style={styles.label}>Längengrad (lng)</label>
          <input
            type="number"
            step="0.0001"
            value={lng ?? ''}
            onChange={(e) => setLng(parseFloat(e.target.value) || null)}
            onBlur={() => {
              if (lat != null && lng != null) centerOn(lat, lng)
            }}
            style={styles.input}
            placeholder="9.16"
          />
          <button
            onClick={() => {
              if (!navigator.geolocation) return
              setUsingGPS(true)
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  setLat(pos.coords.latitude)
                  setLng(pos.coords.longitude)
                  centerOn(pos.coords.latitude, pos.coords.longitude, 15)
                  setUsingGPS(false)
                },
                () => setUsingGPS(false),
                { enableHighAccuracy: true, timeout: 10000 },
              )
            }}
            style={styles.gpsButton}
            disabled={usingGPS}
          >
            {usingGPS ? 'GPS...' : 'GPS-Position'}
          </button>
        </div>

        {/* Radius slider */}
        <div style={styles.section}>
          <label style={styles.label}>Radius: {radius} km</label>
          <input
            type="range"
            min={5}
            max={200}
            step={5}
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            style={styles.range}
          />
        </div>

        {/* Error */}
        {isError && <div style={styles.error}>{error instanceof Error ? error.message : 'Unbekannter Fehler'}</div>}

        {/* Loading */}
        {loading && <div style={styles.loading}>Suche...</div>}

        {/* Results */}
        {results && results.length > 0 && (
          <div style={styles.results}>
            <h3 style={styles.resultCount}>{results.length} Routen gefunden</h3>
            {results.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedRoute(selectedRoute === r.id ? null : r.id)}
                style={{
                  ...styles.resultCard,
                  backgroundColor: selectedRoute === r.id ? '#e3f2fd' : '#fff',
                }}
              >
                <div style={styles.resultName}>{r.name}</div>
                <div style={styles.resultDistance}>{r.distanceKm} km</div>
                <div style={styles.resultMeta}>
                  <span
                    style={{
                      ...styles.badge,
                      backgroundColor: sourceColors[r.source] || '#9e9e9e',
                    }}
                  >
                    {r.source}
                  </span>
                  <span
                    style={{
                      ...styles.badge,
                      backgroundColor: statusColors[r.status] || '#9e9e9e',
                    }}
                  >
                    {r.status}
                  </span>
                </div>
                {selectedRoute === r.id && r.stats && (
                  <div style={styles.resultStats}>
                    <div>
                      Strecke:{' '}
                      {(() => {
                        const distance = (r.stats as { distance?: number })?.distance
                        return distance ? `${(distance / 1000).toFixed(1)} km` : '-'
                      })()}
                    </div>
                    <div>Höhenmeter ↑: {formatElev((r.stats as { elevationGain?: number })?.elevationGain)}</div>
                    <div>Abstieg ↓: {formatElev((r.stats as { elevationLoss?: number })?.elevationLoss)}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div style={styles.mapArea}>
        <Map mapRef={mapRef} onMapReady={setMap} center={center} />
        {lat != null && lng != null && (
          <div style={styles.centerMarker}>
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    height: 'calc(100vh - 48px)',
    width: '100%',
  } as const,
  sidebar: {
    width: 360,
    flexShrink: 0,
    overflowY: 'auto',
    borderRight: '1px solid #e0e0e0',
    padding: 16,
    backgroundColor: '#fafafa',
  } as const,
  mapArea: {
    flex: 1,
    position: 'relative',
    minWidth: 0,
  } as const,
  heading: {
    margin: '0 0 16px',
    fontSize: 20,
    fontWeight: 600,
  } as const,
  section: {
    marginBottom: 16,
  } as const,
  label: {
    display: 'block',
    marginBottom: 4,
    fontSize: 13,
    fontWeight: 500,
    color: '#555',
  } as const,
  input: {
    width: '100%',
    padding: '8px 12px',
    fontSize: 14,
    border: '1px solid #ccc',
    borderRadius: 4,
    marginBottom: 8,
    boxSizing: 'border-box',
  } as const,
  placeRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'flex-start',
  } as const,
  searchButton: {
    flexShrink: 0,
    padding: '8px 14px',
    fontSize: 14,
    fontWeight: 500,
    backgroundColor: '#2196f3',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    marginBottom: 8,
  } as const,
  hint: {
    fontSize: 12,
    color: '#888',
    marginTop: -4,
    marginBottom: 4,
  } as const,
  geoError: {
    padding: '6px 10px',
    backgroundColor: '#fff3e0',
    color: '#e65100',
    borderRadius: 4,
    marginBottom: 8,
    fontSize: 13,
  } as const,
  range: {
    width: '100%',
  } as const,
  gpsButton: {
    width: '100%',
    padding: '10px 16px',
    fontSize: 14,
    fontWeight: 500,
    backgroundColor: '#2196f3',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    marginTop: 8,
  } as const,
  error: {
    padding: '8px 12px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: 4,
    marginBottom: 16,
    fontSize: 13,
  } as const,
  loading: {
    padding: 16,
    textAlign: 'center',
    color: '#666',
  } as const,
  results: {
    marginTop: 16,
  } as const,
  resultCount: {
    fontSize: 14,
    fontWeight: 500,
    color: '#666',
    margin: '0 0 8px',
  } as const,
  resultCard: {
    padding: '12px',
    marginBottom: 8,
    borderRadius: 6,
    cursor: 'pointer',
    border: '1px solid #e0e0e0',
    transition: 'background-color 0.15s',
  } as const,
  resultName: {
    fontWeight: 600,
    fontSize: 14,
    marginBottom: 4,
  } as const,
  resultDistance: {
    fontSize: 18,
    fontWeight: 700,
    color: '#2196f3',
    marginBottom: 4,
  } as const,
  resultMeta: {
    display: 'flex',
    gap: 6,
  } as const,
  badge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 10,
    fontSize: 11,
    color: '#fff',
    fontWeight: 500,
    marginRight: 4,
  } as const,
  resultStats: {
    marginTop: 8,
    fontSize: 12,
    color: '#555',
    borderTop: '1px solid #e0e0e0',
    paddingTop: 8,
  } as const,
  centerMarker: {
    position: 'absolute',
    bottom: 16,
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: '8px 16px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    zIndex: 1000,
  } as const,
}
