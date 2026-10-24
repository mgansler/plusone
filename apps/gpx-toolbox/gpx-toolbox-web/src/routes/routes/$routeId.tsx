import { useState, useEffect, useRef, type RefObject } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import type L from 'leaflet'

import { apiFetch } from '../../lib/api-client'
import { Map } from '../../components/Map'

type RouteDetail = {
  id: string
  name: string
  description: string | null
  source: string
  status: string
  ratingTags: Array<string>
  notes: string | null
  stats: { distance?: number; elevationGain?: number; elevationLoss?: number } | null
  polyline: unknown
  fahrten: Array<{
    id: string
    riddenAt: string
    duration: number | null
    avgHr: number | null
    maxHr: number | null
    notes: string | null
    weather: string | null
  }>
  createdAt: string
  updatedAt: string
}

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
  const mapRef: RefObject<L.Map | null> = useRef(null)
  const { routeId } = Route.useParams()
  const [route, setRoute] = useState<RouteDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formRiddenAt, setFormRiddenAt] = useState(new Date().toISOString().slice(0, 16))
  const [formDuration, setFormDuration] = useState('')
  const [formAvgHr, setFormAvgHr] = useState('')
  const [formMaxHr, setFormMaxHr] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await apiFetch(`/api/routes/${routeId}`)
        if (!res.ok) throw new Error('API request failed')
        const data: RouteDetail = await res.json()
        if (!cancelled) setRoute(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [routeId])

  async function handleCreateFahrt(e: React.FormEvent) {
    e.preventDefault()
    setFormSubmitting(true)
    setFormError(null)
    try {
      const body: Record<string, any> = { riddenAt: formRiddenAt }
      if (formDuration) body.duration = parseInt(formDuration, 10)
      if (formAvgHr) body.avgHr = parseInt(formAvgHr, 10)
      if (formMaxHr) body.maxHr = parseInt(formMaxHr, 10)
      if (formNotes) body.notes = formNotes
      const res = await apiFetch(`/api/routes/${routeId}/fahrten`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Fahrt erstellen fehlgeschlagen')
      setShowForm(false)
      // Reload route
      const reloadRes = await apiFetch(`/api/routes/${routeId}`)
      if (reloadRes.ok) {
        const data: RouteDetail = await reloadRes.json()
        setRoute(data)
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unbekannter Fehler')
    } finally {
      setFormSubmitting(false)
    }
  }

  async function handleDeleteFahrt(fahrtId: string) {
    if (!confirm('Fahrt wirklich löschen?')) return
    try {
      const res = await apiFetch(`/api/routes/${routeId}/fahrten/${fahrtId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Fahrt löschen fehlgeschlagen')
      // Reload route
      const reloadRes = await apiFetch(`/api/routes/${routeId}`)
      if (reloadRes.ok) {
        const data: RouteDetail = await reloadRes.json()
        setRoute(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
    }
  }

  if (loading) return <div style={styles.loading}>Lade...</div>
  if (error) return <div style={styles.error}>{error}</div>
  if (!route) return <div style={styles.error}>Route nicht gefunden</div>

  const stats = route.stats as { distance?: number; elevationGain?: number; elevationLoss?: number } | null

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <Link to="/routes" style={styles.backLink}>
          ← Zurück zur Übersicht
        </Link>

        <h2 style={styles.heading}>{route.name}</h2>

        {route.description && <p style={styles.description}>{route.description}</p>}

        <div style={styles.meta}>
          <span style={{ ...styles.badge, backgroundColor: sourceColors[route.source] || '#9e9e9e' }}>
            {sourceLabels[route.source] || route.source}
          </span>
          <span style={{ ...styles.badge, backgroundColor: statusColors[route.status] || '#9e9e9e' }}>
            {statusLabels[route.status] || route.status}
          </span>
        </div>

        {stats && (
          <div style={styles.stats}>
            <div style={styles.statRow}>
              <span style={styles.statLabel}>Distanz</span>
              <span style={styles.statValue}>{formatDistance(stats.distance ?? 0)}</span>
            </div>
            <div style={styles.statRow}>
              <span style={styles.statLabel}>Höhenmeter ↑</span>
              <span style={styles.statValue}>{formatElevation(stats.elevationGain ?? 0)}</span>
            </div>
            <div style={styles.statRow}>
              <span style={styles.statLabel}>Höhenmeter ↓</span>
              <span style={styles.statValue}>{formatElevation(stats.elevationLoss ?? 0)}</span>
            </div>
          </div>
        )}

        {route.ratingTags && route.ratingTags.length > 0 && (
          <div style={styles.tags}>
            {route.ratingTags.map((tag) => (
              <span key={tag} style={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {route.notes && <p style={styles.notes}>{route.notes}</p>}

        {/* Fahrten */}
        <div style={styles.fahrtenSection}>
          <div style={styles.fahrtenHeader}>
            <h3 style={styles.fahrtenHeading}>Fahrten ({route.fahrten.length})</h3>
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
                <button type="button" onClick={() => setShowForm(false)} style={styles.cancelButton}>
                  Abbrechen
                </button>
              </div>
            </form>
          )}

          {/* Fahrten Liste */}
          {route.fahrten.map((f) => (
            <div key={f.id} style={styles.fahrtCard}>
              <div style={styles.fahrtHeader}>
                <span style={styles.fahrtDate}>{new Date(f.riddenAt).toLocaleDateString('de-DE')}</span>
                <button onClick={() => handleDeleteFahrt(f.id)} style={styles.deleteButton}>
                  🗑
                </button>
              </div>
              <div style={styles.fahrtStats}>
                {f.duration && <span>{formatDuration(f.duration)}</span>}
                {f.avgHr && <span>Ø HR {f.avgHr}</span>}
                {f.maxHr && <span>Max HR {f.maxHr}</span>}
              </div>
              {f.notes && <div style={styles.fahrtNotes}>{f.notes}</div>}
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
    fontSize: 22,
    fontWeight: 600,
    color: '#1e293b',
  } as const,
  description: {
    margin: '0 0 12px',
    fontSize: 14,
    color: '#64748b',
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
    backgroundColor: '#e0e7ff',
    color: '#3730a1',
  } as const,
  notes: {
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
    marginBottom: 12,
  } as const,
  fahrtenSection: {
    marginTop: 16,
  } as const,
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
    color: '#1e293b',
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
    backgroundColor: '#fff',
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
    border: '1px solid #ccc',
    borderRadius: 4,
  } as const,
  textarea: {
    padding: '6px 8px',
    fontSize: 13,
    border: '1px solid #ccc',
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
    backgroundColor: '#fff',
    color: '#666',
    border: '1px solid #ccc',
    borderRadius: 4,
    cursor: 'pointer',
  } as const,
  error: {
    padding: '8px 12px',
    backgroundColor: '#ffebee',
    color: '#c62828',
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
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    border: '1px solid #e0e0e0',
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
    color: '#1e293b',
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
    color: '#64748b',
    marginBottom: 4,
  } as const,
  fahrtNotes: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 4,
  } as const,
  fahrtWeather: {
    display: 'flex',
    gap: 8,
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  } as const,
}
