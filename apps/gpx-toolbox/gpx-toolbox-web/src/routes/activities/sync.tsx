import { useCallback, useEffect, useRef, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import L from 'leaflet'

import { useImportStravaActivity } from '@plusone/gpx-toolbox-api-client'
import { customAxiosInstance } from '@plusone/gpx-toolbox-api-client'
import { decodePolyline } from '@plusone/gpx-toolbox-utils'

import { Map } from '../../components/Map'

export const Route = createFileRoute('/activities/sync')({
  component: SyncPage,
})

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

function formatDateLocal(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

type PaginatedStravaActivity = {
  id: number
  name: string
  distance?: number
  elevationGain?: number
  moving_time?: number
  elapsed_duration?: number
  heart_rate_avg?: number
  heart_rate_max?: number
  start_date_local: string
  sport_type?: string
  trainer?: boolean
  /** Encoded (Google polyline format), simplified track from the Strava summary */
  summary_polyline?: string
  routeId?: string
  imported: boolean
}

/** Strava `after`/`before` as ISO timestamps; "Bis" includes the whole selected day (local time) */
function dateRangeParams({ dateFrom, dateTo }: { dateFrom: string; dateTo: string }): Record<string, string> {
  const params: Record<string, string> = {}
  if (dateFrom) params.after = new Date(`${dateFrom}T00:00:00`).toISOString()
  if (dateTo) {
    const end = new Date(`${dateTo}T00:00:00`)
    end.setDate(end.getDate() + 1)
    params.before = end.toISOString()
  }
  return params
}

/** Indoor trainer rides: flagged as trainer, or virtual rides (Zwift etc.) which don't always set the flag */
function isIndoorRide(activity: { trainer?: boolean; sport_type?: string }): boolean {
  return activity.trainer === true || activity.sport_type === 'VirtualRide'
}

const sportTypeLabels: Record<string, string> = {
  Ride: 'Radfahrt',
  GravelRide: 'Gravel',
  MountainBikeRide: 'MTB',
  EMountainBikeRide: 'E-MTB',
  EBikeRide: 'E-Bike',
  VirtualRide: 'Virtuell',
  Velomobile: 'Velomobil',
  Handcycle: 'Handbike',
  Run: 'Laufen',
  TrailRun: 'Trailrun',
  Walk: 'Gehen',
  Hike: 'Wandern',
  Swim: 'Schwimmen',
  Workout: 'Workout',
}

type StravaActivitiesResponse = {
  items: Array<PaginatedStravaActivity>
  page: number
  per_page: number
  hasMore: boolean
}

function SyncPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [importingId, setImportingId] = useState<number | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [map, setMap] = useState<L.Map | null>(null)

  // Date range is passed to Strava (after/before); the other filters only apply to loaded activities
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [onlyOpen, setOnlyOpen] = useState(false)
  const [hideTrainer, setHideTrainer] = useState(false)
  const [minDistanceKm, setMinDistanceKm] = useState('')
  const [hiddenSportTypes, setHiddenSportTypes] = useState<Set<string>>(new Set())

  // Pagination state
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(50)
  const [activities, setActivities] = useState<Array<PaginatedStravaActivity>>([])
  const [hasMore, setHasMore] = useState(false)
  const [isLoadingActivities, setIsLoadingActivities] = useState(false)
  const [error, setError] = useState<unknown | null>(null)

  // Refs to avoid stale closures in async handlers
  const pageRef = useRef(page)
  const perPageRef = useRef(perPage)
  const dateRangeRef = useRef({ dateFrom, dateTo })
  dateRangeRef.current = { dateFrom, dateTo }
  useEffect(() => {
    pageRef.current = page
  }, [page])
  useEffect(() => {
    perPageRef.current = perPage
  }, [perPage])

  const loadActivities = useCallback(async (pageNum: number, append = false, currentPerPage?: number) => {
    const effectivePerPage = currentPerPage ?? perPageRef.current
    setIsLoadingActivities(true)
    setError(null)
    try {
      const response = await customAxiosInstance<StravaActivitiesResponse>({
        url: '/api/routes/strava-activities',
        method: 'GET',
        params: { page: pageNum, per_page: effectivePerPage, ...dateRangeParams(dateRangeRef.current) },
      })

      if (append) {
        setActivities((prev) => [...prev, ...response.items])
      } else {
        setActivities(response.items)
      }
      setHasMore(response.hasMore)
      setPage(pageNum)
      if (currentPerPage) setPerPage(currentPerPage)
    } catch (err) {
      setError(err)
    } finally {
      setIsLoadingActivities(false)
    }
  }, [])

  const handleRefresh = async () => {
    await loadActivities(1)
  }

  const handleLoadMore = async () => {
    await loadActivities(pageRef.current + 1, true)
  }

  const handleLimitChange = (newLimit: number) => {
    // Pass newLimit directly to avoid stale closure
    void loadActivities(1, false, newLimit)
  }

  const importActivityMutation = useImportStravaActivity({
    mutation: {
      onSuccess: () => {
        void handleRefresh()
      },
    },
  })

  const handleImport = async (activityId: number) => {
    setImportingId(activityId)
    try {
      await importActivityMutation.mutateAsync({ params: { activityId: String(activityId), autoMatch: 'true' } })
    } catch {
      // Error handled by mutation
    } finally {
      setImportingId(null)
    }
  }

  const minDistance = parseFloat(minDistanceKm) * 1000
  const filtered = activities.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (!onlyOpen || !a.imported) &&
      (!hideTrainer || !isIndoorRide(a)) &&
      (isNaN(minDistance) || (a.distance ?? 0) >= minDistance) &&
      !hiddenSportTypes.has(a.sport_type ?? ''),
  )
  const importedCount = activities.filter((a) => a.imported).length
  const sportTypes = [...new Set(activities.map((a) => a.sport_type ?? ''))].sort()
  const hasLocalFilters =
    searchQuery !== '' || onlyOpen || hideTrainer || minDistanceKm !== '' || hiddenSportTypes.size > 0

  const toggleSportType = (sportType: string) => {
    setHiddenSportTypes((prev) => {
      const next = new Set(prev)
      if (next.has(sportType)) next.delete(sportType)
      else next.add(sportType)
      return next
    })
  }

  const selectedActivity = activities.find((a) => a.id === selectedId) ?? null

  // Preview the selected activity's track on the map
  useEffect(() => {
    if (!map || !selectedActivity?.summary_polyline) return
    const coords = decodePolyline(selectedActivity.summary_polyline).map(
      (p) => [p.latitude, p.longitude] as [number, number],
    )
    if (coords.length < 2) return

    const line = L.polyline(coords, { color: '#e11d48', weight: 4, opacity: 0.9 }).addTo(map)
    map.fitBounds(line.getBounds(), { padding: [24, 24] })
    return () => {
      line.remove()
    }
  }, [map, selectedActivity])

  // Load on mount and whenever the date range changes
  useEffect(() => {
    void loadActivities(1)
  }, [dateFrom, dateTo, loadActivities])

  return (
    <div style={styles.page}>
      {/* Filter & action bar */}
      <div style={styles.filterBar}>
        <label style={styles.filterField}>
          <span style={styles.filterLabel}>Suche</span>
          <input
            type="text"
            placeholder="Name der Aktivität"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ ...styles.input, ...styles.searchInput }}
          />
        </label>
        <label style={styles.filterField}>
          <span style={styles.filterLabel}>Von</span>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={styles.input} />
        </label>
        <label style={styles.filterField}>
          <span style={styles.filterLabel}>Bis</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={styles.input} />
        </label>
        <label style={styles.filterField}>
          <span style={styles.filterLabel}>Min. Distanz (km)</span>
          <input
            type="number"
            min={0}
            value={minDistanceKm}
            onChange={(e) => setMinDistanceKm(e.target.value)}
            style={{ ...styles.input, ...styles.numberInput }}
          />
        </label>
        <div style={styles.checkboxGroup}>
          <label style={styles.checkboxLabel}>
            <input type="checkbox" checked={onlyOpen} onChange={(e) => setOnlyOpen(e.target.checked)} />
            Nur offene
          </label>
          <label style={styles.checkboxLabel}>
            <input type="checkbox" checked={hideTrainer} onChange={(e) => setHideTrainer(e.target.checked)} />
            Ohne Rollentrainer
          </label>
        </div>
        <label style={styles.filterField}>
          <span style={styles.filterLabel}>Pro Seite</span>
          <select value={perPage} onChange={(e) => handleLimitChange(Number(e.target.value))} style={styles.input}>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
        </label>

        {(hasLocalFilters || dateFrom !== '' || dateTo !== '') && (
          <button
            onClick={() => {
              setSearchQuery('')
              setDateFrom('')
              setDateTo('')
              setOnlyOpen(false)
              setHideTrainer(false)
              setMinDistanceKm('')
              setHiddenSportTypes(new Set())
            }}
            style={styles.resetButton}
          >
            Filter zurücksetzen
          </button>
        )}

        <div style={styles.filterSpacer} />

        <button onClick={handleRefresh} disabled={isLoadingActivities} style={styles.loadButton}>
          {isLoadingActivities && !hasMore ? '⏳ Lade...' : '🔄 Aktualisieren'}
        </button>
      </div>

      <div style={styles.container}>
        <div style={styles.sidebar}>
          <div style={styles.headingRow}>
            <h2 style={styles.heading}>Strava Sync</h2>
            <Link to="/activities" style={styles.backLink}>
              ← Zur Übersicht
            </Link>
          </div>

          {/* Stats bar */}
          {activities.length > 0 && (
            <div style={styles.statsBar}>
              <span style={styles.statText}>{activities.length} geladen</span>
              <span style={styles.statText}>{importedCount} importiert</span>
              <span
                style={{ ...styles.statText, color: activities.length - importedCount > 0 ? '#22c55e' : '#64748b' }}
              >
                {activities.length - importedCount} offen
              </span>
            </div>
          )}

          {/* Sport types of the loaded activities, click to hide/show */}
          {sportTypes.length > 1 && (
            <div style={styles.chipRow}>
              {sportTypes.map((sportType) => {
                const hidden = hiddenSportTypes.has(sportType)
                return (
                  <button
                    key={sportType}
                    onClick={() => toggleSportType(sportType)}
                    style={{ ...styles.chip, ...(hidden ? styles.chipHidden : {}) }}
                    title={hidden ? 'Einblenden' : 'Ausblenden'}
                  >
                    {sportTypeLabels[sportType] ?? (sportType || 'Unbekannt')}
                  </button>
                )
              })}
            </div>
          )}

          {hasLocalFilters && activities.length > 0 && (
            <div style={styles.filterHint}>
              {filtered.length} von {activities.length} geladenen Aktivitäten angezeigt
            </div>
          )}

          {/* Error */}
          {error != null && (
            <div style={styles.error}>{error instanceof Error ? error.message : 'Unbekannter Fehler'}</div>
          )}

          {/* Results */}
          {filtered.length > 0 && (
            <div style={styles.activityList}>
              {filtered.map((activity) => (
                <div
                  key={activity.id}
                  onClick={() => setSelectedId(activity.id)}
                  style={{
                    ...styles.activityCard,
                    backgroundColor: activity.imported ? '#f0fdf4' : '#fff',
                    ...(selectedId === activity.id && styles.activityCardSelected),
                  }}
                >
                  <div style={styles.activityText}>
                    {/* Line 1: date and name */}
                    <div style={styles.activityLine}>
                      <span style={styles.activityDate}>{formatDateLocal(activity.start_date_local)}</span>
                      <span style={styles.activityName} title={activity.name}>
                        {activity.name}
                      </span>
                    </div>
                    {/* Line 2: stats */}
                    <div style={styles.activityStats}>
                      <span>⏱ {activity.moving_time ? formatDuration(activity.moving_time) : '–'}</span>
                      <span>↔ {activity.distance != null ? formatDistance(activity.distance) : '–'}</span>
                      <span>↗ {activity.elevationGain != null ? `${Math.round(activity.elevationGain)} hm` : '–'}</span>
                      {activity.heart_rate_avg && <span>♥ {activity.heart_rate_avg}</span>}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      // Importing must not also select the entry
                      e.stopPropagation()
                      void handleImport(activity.id)
                    }}
                    disabled={importingId === activity.id || activity.imported}
                    title={activity.imported ? 'Bereits importiert' : 'Importieren'}
                    style={{
                      ...styles.importButton,
                      opacity: activity.imported || importingId === activity.id ? 0.5 : 1,
                    }}
                  >
                    {importingId === activity.id ? '⏳' : activity.imported ? '✓' : '📥'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Load more button */}
          {hasMore && (
            <button onClick={handleLoadMore} disabled={isLoadingActivities} style={styles.loadMoreButton}>
              {isLoadingActivities ? '⏳ Lade...' : `Mehr laden (${perPage} weitere)`}
            </button>
          )}

          {/* Empty state */}
          {!isLoadingActivities && activities.length === 0 && !error && (
            <div style={styles.placeholder}>Klicke "Aktualisieren" um deine Strava-Aktivitäten zu importieren</div>
          )}
        </div>

        {/* Map: preview of the selected activity */}
        <div style={styles.mapArea}>
          <Map onMapReady={setMap} />
          {!selectedActivity && activities.length > 0 && (
            <div style={styles.mapHint}>Aktivität anklicken, um die Strecke anzuzeigen</div>
          )}
          {selectedActivity && !selectedActivity.summary_polyline && (
            <div style={styles.mapHint}>Für diese Aktivität liefert Strava keine Strecke (z. B. Indoor)</div>
          )}
        </div>
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
  input: {
    padding: '6px 8px',
    fontSize: 13,
    border: '1px solid #ccc',
    borderRadius: 4,
    backgroundColor: '#fff',
  } as const,
  searchInput: {
    width: 200,
  } as const,
  numberInput: {
    width: 80,
  } as const,
  checkboxGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
    fontSize: 13,
    color: '#1e293b',
  } as const,
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    cursor: 'pointer',
  } as const,
  resetButton: {
    padding: '6px 10px',
    fontSize: 13,
    border: 'none',
    backgroundColor: 'transparent',
    color: '#3b82f6',
    cursor: 'pointer',
  } as const,
  chipRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 6,
  } as const,
  chip: {
    padding: '2px 10px',
    fontSize: 12,
    borderRadius: 12,
    border: '1px solid #3b82f6',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    cursor: 'pointer',
  } as const,
  chipHidden: {
    border: '1px solid #cbd5e1',
    backgroundColor: '#fff',
    color: '#94a3b8',
    textDecoration: 'line-through',
  } as const,
  filterHint: {
    fontSize: 12,
    color: '#64748b',
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
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
  } as const,
  mapArea: {
    flex: 1,
    position: 'relative',
    minWidth: 0,
  } as const,
  mapHint: {
    position: 'absolute' as const,
    top: 12,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
    padding: '6px 12px',
    fontSize: 13,
    color: '#1e293b',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 6,
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2)',
    pointerEvents: 'none' as const,
  } as const,
  headingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  } as const,
  backLink: {
    fontSize: 13,
    color: '#3b82f6',
    textDecoration: 'none',
  } as const,
  heading: {
    margin: 0,
    fontSize: 20,
    fontWeight: 600,
    color: '#1e293b',
  } as const,
  statsBar: {
    display: 'flex',
    gap: 12,
    padding: '8px 12px',
    backgroundColor: '#fff',
    borderRadius: 6,
    fontSize: 12,
    color: '#64748b',
    border: '1px solid #e0e0e0',
  } as const,
  statText: {
    fontWeight: 500,
  } as const,
  loadButton: {
    padding: '6px 14px',
    fontSize: 13,
    fontWeight: 500,
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  } as const,
  loadMoreButton: {
    width: '100%',
    padding: '10px 16px',
    fontSize: 14,
    fontWeight: 500,
    backgroundColor: '#fff',
    color: '#3b82f6',
    border: '1px solid #3b82f6',
    borderRadius: 6,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  } as const,
  error: {
    padding: '8px 12px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: 6,
    fontSize: 13,
  } as const,
  activityList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
  } as const,
  activityCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 10px',
    borderRadius: 6,
    border: '1px solid #e0e0e0',
    cursor: 'pointer',
  } as const,
  activityCardSelected: {
    border: '1px solid #e11d48',
    boxShadow: 'inset 3px 0 0 #e11d48',
  } as const,
  activityText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
  } as const,
  activityLine: {
    display: 'flex',
    alignItems: 'baseline',
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
  activityName: {
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
    whiteSpace: 'nowrap' as const,
  } as const,
  importButton: {
    padding: '4px 10px',
    fontSize: 16,
    backgroundColor: 'transparent',
    border: '1px solid #ccc',
    borderRadius: 4,
    cursor: 'pointer',
    flexShrink: 0,
  } as const,
  placeholder: {
    padding: 32,
    textAlign: 'center' as const,
    color: '#64748b',
    fontSize: 14,
  } as const,
}

export default SyncPage
