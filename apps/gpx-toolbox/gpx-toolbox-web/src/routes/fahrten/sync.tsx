import { useCallback, useEffect, useRef, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'

import { useImportAllStravaActivities, useImportStravaActivity } from '@plusone/gpx-toolbox-api-client'
import { customAxiosInstance } from '@plusone/gpx-toolbox-api-client'

export const Route = createFileRoute('/fahrten/sync')({
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
  routeId?: string
  imported: boolean
}

type StravaActivitiesResponse = {
  items: Array<PaginatedStravaActivity>
  page: number
  per_page: number
  hasMore: boolean
}

function SyncPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [limit, setLimit] = useState(100)
  const [importingId, setImportingId] = useState<number | null>(null)

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
        url: `/api/routes/strava-activities?page=${pageNum}&per_page=${effectivePerPage}`,
        method: 'GET',
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
    setLimit(newLimit)
    // Pass newLimit directly to avoid stale closure
    void loadActivities(1, false, newLimit)
  }

  const importAllMutation = useImportAllStravaActivities({
    mutation: {
      onSuccess: () => {
        void handleRefresh()
      },
    },
  })

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

  const handleImportAll = async () => {
    await importAllMutation.mutateAsync({ params: { limit: String(limit) } })
  }

  const filtered = activities.filter((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
  const importedCount = activities.filter((a) => a.imported).length

  // Load initial data on mount
  useEffect(() => {
    void loadActivities(1)
  }, [])

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <Link to="/fahrten" style={styles.backLink}>
          ← Zurück zur Übersicht
        </Link>

        <h2 style={styles.heading}>Strava Sync</h2>

        {/* Stats bar */}
        {activities.length > 0 && (
          <div style={styles.statsBar}>
            <span style={styles.statText}>{activities.length} Aktivitäten gesamt</span>
            <span style={styles.statText}>{importedCount} importiert</span>
            <span style={{ ...styles.statText, color: activities.length - importedCount > 0 ? '#22c55e' : '#64748b' }}>
              {activities.length - importedCount} offen
            </span>
          </div>
        )}

        {/* Search */}
        <input
          type="text"
          placeholder="Aktivitäten durchsuchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />

        {/* Limit selector */}
        <div style={styles.limitRow}>
          <label style={styles.limitLabel}>Pro Seite:</label>
          <select
            value={perPage}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
            style={styles.limitSelect}
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
        </div>

        {/* Buttons */}
        <div style={styles.buttonRow}>
          <button onClick={handleRefresh} disabled={isLoadingActivities} style={styles.loadButton}>
            {isLoadingActivities && !hasMore ? '⏳ Lade...' : '📥 Syncen'}
          </button>
          <button onClick={handleImportAll} disabled={importAllMutation.isPending} style={styles.batchButton}>
            {importAllMutation.isPending ? '⏳ Sync...' : '📥 Alle syncen'}
          </button>
        </div>

        {/* Load more button */}
        {hasMore && (
          <button onClick={handleLoadMore} disabled={isLoadingActivities} style={styles.loadMoreButton}>
            {isLoadingActivities ? '⏳ Lade...' : `Mehr laden (${perPage} weitere)`}
          </button>
        )}

        {/* Error */}
        {error && <div style={styles.error}>{error instanceof Error ? error.message : 'Unbekannter Fehler'}</div>}

        {/* Import result toast */}
        {importAllMutation.isSuccess && importAllMutation.variables?.params?.limit && (
          <div style={styles.toast}>✓ Sync abgeschlossen</div>
        )}

        {/* Results */}
        {filtered.length > 0 && (
          <div style={styles.activityList}>
            {filtered.map((activity) => (
              <div
                key={activity.id}
                style={{
                  ...styles.activityCard,
                  backgroundColor: activity.imported ? '#f0fdf4' : '#fff',
                }}
              >
                <div style={styles.activityHeader}>
                  <span style={styles.activityName}>
                    {activity.imported && '✓ '}
                    {activity.name}
                  </span>
                  <button
                    onClick={() => void handleImport(activity.id)}
                    disabled={importingId === activity.id || activity.imported}
                    style={{
                      ...styles.importButton,
                      opacity: activity.imported || importingId === activity.id ? 0.5 : 1,
                    }}
                  >
                    {importingId === activity.id ? '⏳' : activity.imported ? '✓' : '📥'}
                  </button>
                </div>

                <div style={styles.activityStats}>
                  {activity.distance != null && <span>{formatDistance(activity.distance)}</span>}
                  {activity.moving_time && <span>{formatDuration(activity.moving_time)}</span>}
                  {activity.heart_rate_avg && <span>Ø {activity.heart_rate_avg} bpm</span>}
                  {activity.heart_rate_max && <span>Max {activity.heart_rate_max} bpm</span>}
                </div>

                <div style={styles.activityDate}>{formatDateLocal(activity.start_date_local)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoadingActivities && activities.length === 0 && !error && (
          <div style={styles.placeholder}>Klicke "Syncen" um deine Strava-Aktivitäten als Fahrten zu importieren</div>
        )}
      </div>

      {/* Map area (empty, sync overview) */}
      <div style={styles.mapArea}>
        <div style={styles.mapPlaceholder}>
          {activities.length > 0 ? (
            <span style={styles.countBadge}>{activities.length}</span>
          ) : (
            <span style={styles.mapText}>Strava-Aktivitäten importieren</span>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    height: '100%',
    width: '100%',
  } as const,
  sidebar: {
    width: 420,
    flexShrink: 0,
    overflowY: 'auto',
    borderRight: '1px solid #e0e0e0',
    padding: 16,
    backgroundColor: '#fafafa',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
  } as const,
  mapArea: {
    flex: 1,
    position: 'relative',
    minWidth: 0,
    backgroundColor: '#e8f5e9',
  } as const,
  mapPlaceholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative' as const,
  } as const,
  mapText: {
    fontSize: 14,
    color: '#64748b',
  } as const,
  countBadge: {
    fontSize: 48,
    fontWeight: 700,
    color: '#16a34a',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: '16px 32px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  } as const,
  backLink: {
    display: 'block',
    marginBottom: 4,
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
  searchInput: {
    width: '100%',
    padding: '8px 12px',
    fontSize: 13,
    border: '1px solid #ccc',
    borderRadius: 6,
    boxSizing: 'border-box' as const,
  } as const,
  limitRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  } as const,
  limitLabel: {
    fontSize: 13,
    color: '#64748b',
  } as const,
  limitSelect: {
    flex: 1,
    padding: '6px 8px',
    fontSize: 13,
    border: '1px solid #ccc',
    borderRadius: 4,
    backgroundColor: '#fff',
  } as const,
  buttonRow: {
    display: 'flex',
    gap: 8,
  } as const,
  loadButton: {
    flex: 1,
    padding: '10px 16px',
    fontSize: 14,
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
  batchButton: {
    flex: 1,
    padding: '10px 16px',
    fontSize: 14,
    fontWeight: 500,
    backgroundColor: '#16a34a',
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
    gap: 8,
  } as const,
  activityCard: {
    padding: 12,
    borderRadius: 8,
    border: '1px solid #e0e0e0',
  } as const,
  activityHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  } as const,
  activityName: {
    fontWeight: 600,
    fontSize: 14,
    color: '#1e293b',
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
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
  activityStats: {
    display: 'flex',
    gap: 12,
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  } as const,
  activityDate: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  } as const,
  toast: {
    padding: '10px 16px',
    backgroundColor: '#dcfce7',
    color: '#166534',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    border: '1px solid #bbf7d0',
  } as const,
  placeholder: {
    padding: 32,
    textAlign: 'center' as const,
    color: '#64748b',
    fontSize: 14,
  } as const,
}

export default SyncPage
