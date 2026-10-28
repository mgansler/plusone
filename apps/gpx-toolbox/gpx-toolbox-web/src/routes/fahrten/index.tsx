import { type RefObject, useEffect, useMemo, useRef, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import L from 'leaflet'

import { calculateHaversineDistance, parseGpx, type TrackPoint } from '@plusone/gpx-toolbox-utils'
import { ListAllFahrtenSortBy, useListAllFahrten } from '@plusone/gpx-toolbox-api-client'

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
  const [distanceKm, setDistanceKm] = useState<NumberRange>(emptyRange)
  const [elevationM, setElevationM] = useState<NumberRange>(emptyRange)
  const [sortBy, setSortBy] = useState<ListAllFahrtenSortBy>(ListAllFahrtenSortBy.riddenAt)
  const [order, setOrder] = useState<'ASC' | 'DESC'>('DESC')
  const [selectedFahrtId, setSelectedFahrtId] = useState<string | null>(null)
  const [selectedPoint, setSelectedPoint] = useState<{ point: TrackPoint; event: L.LeafletMouseEvent } | null>(null)

  // Number inputs fire on every keystroke; wait until typing pauses before querying
  const debouncedDistanceKm = useDebouncedValue(distanceKm, 400)
  const debouncedElevationM = useDebouncedValue(elevationM, 400)

  const { data, isLoading, error, isError } = useListAllFahrten({
    page,
    limit: 50,
    sortBy,
    order,
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
    ...rangeParams(debouncedDistanceKm, 'minDistance', 'maxDistance', 1000),
    ...rangeParams(debouncedElevationM, 'minElevation', 'maxElevation', 1),
  })

  type FahrtListResponse = {
    items?: Array<{
      id: string
      routeId: string
      riddenAt: string
      title?: string | null
      duration: number | null
      avgHr: number | null
      maxHr: number | null
      notes: string | null
      route?: { name?: string; status?: string; stats?: RouteStats }
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

  // Total distance in km
  const totalDist = useMemo(() => {
    if (points.length < 2) return 0
    let dist = 0
    for (let i = 1; i < points.length; i++) {
      dist += calculateHaversineDistance(points[i - 1], points[i])
    }
    return dist / 1000
  }, [points])

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
  const totalDistance = fahrten.reduce((sum, f) => sum + (f.route?.stats?.distance ?? 0), 0)
  const totalElevation = fahrten.reduce((sum, f) => sum + (f.route?.stats?.elevationGain ?? 0), 0)
  const hasFilters = dateFrom !== '' || dateTo !== '' || !isEmptyRange(distanceKm) || !isEmptyRange(elevationM)

  return (
    <div style={styles.page}>
      {/* Filter & sort bar */}
      <div style={styles.filterBar}>
        <label style={styles.filterField}>
          <span style={styles.filterLabel}>Von</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value)
              setPage(1)
            }}
            style={styles.input}
          />
        </label>
        <label style={styles.filterField}>
          <span style={styles.filterLabel}>Bis</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value)
              setPage(1)
            }}
            style={styles.input}
          />
        </label>
        <RangeFilter
          label="Distanz"
          unit="km"
          value={distanceKm}
          onChange={(range) => {
            setDistanceKm(range)
            setPage(1)
          }}
        />
        <RangeFilter
          label="Höhenmeter"
          unit="hm"
          value={elevationM}
          onChange={(range) => {
            setElevationM(range)
            setPage(1)
          }}
        />
        {hasFilters && (
          <button
            onClick={() => {
              setDateFrom('')
              setDateTo('')
              setDistanceKm(emptyRange)
              setElevationM(emptyRange)
              setPage(1)
            }}
            style={styles.resetButton}
          >
            Filter zurücksetzen
          </button>
        )}

        <div style={styles.filterSpacer} />

        <label style={styles.filterField}>
          <span style={styles.filterLabel}>Sortieren nach</span>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as ListAllFahrtenSortBy)
              setPage(1)
            }}
            style={styles.input}
          >
            {Object.entries(sortLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={() => {
            setOrder(order === 'DESC' ? 'ASC' : 'DESC')
            setPage(1)
          }}
          style={styles.orderButton}
          title={order === 'DESC' ? 'Absteigend' : 'Aufsteigend'}
        >
          {order === 'DESC' ? '↓ Absteigend' : '↑ Aufsteigend'}
        </button>
      </div>

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
            <div style={styles.summaryItem}>
              <span style={styles.summaryValue}>{formatElevation(totalElevation)}</span>
              <span style={styles.summaryLabel}>Höhenmeter</span>
            </div>
          </div>

          {/* Error */}
          {isError && <div style={styles.error}>{error instanceof Error ? error.message : 'Unbekannter Fehler'}</div>}

          {/* Loading */}
          {isLoading && <div style={styles.loading}>Lade...</div>}

          {/* Fahrten */}
          {fahrten.length > 0 && (
            <div style={styles.fahrtList}>
              {fahrten.map((f) => {
                const route = f.route
                const stats = route?.stats
                return (
                  <Link
                    key={f.id}
                    to="/fahrten/$fahrtId"
                    params={{ fahrtId: f.id }}
                    onClick={() => handleFahrtClick(f)}
                    title={f.notes ?? undefined}
                    style={{
                      ...styles.fahrtCard,
                      backgroundColor: selectedFahrtId === f.id ? '#e3f2fd' : '#fff',
                    }}
                  >
                    {/* Line 1: date, title, route status */}
                    <div style={styles.fahrtLine}>
                      <span style={styles.fahrtDate}>
                        {new Date(f.riddenAt).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </span>
                      <span style={styles.fahrtTitle}>{f.title ?? route?.name ?? ''}</span>
                      {route?.status && (
                        <span style={{ ...styles.badge, backgroundColor: statusColors[route.status] || '#9e9e9e' }}>
                          {statusLabels[route.status]}
                        </span>
                      )}
                    </div>
                    {/* Line 2: stats and route name */}
                    <div style={styles.fahrtLine}>
                      <span style={styles.fahrtStats}>
                        <span>⏱ {f.duration ? formatDuration(f.duration) : '–'}</span>
                        <span>↔ {stats?.distance ? formatDistance(stats.distance) : '–'}</span>
                        <span>↗ {stats?.elevationGain ? formatElevation(stats.elevationGain) : '–'}</span>
                        {f.avgHr && <span>♥ {f.avgHr}</span>}
                      </span>
                      {route?.name && f.title && <span style={styles.routeName}>{route.name}</span>}
                    </div>
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
              <SegmentOverlay
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

type RouteStats = { distance?: number; elevationGain?: number }

const sortLabels: Partial<Record<ListAllFahrtenSortBy, string>> = {
  [ListAllFahrtenSortBy.riddenAt]: 'Datum',
  [ListAllFahrtenSortBy.duration]: 'Dauer',
  [ListAllFahrtenSortBy.distance]: 'Distanz',
  [ListAllFahrtenSortBy.elevationGain]: 'Höhenmeter',
  [ListAllFahrtenSortBy.avgHr]: 'Ø Herzfrequenz',
}

/** Min/max as typed into the inputs (empty string = no bound) */
type NumberRange = { min: string; max: string }

const emptyRange: NumberRange = { min: '', max: '' }

function isEmptyRange(range: NumberRange): boolean {
  return range.min === '' && range.max === ''
}

/** Turn a typed range into query params, converting to meters with `factor` */
function rangeParams<Min extends string, Max extends string>(
  range: NumberRange,
  minKey: Min,
  maxKey: Max,
  factor: number,
): Partial<Record<Min | Max, number>> {
  const params: Partial<Record<Min | Max, number>> = {}
  const min = parseFloat(range.min)
  const max = parseFloat(range.max)
  if (!isNaN(min)) params[minKey] = min * factor
  if (!isNaN(max)) params[maxKey] = max * factor
  return params
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timeout)
  }, [value, delayMs])
  return debounced
}

function RangeFilter({
  label,
  unit,
  value,
  onChange,
}: {
  label: string
  unit: string
  value: NumberRange
  onChange: (range: NumberRange) => void
}) {
  return (
    <div style={styles.filterField}>
      <span style={styles.filterLabel}>
        {label} ({unit})
      </span>
      <div style={styles.rangeInputs}>
        <input
          type="number"
          min={0}
          placeholder="min"
          aria-label={`${label} min`}
          value={value.min}
          onChange={(e) => onChange({ ...value, min: e.target.value })}
          style={{ ...styles.input, ...styles.rangeInput }}
        />
        <span style={styles.rangeDash}>–</span>
        <input
          type="number"
          min={0}
          placeholder="max"
          aria-label={`${label} max`}
          value={value.max}
          onChange={(e) => onChange({ ...value, max: e.target.value })}
          style={{ ...styles.input, ...styles.rangeInput }}
        />
      </div>
    </div>
  )
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
  page: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    width: '100%',
  } as const,
  filterBar: {
    display: 'flex',
    alignItems: 'flex-end',
    flexWrap: 'wrap' as const,
    gap: 12,
    padding: '8px 16px',
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#fff',
    flexShrink: 0,
  } as const,
  filterField: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
  } as const,
  filterLabel: {
    fontSize: 11,
    color: '#64748b',
    textTransform: 'uppercase' as const,
  } as const,
  filterSpacer: {
    flex: 1,
  } as const,
  resetButton: {
    padding: '6px 10px',
    fontSize: 13,
    border: 'none',
    backgroundColor: 'transparent',
    color: '#3b82f6',
    cursor: 'pointer',
  } as const,
  orderButton: {
    padding: '6px 10px',
    fontSize: 13,
    border: '1px solid #ccc',
    borderRadius: 4,
    backgroundColor: '#fff',
    cursor: 'pointer',
  } as const,
  container: {
    display: 'flex',
    flex: 1,
    minHeight: 0,
    width: '100%',
  } as const,
  sidebar: {
    width: 520,
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
  input: {
    padding: '6px 8px',
    fontSize: 13,
    border: '1px solid #ccc',
    borderRadius: 4,
    backgroundColor: '#fff',
  } as const,
  rangeInputs: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  } as const,
  rangeInput: {
    width: 72,
  } as const,
  rangeDash: {
    color: '#64748b',
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
    gap: 6,
  } as const,
  fahrtCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
    padding: '6px 10px',
    borderRadius: 6,
    cursor: 'pointer',
    border: '1px solid #e0e0e0',
    transition: 'background-color 0.15s',
    textDecoration: 'none',
    color: 'inherit',
  } as const,
  fahrtLine: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
    whiteSpace: 'nowrap' as const,
  } as const,
  fahrtDate: {
    fontWeight: 600,
    fontSize: 13,
    color: '#1e293b',
    flexShrink: 0,
  } as const,
  fahrtTitle: {
    flex: 1,
    fontSize: 13,
    color: '#1e293b',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } as const,
  fahrtStats: {
    display: 'flex',
    gap: 12,
    fontSize: 12,
    color: '#64748b',
    flexShrink: 0,
  } as const,
  routeName: {
    flex: 1,
    fontSize: 12,
    color: '#3b82f6',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'right' as const,
  } as const,
  badge: {
    display: 'inline-block',
    padding: '1px 8px',
    borderRadius: 10,
    fontSize: 11,
    color: '#fff',
    fontWeight: 500,
    flexShrink: 0,
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
