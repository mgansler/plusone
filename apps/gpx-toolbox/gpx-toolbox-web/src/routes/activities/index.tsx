import { type RefObject, useEffect, useMemo, useRef, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import L from 'leaflet'

import { calculateHaversineDistance, parseGpx, type TrackPoint } from '@plusone/gpx-toolbox-utils'
import {
  getListAllActivitiesQueryKey,
  getListRoutesQueryKey,
  ListAllActivitiesSortBy,
  useListAllActivities,
} from '@plusone/gpx-toolbox-api-client'

import { Map } from '../../components/Map'
import { SegmentOverlay } from '../../components/SegmentOverlay'
import { PointDetails } from '../../components/PointDetails'
import { UploadGpxModal } from '../../components/UploadGpxModal'
import { actionButtonStyle } from '../../components/actionButtonStyle'
import { routeStatusColor, routeStatusLabel } from '../../utils/routeStatus'
import { formatDistanceShort, formatDurationShort, formatElevationGain } from '../../utils/format'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { emptyRange, isEmptyRange, type NumberRange, rangeParams } from '../../utils/filters'

export const Route = createFileRoute('/activities/')({
  component: ActivitiesPage,
})

function ActivitiesPage() {
  const mapRef: RefObject<L.Map | null> = useRef(null)
  const [page, setPage] = useState(1)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [distanceKm, setDistanceKm] = useState<NumberRange>(emptyRange)
  const [elevationM, setElevationM] = useState<NumberRange>(emptyRange)
  const [sortBy, setSortBy] = useState<ListAllActivitiesSortBy>(ListAllActivitiesSortBy.riddenAt)
  const [order, setOrder] = useState<'ASC' | 'DESC'>('DESC')
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedPoint, setSelectedPoint] = useState<{ point: TrackPoint; event: L.LeafletMouseEvent } | null>(null)

  // Number inputs fire on every keystroke; wait until typing pauses before querying
  const debouncedDistanceKm = useDebouncedValue(distanceKm, 400)
  const debouncedElevationM = useDebouncedValue(elevationM, 400)

  const { data, isLoading, error, isError } = useListAllActivities({
    page,
    limit: 50,
    sortBy,
    order,
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
    ...rangeParams(debouncedDistanceKm, 'minDistance', 'maxDistance', 1000),
    ...rangeParams(debouncedElevationM, 'minElevation', 'maxElevation', 1),
  })

  type ActivityListResponse = {
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

  const activities = (data as ActivityListResponse)?.items ?? []
  const totalPages = (data as unknown as ActivityListResponse | undefined)?.totalPages ?? 1
  const total = (data as unknown as ActivityListResponse | undefined)?.total ?? 0

  // Fetch GPX content for selected activity's route
  const [gpxText, setGpxText] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedActivityId) {
      setGpxText(null)
      return
    }
    setGpxText(null)

    const token = localStorage.getItem('gpx-toolbox-jwt')
    if (!token) {
      console.error('[ActivitiesPage] No auth token')
      return
    }

    // Find the activity to get its routeId
    const activity = activities.find((f) => f.id === selectedActivityId)
    if (!activity || !activity.routeId) return

    fetch(`/api/routes/${activity.routeId}/export`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorText = await response.text()
          console.error('[ActivitiesPage] HTTP error:', response.status, errorText)
          return
        }
        const text = await response.text()
        setGpxText(text)
      })
      .catch((err) => {
        console.error('[ActivitiesPage] Fetch error:', err)
      })
  }, [selectedActivityId, activities])

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

  function handleActivityClick(activity: (typeof activities)[number]) {
    setSelectedActivityId(activity.id)
    setSelectedPoint(null)
  }

  function handlePointClick(point: TrackPoint, event: L.LeafletMouseEvent) {
    setSelectedPoint((prev) => {
      if (prev?.point === point) return null
      return { point, event }
    })
  }

  // Compute totals across all displayed activities
  const totalDuration = activities.reduce((sum, f) => sum + (f.duration ?? 0), 0)
  const totalDistance = activities.reduce((sum, f) => sum + (f.route?.stats?.distance ?? 0), 0)
  const totalElevation = activities.reduce((sum, f) => sum + (f.route?.stats?.elevationGain ?? 0), 0)
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
              setSortBy(e.target.value as ListAllActivitiesSortBy)
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
            <h2 style={styles.heading}>Aktivitäten ({total})</h2>
            <div style={styles.headingActions}>
              <button onClick={() => setShowUploadModal(true)} style={actionButtonStyle}>
                📤 Upload
              </button>
              <Link to="/activities/sync" style={actionButtonStyle}>
                📥 Sync
              </Link>
            </div>
          </div>

          {/* Summary */}
          <div style={styles.summary}>
            <div style={styles.summaryItem}>
              <span style={styles.summaryValue}>{formatDurationShort(totalDuration)}</span>
              <span style={styles.summaryLabel}>Gesamtdauer</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryValue}>{formatDistanceShort(totalDistance)}</span>
              <span style={styles.summaryLabel}>Distanz</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryValue}>{formatElevationGain(totalElevation)}</span>
              <span style={styles.summaryLabel}>Höhenmeter</span>
            </div>
          </div>

          {/* Error */}
          {isError && <div style={styles.error}>{error instanceof Error ? error.message : 'Unbekannter Fehler'}</div>}

          {/* Loading */}
          {isLoading && <div style={styles.loading}>Lade...</div>}

          {/* Activities */}
          {activities.length > 0 && (
            <div style={styles.activityList}>
              {activities.map((f) => {
                const route = f.route
                const stats = route?.stats
                return (
                  <Link
                    key={f.id}
                    to="/activities/$activityId"
                    params={{ activityId: f.id }}
                    onClick={() => handleActivityClick(f)}
                    title={f.notes ?? undefined}
                    style={{
                      ...styles.activityCard,
                      backgroundColor: selectedActivityId === f.id ? '#e3f2fd' : '#fff',
                    }}
                  >
                    {/* Line 1: date, title, route status */}
                    <div style={styles.activityLine}>
                      <span style={styles.activityDate}>
                        {new Date(f.riddenAt).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </span>
                      <span style={styles.activityTitle}>{f.title ?? route?.name ?? ''}</span>
                      {route?.status && (
                        <span style={{ ...styles.badge, backgroundColor: routeStatusColor(route.status) }}>
                          {routeStatusLabel(route.status)}
                        </span>
                      )}
                    </div>
                    {/* Line 2: stats and route name */}
                    <div style={styles.activityLine}>
                      <span style={styles.activityStats}>
                        <span>⏱ {f.duration ? formatDurationShort(f.duration) : '–'}</span>
                        <span>↔ {stats?.distance ? formatDistanceShort(stats.distance) : '–'}</span>
                        <span>↗ {stats?.elevationGain ? formatElevationGain(stats.elevationGain) : '–'}</span>
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

      {showUploadModal && (
        <UploadGpxModal
          heading="Aktivität hochladen"
          endpoint="/api/import/activity"
          nameField="title"
          namePlaceholder="Titel (optional, sonst aus GPX)"
          nameRequired={false}
          invalidateQueryKeys={[getListAllActivitiesQueryKey(), getListRoutesQueryKey()]}
          onClose={() => setShowUploadModal(false)}
        />
      )}
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

const sortLabels: Partial<Record<ListAllActivitiesSortBy, string>> = {
  [ListAllActivitiesSortBy.riddenAt]: 'Datum',
  [ListAllActivitiesSortBy.duration]: 'Dauer',
  [ListAllActivitiesSortBy.distance]: 'Distanz',
  [ListAllActivitiesSortBy.elevationGain]: 'Höhenmeter',
  [ListAllActivitiesSortBy.avgHr]: 'Ø Herzfrequenz',
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
  headingActions: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
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
  activityList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
  } as const,
  activityCard: {
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
  activityLine: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
    whiteSpace: 'nowrap' as const,
  } as const,
  activityDate: {
    fontWeight: 600,
    fontSize: 13,
    color: '#1e293b',
    flexShrink: 0,
  } as const,
  activityTitle: {
    flex: 1,
    fontSize: 13,
    color: '#1e293b',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } as const,
  activityStats: {
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
