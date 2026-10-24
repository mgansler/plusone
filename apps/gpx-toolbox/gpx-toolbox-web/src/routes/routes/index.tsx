import { useState, useEffect, useRef, type RefObject } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import type L from 'leaflet'

import { useListRoutes } from '@plusone/gpx-toolbox-api-client'
import { Map } from '../../components/Map'

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
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null)

  const { data, isLoading, error, isError } = useListRoutes({
    page,
    limit: 50,
    sortBy,
    ...(statusFilter && { status: statusFilter }),
    ...(sourceFilter && { source: sourceFilter }),
  })

  const routes = data?.items ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0

  function handleRouteClick(route: (typeof routes)[number]) {
    setSelectedRoute(selectedRoute === route.id ? null : route.id)
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
        <h2 style={styles.heading}>Routen ({total})</h2>

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
                  backgroundColor: selectedRoute === r.id ? '#e3f2fd' : '#fff',
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

      {/* Map */}
      <div style={styles.mapArea}>
        <Map mapRef={mapRef} />
      </div>
    </div>
  )
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
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)}k hm`
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
  heading: {
    margin: '0 0 12px',
    fontSize: 20,
    fontWeight: 600,
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
