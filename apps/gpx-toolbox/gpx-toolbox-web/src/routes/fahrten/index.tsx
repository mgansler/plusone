import { type RefObject, useEffect, useRef, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import L from 'leaflet'

import { calculateHaversineDistance, parseGpx, type TrackPoint } from '@plusone/gpx-toolbox-utils'
import { useListAllFahrten } from '@plusone/gpx-toolbox-api-client'

import { Map } from '../../components/Map'
import { SegmentOverlay } from '../../components/SegmentOverlay'
import { PointDetails } from '../../components/PointDetails'

export const Route = createFileRoute('/fahrten/')({
  component: FahrtenPage,
})

function FahrtenPage() {
  const mapRef: RefObject<L.Map | null> = useRef(null)
  const [page, setPage] = useState(1)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortBy, setSortBy] = useState('riddenAt')
  const [selectedFahrtId, setSelectedFahrtId] = useState<string | null>(null)
  const [selectedPoint, setSelectedPoint] = useState<{ point: TrackPoint; event: L.LeafletMouseEvent } | null>(null)

  const { data, isLoading, error, isError } = useListAllFahrten({
    page,
    limit: 50,
    sortBy,
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
  })

  type FahrtListResponse = {
    items?: Array<{
      id: string
      routeId: string
      riddenAt: string
      duration: number | null
      avgHr: number | null
      maxHr: number | null
      notes: string | null
      route?: { name?: string; status?: string; stats?: { distance?: number } }
    }>
    total?: number
    totalPages?: number
  }

  const fahrten = (data as FahrtListResponse)?.items ?? []
  const totalPages = (data as unknown as FahrtListResponse | undefined)?.totalPages ?? 1
  const total = (data as unknown as FahrtListResponse | undefined)?.total ?? 0

  // Fetch GPX content for selected fahrt's route
  const [gpxText, setGpxText] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedFahrtId) {
      setGpxText(null)
      return
    }
    setGpxText(null)

    const token = localStorage.getItem('gpx-toolbox-jwt')
    if (!token) {
      console.error('[FahrtenPage] No auth token')
      return
    }

    // Find the fahrt to get its routeId
    const fahrt = fahrten.find((f) => f.id === selectedFahrtId)
    if (!fahrt || !fahrt.routeId) return

    fetch(`/api/routes/${fahrt.routeId}/export`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorText = await response.text()
          console.error('[FahrtenPage] HTTP error:', response.status, errorText)
          return
        }
        const text = await response.text()
        setGpxText(text)
      })
      .catch((err) => {
        console.error('[FahrtenPage] Fetch error:', err)
      })
  }, [selectedFahrtId, fahrten])

  const points = gpxText ? parseGpx(gpxText) : []

  function handleFahrtClick(fahrt: (typeof fahrten)[number]) {
    setSelectedFahrtId(fahrt.id)
    setSelectedPoint(null)
  }

  function handlePointClick(point: TrackPoint, event: L.LeafletMouseEvent) {
    setSelectedPoint((prev) => {
      if (prev?.point === point) return null
      return { point, event }
    })
  }

  // Compute totals across all displayed fahrten
  const totalDuration = fahrten.reduce((sum, f) => sum + (f.duration ?? 0), 0)
  const totalDistance = fahrten.reduce((sum, f) => {
    const route = f.route as { stats?: { distance?: number } } | undefined | null
    return sum + (route?.stats?.distance ?? 0)
  }, 0)

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.headingRow}>
          <h2 style={styles.heading}>Fahrten ({total})</h2>
          <Link to="/fahrten/sync" style={styles.syncButton}>
            📥 Sync
          </Link>
        </div>

        {/* Summary */}
        <div style={styles.summary}>
          <div style={styles.summaryItem}>
            <span style={styles.summaryValue}>{formatDuration(totalDuration)}</span>
            <span style={styles.summaryLabel}>Gesamtdauer</span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryValue}>{formatDistance(totalDistance)}</span>
            <span style={styles.summaryLabel}>Distanz</span>
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filters}>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value)
              setPage(1)
            }}
            style={styles.input}
            placeholder="Vom"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value)
              setPage(1)
            }}
            style={styles.input}
            placeholder="Bis"
          />
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value)
              setPage(1)
            }}
            style={styles.select}
          >
            <option value="riddenAt">Neueste zuerst</option>
            <option value="duration">Längste zuerst</option>
          </select>
        </div>

        {/* Error */}
        {isError && <div style={styles.error}>{error instanceof Error ? error.message : 'Unbekannter Fehler'}</div>}

        {/* Loading */}
        {isLoading && <div style={styles.loading}>Lade...</div>}

        {/* Fahrten */}
        {fahrten.length > 0 && (
          <div style={styles.fahrtList}>
            {fahrten.map((f) => {
              const route = f.route as { name?: string; status?: string } | undefined | null
              return (
                <Link
                  key={f.id}
                  to="/fahrten/$fahrtId"
                  params={{ fahrtId: f.id }}
                  onClick={() => handleFahrtClick(f)}
                  style={{
                    ...styles.fahrtCard,
                    backgroundColor: selectedFahrtId === f.id ? '#e3f2fd' : '#fff',
                  }}
                >
                  <div style={styles.fahrtDate}>
                    {new Date(f.riddenAt).toLocaleDateString('de-DE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </div>
                  <div style={styles.fahrtStats}>
                    {f.duration && <span>{formatDuration(f.duration)}</span>}
                    {f.avgHr && <span>Ø HR {f.avgHr}</span>}
                    {f.maxHr && <span>Max HR {f.maxHr}</span>}
                  </div>
                  {route && (
                    <div style={styles.fahrtRoute}>
                      <span style={styles.routeName}>{route.name}</span>
                      {route.status && (
                        <span style={{ ...styles.badge, backgroundColor: statusColors[route.status] || '#9e9e9e' }}>
                          {statusLabels[route.status]}
                        </span>
                      )}
                    </div>
                  )}
                  {f.notes && <div style={styles.fahrtNotes}>{f.notes}</div>}
                </Link>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button disabled={page === 1} onClick={() => setPage(page - 1)} style={styles.pageButton}>
              ←
            </button>
            <span style={styles.pageInfo}>
              {page} / {totalPages}
            </span>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} style={styles.pageButton}>
              →
            </button>
          </div>
        )}
      </div>

      {/* Map */}
      <div style={styles.mapArea}>
        <Map mapRef={mapRef}>
          {points.length > 1 && (
            <SegmentOverlay points={points} mapInstance={mapRef.current!} range={[0, 100]} fitBounds>
              <TrackClickHandler
                points={points}
                range={[0, 100]}
                mapInstance={mapRef.current!}
                onPointClick={handlePointClick}
              />
            </SegmentOverlay>
          )}
        </Map>
      </div>
      {selectedPoint && <PointDetails point={selectedPoint.point} />}
    </div>
  )
}

/** Invisible click handler that maps clicks to the nearest track point */
function TrackClickHandler({
  points,
  range,
  mapInstance,
  onPointClick,
}: {
  points: Array<TrackPoint>
  range: [number, number]
  mapInstance: L.Map
  onPointClick: (point: TrackPoint, event: L.LeafletMouseEvent) => void
}) {
  const layerRef = useRef<L.LayerGroup | null>(null)

  const startIdx = Math.round((range[0] / 100) * (points.length - 1))
  const endIdx = Math.round((range[1] / 100) * (points.length - 1))
  const visiblePoints = points.slice(startIdx, endIdx + 1)

  useEffect(() => {
    if (visiblePoints.length < 2) return

    const layer = L.layerGroup()
    const coords: Array<[number, number]> = visiblePoints.map((p) => [p.latitude, p.longitude] as [number, number])

    const clickable = L.polyline(coords, {
      color: '#fff',
      weight: 20,
      interactive: true,
      opacity: 0,
    })

    clickable.on('click', (e: L.LeafletMouseEvent) => {
      const clickLatLng = e.latlng
      let minDist = Infinity
      let nearestPoint: TrackPoint | null = null
      for (const pt of visiblePoints) {
        const dist = calculateHaversineDistance(
          { latitude: clickLatLng.lat, longitude: clickLatLng.lng },
          { latitude: pt.latitude, longitude: pt.longitude },
        )
        if (dist < minDist) {
          minDist = dist
          nearestPoint = pt
        }
      }
      if (nearestPoint) onPointClick(nearestPoint, e)
    })

    clickable.addTo(layer)
    layerRef.current = layer

    return () => {
      layer.remove()
      layerRef.current = null
    }
  }, [visiblePoints, mapInstance, onPointClick])

  return null
}

const statusLabels: Record<string, string> = {
  planned: 'Geplant',
  ridden: 'Gefahren',
  'found-online': 'Online gefunden',
}

const statusColors: Record<string, string> = {
  planned: '#9c27b0',
  ridden: '#4caf50',
  'found-online': '#ff5722',
}

function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`
  return `${Math.round(meters)} m`
}

function formatDuration(seconds: number): string {
  if (!seconds) return '–'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

const styles = {
  container: {
    display: 'flex',
    height: '100%',
    width: '100%',
  } as const,
  sidebar: {
    width: 400,
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
    margin: '0 0 12px',
    fontSize: 20,
    fontWeight: 600,
  } as const,
  headingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  } as const,
  syncButton: {
    padding: '6px 14px',
    fontSize: 13,
    fontWeight: 500,
    backgroundColor: '#fff',
    color: '#3b82f6',
    border: '1px solid #3b82f6',
    borderRadius: 6,
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
  } as const,
  summary: {
    display: 'flex',
    gap: 24,
    padding: '12px 16px',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
  } as const,
  summaryItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  } as const,
  summaryValue: {
    fontSize: 18,
    fontWeight: 700,
    color: '#1e293b',
  } as const,
  summaryLabel: {
    fontSize: 11,
    color: '#64748b',
    textTransform: 'uppercase' as const,
  } as const,
  filters: {
    display: 'flex',
    gap: 8,
    marginBottom: 12,
  } as const,
  input: {
    flex: 1,
    padding: '6px 8px',
    fontSize: 13,
    border: '1px solid #ccc',
    borderRadius: 4,
    backgroundColor: '#fff',
  } as const,
  select: {
    flex: 1,
    padding: '6px 8px',
    fontSize: 13,
    border: '1px solid #ccc',
    borderRadius: 4,
    backgroundColor: '#fff',
  } as const,
  error: {
    padding: '8px 12px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: 4,
    marginBottom: 12,
    fontSize: 13,
  } as const,
  loading: {
    padding: 16,
    textAlign: 'center' as const,
    color: '#666',
  } as const,
  fahrtList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
  } as const,
  fahrtCard: {
    padding: 12,
    borderRadius: 6,
    cursor: 'pointer',
    border: '1px solid #e0e0e0',
    transition: 'background-color 0.15s',
    textDecoration: 'none',
    color: 'inherit',
  } as const,
  fahrtDate: {
    fontWeight: 600,
    fontSize: 14,
    marginBottom: 4,
    color: '#1e293b',
  } as const,
  fahrtStats: {
    display: 'flex',
    gap: 12,
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  } as const,
  fahrtRoute: {
    display: 'flex',
    gap: 4,
    alignItems: 'center',
  } as const,
  routeName: {
    fontSize: 12,
    color: '#3b82f6',
  } as const,
  badge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 10,
    fontSize: 11,
    color: '#fff',
    fontWeight: 500,
  } as const,
  fahrtNotes: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 4,
  } as const,
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 12,
    padding: 8,
  } as const,
  pageButton: {
    padding: '4px 12px',
    border: '1px solid #ccc',
    borderRadius: 4,
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: 14,
  } as const,
  pageInfo: {
    fontSize: 13,
    color: '#666',
  } as const,
}
