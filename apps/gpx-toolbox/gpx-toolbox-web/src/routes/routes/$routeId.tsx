import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'

import { parseGpx } from '@plusone/gpx-toolbox-utils'
import {
  getGetRouteQueryKey,
  getListFahrtenQueryKey,
  useCreateFahrt,
  useDeleteFahrt,
  useGetRoute,
} from '@plusone/gpx-toolbox-api-client'

import { SegmentMap } from '../../components/SegmentMap'
import { SidebarDivider, SidebarLayout } from '../../components/SidebarLayout'
import { TrackAnalysis } from '../../components/TrackAnalysis'
import { useSegmentRange } from '../../hooks/useSegmentRange'

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

export const Route = createFileRoute('/routes/$routeId')({
  component: RouteDetailPage,
})

function RouteDetailPage() {
  const { routeId } = Route.useParams()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [formRiddenAt, setFormRiddenAt] = useState(new Date().toISOString().slice(0, 16))
  const [formTitle, setFormTitle] = useState('')
  const [formDuration, setFormDuration] = useState('')
  const [formAvgHr, setFormAvgHr] = useState('')
  const [formMaxHr, setFormMaxHr] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const { data: route, isLoading, error, isError } = useGetRoute(routeId)

  // Fetch GPX content for selected route using direct fetch (same as index.tsx)
  const [gpxText, setGpxText] = useState<string | null>(null)

  useEffect(() => {
    if (!routeId) return
    setGpxText(null)

    const token = localStorage.getItem('gpx-toolbox-jwt')
    if (!token) {
      console.error('[RouteDetailPage] No auth token found (key: gpx-toolbox-jwt)')
      return
    }

    fetch(`/api/routes/${routeId}/export`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorText = await response.text()
          console.error('[RouteDetailPage] HTTP error:', response.status, errorText)
          return
        }
        const text = await response.text()
        setGpxText(text)
      })
      .catch((err) => {
        console.error('[RouteDetailPage] Fetch error:', err)
      })
  }, [routeId])

  const points = useMemo(() => (gpxText ? parseGpx(gpxText) : []), [gpxText])
  const { totalDistKm, segmentRange, setSegmentRange } = useSegmentRange(points)

  const createFahrtMutation = useCreateFahrt({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getGetRouteQueryKey(routeId) })
        void queryClient.invalidateQueries({ queryKey: getListFahrtenQueryKey(routeId) })
        setShowForm(false)
        setFormRiddenAt(new Date().toISOString().slice(0, 16))
        setFormTitle('')
        setFormDuration('')
        setFormAvgHr('')
        setFormMaxHr('')
        setFormNotes('')
        setFormError(null)
      },
    },
  })

  const deleteFahrtMutation = useDeleteFahrt({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getGetRouteQueryKey(routeId) })
        void queryClient.invalidateQueries({ queryKey: getListFahrtenQueryKey(routeId) })
      },
    },
  })

  async function handleCreateFahrt(e: React.FormEvent) {
    e.preventDefault()
    setFormSubmitting(true)
    setFormError(null)
    try {
      const body: Record<string, unknown> = { riddenAt: formRiddenAt }
      if (formTitle) body.title = formTitle
      if (formDuration) body.duration = parseInt(formDuration, 10)
      if (formAvgHr) body.avgHr = parseInt(formAvgHr, 10)
      if (formMaxHr) body.maxHr = parseInt(formMaxHr, 10)
      if (formNotes) body.notes = formNotes
      await createFahrtMutation.mutateAsync({ routeId, data: body as never })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unbekannter Fehler')
    } finally {
      setFormSubmitting(false)
    }
  }

  async function handleDeleteFahrt(fahrtId: string) {
    if (!confirm('Fahrt wirklich löschen?')) return
    try {
      await deleteFahrtMutation.mutateAsync({ routeId, id: fahrtId })
    } catch {
      // Error handled by mutation
    }
  }

  if (isLoading) return <div style={styles.loading}>Lade...</div>
  if (isError) return <div style={styles.error}>{error instanceof Error ? error.message : 'Unbekannter Fehler'}</div>
  if (!route) return <div style={styles.error}>Route nicht gefunden</div>

  const fahrten = route.fahrten ?? []

  return (
    <div style={styles.container}>
      <SidebarLayout
        header={
          <Link to="/" style={styles.backLink}>
            ← Zurück zur Übersicht
          </Link>
        }
      >
        <div>
          <h2 style={styles.heading}>{route.name}</h2>

          {route.description && (
            <p style={styles.description}>{(route.description as unknown as string | null) ?? ''}</p>
          )}

          <div style={styles.meta}>
            <span style={{ ...styles.badge, backgroundColor: sourceColors[route.source] || '#9e9e9e' }}>
              {sourceLabels[route.source] || route.source}
            </span>
            <span style={{ ...styles.badge, backgroundColor: statusColors[route.status] || '#9e9e9e' }}>
              {statusLabels[route.status] || route.status}
            </span>
          </div>

          {route.stats && points.length < 2 && (
            <div style={styles.stats}>
              <div style={styles.statRow}>
                <span style={styles.statLabel}>Distanz</span>
                <span style={styles.statValue}>
                  {formatDistance((route.stats as { distance?: number } | null)?.distance ?? 0)}
                </span>
              </div>
              <div style={styles.statRow}>
                <span style={styles.statLabel}>Höhenmeter ↑</span>
                <span style={styles.statValue}>
                  {formatElevation((route.stats as { elevationGain?: number } | null)?.elevationGain ?? 0)}
                </span>
              </div>
              <div style={styles.statRow}>
                <span style={styles.statLabel}>Abstieg ↓</span>
                <span style={styles.statValue}>
                  {formatElevation((route.stats as { elevationLoss?: number } | null)?.elevationLoss ?? 0)}
                </span>
              </div>
            </div>
          )}

          {route.ratingTags && route.ratingTags.length > 0 && (
            <div style={styles.tags}>
              {(route.ratingTags as Array<string>).map((tag) => (
                <span key={tag} style={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {route.notes && <p style={styles.notes}>{(route.notes as unknown as string | null) ?? ''}</p>}
        </div>

        {points.length >= 2 && (
          <>
            <SidebarDivider />
            <TrackAnalysis points={points} range={segmentRange} onRangeChange={setSegmentRange} name={route.name} />
          </>
        )}

        <SidebarDivider />

        {/* Fahrten */}
        <div style={styles.fahrtenSection}>
          <div style={styles.fahrtenHeader}>
            <h3 style={styles.fahrtenHeading}>Fahrten ({fahrten.length})</h3>
            <button onClick={() => setShowForm(!showForm)} style={styles.addButton}>
              + Fahrt
            </button>
          </div>

          {/* Create Fahrt Form */}
          {showForm && (
            <form onSubmit={handleCreateFahrt} style={styles.form}>
              <input
                type="datetime-local"
                value={formRiddenAt}
                onChange={(e) => setFormRiddenAt(e.target.value)}
                required
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Titel"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                style={styles.input}
              />
              <input
                type="number"
                placeholder="Dauer (Sek)"
                value={formDuration}
                onChange={(e) => setFormDuration(e.target.value)}
                style={styles.input}
              />
              <input
                type="number"
                placeholder="Ø HR"
                value={formAvgHr}
                onChange={(e) => setFormAvgHr(e.target.value)}
                style={styles.input}
              />
              <input
                type="number"
                placeholder="Max HR"
                value={formMaxHr}
                onChange={(e) => setFormMaxHr(e.target.value)}
                style={styles.input}
              />
              <textarea
                placeholder="Notizen"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                style={styles.textarea}
              />
              {formError && <div style={styles.error}>{formError}</div>}
              <div style={styles.formActions}>
                <button type="submit" disabled={formSubmitting} style={styles.submitButton}>
                  {formSubmitting ? 'Speichern...' : 'Speichern'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setFormTitle('')
                  }}
                  style={styles.cancelButton}
                >
                  Abbrechen
                </button>
              </div>
            </form>
          )}

          {/* Fahrten Liste */}
          {(
            fahrten as Array<{
              id: string
              riddenAt: Date
              title: string | null
              duration: number | null
              avgHr: number | null
              maxHr: number | null
              notes: string | null
              weather: string | null
            }>
          ).map((f) => (
            <div key={f.id} style={styles.fahrtCard}>
              <div style={styles.fahrtHeader}>
                <span style={styles.fahrtDate}>{new Date(f.riddenAt).toLocaleDateString('de-DE')}</span>
                <button onClick={() => handleDeleteFahrt(f.id)} style={styles.deleteButton}>
                  🗑
                </button>
              </div>
              <div style={styles.fahrtStats}>
                {f.duration && <span>{formatDuration(f.duration as number)}</span>}
                {f.avgHr && <span>Ø HR {f.avgHr as number}</span>}
                {f.maxHr && <span>Max HR {f.maxHr as number}</span>}
              </div>
              {f.title && <div style={styles.fahrtTitle}>{f.title as string}</div>}
              {f.notes && <div style={styles.fahrtNotes}>{f.notes as string}</div>}
              {f.weather && (
                <div style={styles.fahrtWeather}>
                  {(() => {
                    try {
                      const w = JSON.parse(typeof f.weather === 'string' ? f.weather : JSON.stringify(f.weather))
                      return (
                        <>
                          {w.temperature2m?.min != null && (
                            <span>
                              🌡 {w.temperature2m.min}°-{w.temperature2m.max}°
                            </span>
                          )}
                          {w.rain?.sum != null && <span>🌧 {w.rain.sum} mm</span>}
                        </>
                      )
                    } catch {
                      return null
                    }
                  })()}
                </div>
              )}
            </div>
          ))}
        </div>
      </SidebarLayout>

      <SegmentMap points={points} range={segmentRange} totalDistKm={totalDistKm} />
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
  return `${Math.round(meters)} hm`
}

function formatDuration(seconds: number): string {
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
  backLink: {
    display: 'block',
    fontSize: 13,
    color: '#60a5fa',
    textDecoration: 'none',
  } as const,
  heading: {
    margin: '0 0 8px',
    fontSize: 22,
    fontWeight: 600,
    color: '#f8fafc',
  } as const,
  description: {
    margin: '0 0 12px',
    fontSize: 14,
    color: '#94a3b8',
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
  stats: {
    backgroundColor: 'rgba(255,255,255,0.05)',
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
    color: '#94a3b8',
  } as const,
  statValue: {
    fontSize: 14,
    fontWeight: 600,
    color: '#e2e8f0',
  } as const,
  tags: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 4,
    marginBottom: 12,
  } as const,
  tag: {
    padding: '2px 8px',
    borderRadius: 8,
    fontSize: 11,
    backgroundColor: '#312e81',
    color: '#c7d2fe',
  } as const,
  notes: {
    fontSize: 13,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginBottom: 12,
  } as const,
  fahrtenSection: {} as const,
  fahrtenHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  } as const,
  fahrtenHeading: {
    margin: 0,
    fontSize: 16,
    fontWeight: 600,
    color: '#f8fafc',
  } as const,
  addButton: {
    padding: '4px 12px',
    fontSize: 13,
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
  } as const,
  form: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
  } as const,
  input: {
    padding: '6px 8px',
    fontSize: 13,
    border: '1px solid #475569',
    backgroundColor: '#0f172a',
    color: '#e2e8f0',
    borderRadius: 4,
  } as const,
  textarea: {
    padding: '6px 8px',
    fontSize: 13,
    border: '1px solid #475569',
    backgroundColor: '#0f172a',
    color: '#e2e8f0',
    borderRadius: 4,
    resize: 'vertical' as const,
    minHeight: 40,
  } as const,
  formActions: {
    display: 'flex',
    gap: 8,
  } as const,
  submitButton: {
    flex: 1,
    padding: '6px 12px',
    fontSize: 13,
    backgroundColor: '#22c55e',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
  } as const,
  cancelButton: {
    padding: '6px 12px',
    fontSize: 13,
    backgroundColor: 'transparent',
    color: '#cbd5e1',
    border: '1px solid #475569',
    borderRadius: 4,
    cursor: 'pointer',
  } as const,
  error: {
    padding: '8px 12px',
    backgroundColor: 'rgba(239,68,68,0.15)',
    color: '#fca5a5',
    borderRadius: 4,
    fontSize: 13,
    marginBottom: 12,
  } as const,
  loading: {
    padding: 32,
    textAlign: 'center' as const,
    color: '#666',
  } as const,
  fahrtCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    border: '1px solid #334155',
  } as const,
  fahrtHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  } as const,
  fahrtDate: {
    fontSize: 13,
    fontWeight: 600,
    color: '#f8fafc',
  } as const,
  deleteButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 14,
    opacity: 0.5,
  } as const,
  fahrtStats: {
    display: 'flex',
    gap: 12,
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  } as const,
  fahrtNotes: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginTop: 4,
  } as const,
  fahrtTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#f8fafc',
    marginTop: 4,
  } as const,
  fahrtWeather: {
    display: 'flex',
    gap: 8,
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  } as const,
}
