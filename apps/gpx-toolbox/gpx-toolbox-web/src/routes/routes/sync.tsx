import { useCallback, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'

import { useAuth } from '../../lib/auth-context'

export const Route = createFileRoute('/routes/sync')({
  component: SyncPage,
})

type StravaRouteSummary = {
  stravaId: number
  stravaIdStr: string
  name: string
  description?: string
  distance?: number
  elevationGain?: number
  imported: boolean
}

type ImportResult = {
  imported: number
  matched: number
  newRoutes: number
}

function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`
  return `${Math.round(meters)} m`
}

function formatElevation(meters: number): string {
  return `${Math.round(meters)} hm`
}

function SyncPage() {
  const { token } = useAuth()
  const [routes, setRoutes] = useState<Array<StravaRouteSummary>>([])
  const [loading, setLoading] = useState(false)
  const [importingId, setImportingId] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [hasLoaded, setHasLoaded] = useState(false)

  const fetchRoutes = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    setHasLoaded(false)
    try {
      const response = await fetch('/api/import/strava/routes', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      setRoutes(data)
      setHasLoaded(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
    } finally {
      setLoading(false)
    }
  }, [token])

  const handleImport = useCallback(
    async (stravaIdStr: string) => {
      if (!token) return
      setImportingId(stravaIdStr)
      setImportResult(null)
      try {
        const response = await fetch(`/api/import/strava/routes/${stravaIdStr}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const result: ImportResult = await response.json()
        setImportResult(result)
        // Update imported flag in local list
        setRoutes((prev) => prev.map((r) => (r.stravaIdStr === stravaIdStr ? { ...r, imported: true } : r)))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Import fehlgeschlagen')
      } finally {
        setImportingId(null)
      }
    },
    [token],
  )

  const filtered = routes.filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const importedCount = routes.filter((r) => r.imported).length

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <Link to="/" style={styles.backLink}>
          ← Zurück zur Übersicht
        </Link>

        <h2 style={styles.heading}>Strava Sync</h2>

        {/* Stats bar */}
        {routes.length > 0 && (
          <div style={styles.statsBar}>
            <span style={styles.statText}>{routes.length} Routen insgesamt</span>
            <span style={styles.statText}>{importedCount} importiert</span>
            <span style={{ ...styles.statText, color: routes.length - importedCount > 0 ? '#22c55e' : '#64748b' }}>
              {routes.length - importedCount} offen
            </span>
          </div>
        )}

        {/* Search */}
        <input
          type="text"
          placeholder="Routen durchsuchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />

        {/* Load button */}
        <button onClick={fetchRoutes} disabled={loading} style={styles.loadButton}>
          {loading ? '⏳ Lade...' : '📥 Routen laden'}
        </button>

        {/* Error */}
        {error && <div style={styles.error}>{error}</div>}

        {/* Results */}
        {filtered.length > 0 && (
          <div style={styles.routeList}>
            {filtered.map((route) => (
              <div
                key={route.stravaIdStr}
                style={{
                  ...styles.routeCard,
                  backgroundColor: route.imported ? '#f0fdf4' : '#fff',
                }}
              >
                <div style={styles.routeHeader}>
                  <span style={styles.routeName}>
                    {route.imported && '✓ '}
                    {route.name}
                  </span>
                  <button
                    onClick={() => void handleImport(route.stravaIdStr)}
                    disabled={importingId === route.stravaIdStr || route.imported}
                    style={{
                      ...styles.importButton,
                      opacity: route.imported || importingId === route.stravaIdStr ? 0.5 : 1,
                    }}
                  >
                    {importingId === route.stravaIdStr ? '⏳' : route.imported ? '✓' : '📥'}
                  </button>
                </div>

                {route.distance != null && (
                  <div style={styles.routeStats}>
                    <span>{formatDistance(route.distance)}</span>
                    {route.elevationGain != null && <span>{formatElevation(route.elevationGain)}</span>}
                  </div>
                )}

                {route.description && <div style={styles.routeDescription}>{route.description}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Import result toast */}
        {importResult && importResult.newRoutes > 0 && (
          <div style={styles.toast}>
            ✓ {importResult.newRoutes} neue Route{importResult.newRoutes > 1 ? 'n' : ''} importiert
          </div>
        )}

        {/* Empty state */}
        {routes.length === 0 && !loading && !error && (
          <div style={styles.placeholder}>
            {hasLoaded
              ? 'Du hast keine Routen bei Strava hinterlegt.'
              : 'Klicke "Routen laden" um deine Strava-Routen anzusehen'}
          </div>
        )}
      </div>

      {/* Map area (empty, sync overview) */}
      <div style={styles.mapArea}>
        <div style={styles.mapPlaceholder}>
          {routes.length > 0 ? (
            <span style={styles.countBadge}>{routes.length}</span>
          ) : (
            <span style={styles.mapText}>Strava Routen auswählen und importieren</span>
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
  loadButton: {
    width: '100%',
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
  error: {
    padding: '8px 12px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: 6,
    fontSize: 13,
  } as const,
  routeList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
  } as const,
  routeCard: {
    padding: 12,
    borderRadius: 8,
    border: '1px solid #e0e0e0',
  } as const,
  routeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  } as const,
  routeName: {
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
  routeStats: {
    display: 'flex',
    gap: 12,
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  } as const,
  routeDescription: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    fontStyle: 'italic',
  } as const,
  placeholder: {
    padding: 32,
    textAlign: 'center' as const,
    color: '#64748b',
    fontSize: 14,
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
}

export default SyncPage
