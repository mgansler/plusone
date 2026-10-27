import { type RefObject, useEffect, useRef, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import L from 'leaflet'

import { calculateHaversineDistance, parseGpx, type TrackPoint } from '@plusone/gpx-toolbox-utils'
import { useListRoutes } from '@plusone/gpx-toolbox-api-client'

import { Map } from '../../components/Map'
import { SegmentOverlay } from '../../components/SegmentOverlay'
import { PointDetails } from '../../components/PointDetails'

const sourceLabels: Record<string, string> = {
  stravaRoute: 'Strava Route',
  stravaActivity: 'Strava Activity',
  manualImport: 'Manuell',
}

const statusLabels: Record<string, string> = {
  planned: 'Geplant',
  ridden: 'Gefahren',
  'found-online': 'Online gefunden',
}

export const Route = createFileRoute('/routes/')({
  component: RoutesPage,
})

function RoutesPage() {
  const mapRef: RefObject<L.Map | null> = useRef(null)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [sourceFilter, setSourceFilter] = useState<string>('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)
  const [selectedPoint, setSelectedPoint] = useState<{ point: TrackPoint; event: L.LeafletMouseEvent } | null>(null)
  const [segmentRange, setSegmentRange] = useState<[number, number]>([0, 100])

  const { data, isLoading, error, isError } = useListRoutes({
    page,
    limit: 50,
    sortBy,
    ...(statusFilter && { status: statusFilter }),
    ...(sourceFilter && { source: sourceFilter }),
  })

  type RouteListResponse = {
    items: Array<{
      id: string
      name: string
      description?: string | null
      source: string
      status: string
      stats?: Record<string, unknown>
      ratingTags?: Array<unknown>
      notes?: string | null
      fahrten?: Array<{ id: string }>
      createdAt: string
      updatedAt: string
    }>
    total: number
    page: number
    limit: number
    totalPages: number
  }

  const routes = ((data as unknown as RouteListResponse | undefined)?.items ?? []) as Array<{
    id: string
    name: string
    source: string
    status: string
    stats?: Record<string, unknown>
  }>
  const totalPages = (data as unknown as RouteListResponse | undefined)?.totalPages ?? 1
  const total = (data as unknown as RouteListResponse | undefined)?.total ?? 0

  // Fetch GPX content for selected route using direct fetch
  const [gpxText, setGpxText] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedRouteId) return
    setGpxText(null)

    // Get auth token (same key as auth-context.tsx)
    const token = localStorage.getItem('gpx-toolbox-jwt')
    if (!token) {
      console.error('[RoutesPage] No auth token found (key: gpx-toolbox-jwt)')
      return
    }

    fetch(`/api/routes/${selectedRouteId}/export`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorText = await response.text()
          console.error('[RoutesPage] HTTP error:', response.status, errorText)
          return
        }
        const text = await response.text()
        setGpxText(text)
      })
      .catch((err) => {
        console.error('[RoutesPage] Fetch error:', err)
      })
    return () => {
      // No cleanup needed for fetch
    }
  }, [selectedRouteId])

  const points = gpxText ? parseGpx(gpxText) : []

  function handleRouteClick(route: (typeof routes)[number]) {
    setSelectedRouteId(route.id)
    setSelectedPoint(null)
    setSegmentRange([0, 100])
  }

  function handlePointClick(point: TrackPoint, event: L.LeafletMouseEvent) {
    setSelectedPoint((prev) => {
      if (prev?.point === point) return null
      return { point, event }
    })
  }

  const stats = routes.map((r) => (r.stats as { distance?: number } | null)?.distance ?? 0)
  const totalDistance = stats.reduce((a, b) => a + b, 0)
  const totalElevation = routes.reduce((sum, r) => {
    const e = (r.stats as { elevationGain?: number } | null)?.elevationGain ?? 0
    return sum + e
  }, 0)

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.headingRow}>
          <h2 style={styles.heading}>Routen ({total})</h2>
          <Link to="/routes/sync" style={styles.syncButton}>
            📥 Sync
          </Link>
        </div>

        {/* Summary */}
        <div style={styles.summary}>
          <div style={styles.summaryItem}>
            <span style={styles.summaryValue}>{formatDistance(totalDistance)}</span>
            <span style={styles.summaryLabel}>Distanz</span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryValue}>{formatElevation(totalElevation)}</span>
            <span style={styles.summaryLabel}>Höhenmeter</span>
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filters}>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            style={styles.select}
          >
            <option value="">Alle Status</option>
            <option value="planned">Geplant</option>
            <option value="ridden">Gefahren</option>
            <option value="found-online">Online gefunden</option>
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value)
              setPage(1)
            }}
            style={styles.select}
          >
            <option value="">Alle Quellen</option>
            <option value="stravaRoute">Strava Route</option>
            <option value="stravaActivity">Strava Activity</option>
            <option value="manualImport">Manuell</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={styles.select}>
            <option value="createdAt">Neueste</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>

        {/* Error */}
        {isError && <div style={styles.error}>{error instanceof Error ? error.message : 'Unbekannter Fehler'}</div>}

        {/* Loading */}
        {isLoading && <div style={styles.loading}>Lade...</div>}

        {/* Routes */}
        {routes.length > 0 && (
          <div style={styles.routeList}>
            {routes.map((r) => (
              <Link
                key={r.id}
                to="/routes/$routeId"
                params={{ routeId: r.id }}
                onClick={() => handleRouteClick(r)}
                style={{
                  ...styles.routeCard,
                  backgroundColor: selectedRouteId === r.id ? '#e3f2fd' : '#fff',
                }}
              >
                <div style={styles.routeName}>{r.name}</div>
                {r.stats && (
                  <div style={styles.routeStats}>
                    <span>{formatDistance((r.stats as { distance?: number } | null)?.distance ?? 0)}</span>
                    <span>{formatElevation((r.stats as { elevationGain?: number } | null)?.elevationGain ?? 0)}</span>
                  </div>
                )}
                <div style={styles.routeMeta}>
                  <span style={{ ...styles.badge, backgroundColor: sourceColors[r.source] || '#9e9e9e' }}>
                    {sourceLabels[r.source] || r.source}
                  </span>
                  <span style={{ ...styles.badge, backgroundColor: statusColors[r.status] || '#9e9e9e' }}>
                    {statusLabels[r.status] || r.status}
                  </span>
                  {(() => {
                    const fahrten = (r as { fahrten?: Array<{ id: string }> }).fahrten
                    if (fahrten && fahrten.length > 0) return <span style={styles.badge}>{fahrten.length} Fahrten</span>
                    return null
                  })()}
                </div>
              </Link>
            ))}
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

      {/* Map — same mechanism as home page */}
      <div style={styles.mapArea}>
        {/* key forces fresh mount on navigation to ensure clean Leaflet lifecycle */}
        <Map key="routes-list" mapRef={mapRef}>
          {points.length > 1 && segmentRange[1] - segmentRange[0] >= 1 && mapRef.current && (
            <>
              {/* key forces fresh mount when route/points change */}
              <SegmentOverlay
                key={`routes-list-${points.length}-${segmentRange[0]}-${segmentRange[1]}`}
                points={points}
                mapInstance={mapRef.current}
                range={segmentRange}
                fitBounds={segmentRange[0] === 0 && segmentRange[1] === 100}
              >
                <TrackClickHandler
                  points={points}
                  range={segmentRange}
                  mapInstance={mapRef.current}
                  onPointClick={handlePointClick}
                />
              </SegmentOverlay>
            </>
          )}
        </Map>
      </div>
      {selectedPoint && <PointDetails point={selectedPoint.point} />}
    </div>
  )
}

/** Invisible click handler that maps clicks to the nearest track point in the selected range */
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

      if (nearestPoint) {
        onPointClick(nearestPoint, e)
      }
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

function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`
  return `${Math.round(meters)} m`
}

function formatElevation(meters: number): string {
  return `${Math.round(meters)} hm`
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
  headingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  } as const,
  heading: {
    margin: '0 0 12px',
    fontSize: 20,
    fontWeight: 600,
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
  routeList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
  } as const,
  routeCard: {
    padding: 12,
    borderRadius: 6,
    cursor: 'pointer',
    border: '1px solid #e0e0e0',
    transition: 'background-color 0.15s',
    textDecoration: 'none',
    color: 'inherit',
  } as const,
  routeName: {
    fontWeight: 600,
    fontSize: 14,
    marginBottom: 4,
  } as const,
  routeStats: {
    display: 'flex',
    gap: 12,
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  } as const,
  routeMeta: {
    display: 'flex',
    gap: 4,
  } as const,
  badge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 10,
    fontSize: 11,
    color: '#fff',
    fontWeight: 500,
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
