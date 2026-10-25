import { type RefObject, useEffect, useRef, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type L from 'leaflet'

import { useFindNearbyRoutes } from '@plusone/gpx-toolbox-api-client'

import { Map } from '../components/Map'

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

export const Route = createFileRoute('/nearby')({
  component: NearbySearch,
})

function NearbySearch() {
  const mapRef: RefObject<L.Map | null> = useRef(null)
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [radius, setRadius] = useState<number>(50)
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null)
  const [usingGPS, setUsingGPS] = useState(false)

  const {
    data: results,
    isLoading: loading,
    error,
    isError,
  } = useFindNearbyRoutes({ lat: lat ?? 0, lng: lng ?? 0, radius }, { query: { enabled: lat != null && lng != null } })

  // Fly to location when GPS acquired
  useEffect(() => {
    if (lat != null && lng != null && mapRef.current) {
      mapRef.current.flyTo([lat, lng], 12)
    }
  }, [lat, lng])

  const center: [number, number] | undefined = lat != null && lng != null ? [lat, lng] : undefined

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <h2 style={styles.heading}>Routen in der Nähe</h2>

        {/* Location input */}
        <div style={styles.section}>
          <label style={styles.label}>Breitengrad (lat)</label>
          <input
            type="number"
            step="0.0001"
            value={lat ?? ''}
            onChange={(e) => setLat(parseFloat(e.target.value) || null)}
            style={styles.input}
            placeholder="48.77"
          />
          <label style={styles.label}>Längengrad (lng)</label>
          <input
            type="number"
            step="0.0001"
            value={lng ?? ''}
            onChange={(e) => setLng(parseFloat(e.target.value) || null)}
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
                    <div>Höhenmeter ↑: {(r.stats as { elevationGain?: number })?.elevationGain ?? '-'}</div>
                    <div>Höhenmeter ↓: {(r.stats as { elevationLoss?: number })?.elevationLoss ?? '-'}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div style={styles.mapArea}>
        <Map mapRef={mapRef} center={center} />
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
