import { type RefObject, useEffect, useMemo, useRef, useState } from 'react'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import L from 'leaflet'

import { calculateHaversineDistance, parseGpx, type TrackPoint } from '@plusone/gpx-toolbox-utils'
import {
  getGetFahrt2QueryKey,
  getListAllFahrtenQueryKey,
  useDeleteFahrt2,
  useGetFahrt2,
} from '@plusone/gpx-toolbox-api-client'

import { Map } from '../../components/Map'
import { SegmentOverlay } from '../../components/SegmentOverlay'
import { PointDetails } from '../../components/PointDetails'

export const Route = createFileRoute('/fahrten/$fahrtId')({
  component: FahrtDetailPage,
  beforeLoad: async () => {
    const token = localStorage.getItem('gpx-toolbox-jwt')
    if (!token) {
      throw redirect({ to: '/login' })
    }
    return { token }
  },
})

function FahrtDetailPage() {
  const { fahrtId } = Route.useParams()
  const mapRef: RefObject<L.Map | null> = useRef(null)
  const queryClient = useQueryClient()

  const [selectedPoint, setSelectedPoint] = useState<{ point: TrackPoint; event: L.LeafletMouseEvent } | null>(null)

  const { data: fahrt, isLoading, error, isError } = useGetFahrt2(fahrtId)

  const deleteFahrtMutation = useDeleteFahrt2({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getGetFahrt2QueryKey(fahrtId) })
        void queryClient.invalidateQueries({ queryKey: getListAllFahrtenQueryKey() })
      },
    },
  })

  // Fetch GPX from parent route
  const [gpxText, setGpxText] = useState<string | null>(null)

  useEffect(() => {
    if (!fahrt?.routeId) {
      setGpxText(null)
      return
    }
    setGpxText(null)

    const token = localStorage.getItem('gpx-toolbox-jwt')
    if (!token) {
      console.error('[FahrtDetailPage] No auth token')
      return
    }

    fetch(`/api/routes/${fahrt.routeId}/export`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text()
          console.error('[FahrtDetailPage] HTTP error:', res.status, text)
          return
        }
        const text = await res.text()
        setGpxText(text)
      })
      .catch((err) => {
        console.error('[FahrtDetailPage] Fetch error:', err)
      })
  }, [fahrt?.routeId])

  const points = gpxText ? parseGpx(gpxText) : []

  // Total distance in km
  const totalDist = useMemo(() => {
    if (points.length < 2) return 0
    let dist = 0
    for (let i = 1; i < points.length; i++) {
      dist += calculateHaversineDistance(points[i - 1], points[i])
    }
    return dist / 1000
  }, [points])

  function handlePointClick(point: TrackPoint, event: L.LeafletMouseEvent) {
    setSelectedPoint((prev) => {
      if (prev?.point === point) return null
      return { point, event }
    })
  }

  async function handleDeleteFahrt() {
    if (!confirm('Fahrt wirklich löschen?')) return
    try {
      await deleteFahrtMutation.mutateAsync({ id: fahrtId })
    } catch {
      // Error handled by mutation
    }
  }

  if (isLoading) return <div style={styles.loading}>Lade...</div>
  if (isError) return <div style={styles.error}>{error instanceof Error ? error.message : 'Unbekannter Fehler'}</div>
  if (!fahrt) return <div style={styles.error}>Fahrt nicht gefunden</div>

  const parentRoute = fahrt.route as
    { name?: string; status?: string; stats?: Record<string, unknown> } | undefined | null

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <Link to="/fahrten" style={styles.backLink}>
          ← Zurück zur Übersicht
        </Link>

        <h2 style={styles.heading}>
          {fahrt.riddenAt &&
            new Date(fahrt.riddenAt).toLocaleDateString('de-DE', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
        </h2>

        {parentRoute && (
          <Link to="/routes/$routeId" params={{ routeId: fahrt.routeId }} style={styles.routeLink}>
            {parentRoute.name}
          </Link>
        )}

        {/* Stats */}
        <div style={styles.stats}>
          {fahrt.duration != null && (
            <div style={styles.statRow}>
              <span style={styles.statLabel}>Dauer</span>
              <span style={styles.statValue}>
                {formatDuration(fahrt.duration != null ? (fahrt.duration as unknown as number) : 0)}
              </span>
            </div>
          )}
          {fahrt.avgHr != null && (
            <div style={styles.statRow}>
              <span style={styles.statLabel}>Ø Herzfrequenz</span>
              <span style={styles.statValue}>{fahrt.avgHr != null ? `${fahrt.avgHr} bpm` : null}</span>
            </div>
          )}
          {fahrt.maxHr != null && (
            <div style={styles.statRow}>
              <span style={styles.statLabel}>Max Herzfrequenz</span>
              <span style={styles.statValue}>{fahrt.maxHr != null ? `${fahrt.maxHr} bpm` : null}</span>
            </div>
          )}
          {parentRoute?.stats && (
            <>
              <div style={styles.statRow}>
                <span style={styles.statLabel}>Distanz Route</span>
                <span style={styles.statValue}>
                  {formatDistance((parentRoute.stats as { distance?: number })?.distance ?? 0)}
                </span>
              </div>
              <div style={styles.statRow}>
                <span style={styles.statLabel}>Höhenmeter ↑</span>
                <span style={styles.statValue}>
                  {formatElevation((parentRoute.stats as { elevationGain?: number })?.elevationGain ?? 0)}
                </span>
              </div>
            </>
          )}
        </div>

        {parentRoute && parentRoute.status && (
          <div style={styles.meta}>
            <span style={{ ...styles.badge, backgroundColor: statusColors[parentRoute.status] || '#9e9e9e' }}>
              {statusLabels[parentRoute.status]}
            </span>
          </div>
        )}

        {fahrt.notes && <p style={styles.notes}>{fahrt.notes as unknown as string}</p>}

        <button onClick={handleDeleteFahrt} style={styles.deleteButton}>
          🗑 Fahrt löschen
        </button>
      </div>

      {/* Map */}
      <div style={styles.mapArea}>
        {/* key forces fresh mount on navigation to ensure clean Leaflet lifecycle */}
        <Map key={fahrtId} mapRef={mapRef}>
          {points.length > 1 && (
            <SegmentOverlay
              key={`${fahrtId}-${points.length}`}
              points={points}
              mapInstance={mapRef.current!}
              range={[0, totalDist]}
              totalDistKm={totalDist}
              fitBounds
            >
              <TrackClickHandler
                points={points}
                range={[0, totalDist]}
                totalDistKm={totalDist}
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
  range: _range,
  totalDistKm: _totalDistKm,
  mapInstance,
  onPointClick,
}: {
  points: Array<TrackPoint>
  range: [number, number]
  totalDistKm: number
  mapInstance: L.Map
  onPointClick: (point: TrackPoint, event: L.LeafletMouseEvent) => void
}) {
  const layerRef = useRef<L.LayerGroup | null>(null)

  const startIdx = findClosestIndex(points, 0)
  const endIdx = findClosestIndex(points, _totalDistKm)
  const visiblePoints = points.slice(startIdx, endIdx + 1)

  function findClosestIndex(pts: Array<TrackPoint>, targetDistKm: number): number {
    let dist = 0
    for (let i = 1; i < pts.length; i++) {
      if (dist / 1000 >= targetDistKm) return i - 1
      dist += calculateHaversineDistance(pts[i - 1], pts[i])
    }
    return pts.length - 1
  }

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

function formatElevation(meters: number): string {
  return `${Math.round(meters)} hm`
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
  backLink: {
    display: 'block',
    marginBottom: 12,
    fontSize: 13,
    color: '#3b82f6',
    textDecoration: 'none',
  } as const,
  heading: {
    margin: '0 0 8px',
    fontSize: 20,
    fontWeight: 600,
    color: '#1e293b',
  } as const,
  routeLink: {
    fontSize: 14,
    color: '#3b82f6',
    textDecoration: 'none',
    marginBottom: 12,
    display: 'block',
  } as const,
  stats: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  } as const,
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '4px 0',
  } as const,
  statLabel: {
    fontSize: 13,
    color: '#64748b',
  } as const,
  statValue: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1e293b',
  } as const,
  meta: {
    display: 'flex',
    gap: 6,
    marginBottom: 12,
  } as const,
  badge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 12,
    fontSize: 12,
    color: '#fff',
    fontWeight: 500,
  } as const,
  notes: {
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
    marginBottom: 12,
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
    padding: 32,
    textAlign: 'center' as const,
    color: '#666',
  } as const,
  deleteButton: {
    padding: '6px 12px',
    fontSize: 13,
    backgroundColor: '#fff',
    color: '#c62828',
    border: '1px solid #c62828',
    borderRadius: 4,
    cursor: 'pointer',
    marginTop: 8,
  } as const,
}
