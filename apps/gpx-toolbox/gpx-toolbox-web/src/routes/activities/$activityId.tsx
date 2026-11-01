import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'

import { calculateAvgSpeed, calculateTotalDistance, parseGpx, type TrackPoint } from '@plusone/gpx-toolbox-utils'
import {
  getGetActivityQueryKey,
  getGetRouteQueryKey,
  getListAllActivitiesQueryKey,
  useDeleteActivity,
  useGetActivity,
} from '@plusone/gpx-toolbox-api-client'

import { ConfirmDialog } from '../../components/ConfirmDialog'
import { SegmentMap } from '../../components/SegmentMap'
import { SidebarDivider, SidebarLayout } from '../../components/SidebarLayout'
import { TrackAnalysis } from '../../components/TrackAnalysis'
import { useSegmentRange } from '../../hooks/useSegmentRange'
import { formatDistance, formatDuration } from '../../utils/format'
import { routeStatusColor, routeStatusLabel } from '../../utils/routeStatus'

export const Route = createFileRoute('/activities/$activityId')({
  component: ActivityDetailPage,
  beforeLoad: async () => {
    const token = localStorage.getItem('gpx-toolbox-jwt')
    if (!token) {
      throw redirect({ to: '/login' })
    }
    return { token }
  },
})

type Weather = {
  temperature2m?: { min?: number; max?: number }
  rain?: { sum?: number }
  windGusts?: { max?: number }
}

function ActivityDetailPage() {
  const { activityId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: activity, isLoading, error, isError } = useGetActivity(activityId)

  const deleteActivityMutation = useDeleteActivity({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getGetActivityQueryKey(activityId) })
        void queryClient.invalidateQueries({ queryKey: getListAllActivitiesQueryKey() })
        // The route stays, but its activity list changes
        if (activity?.routeId) void queryClient.invalidateQueries({ queryKey: getGetRouteQueryKey(activity.routeId) })
        void navigate({ to: '/activities' })
      },
    },
  })

  // Fetch GPX from parent route
  const [gpxText, setGpxText] = useState<string | null>(null)

  useEffect(() => {
    if (!activity?.routeId) {
      setGpxText(null)
      return
    }
    setGpxText(null)

    const token = localStorage.getItem('gpx-toolbox-jwt')
    if (!token) {
      console.error('[ActivityDetailPage] No auth token')
      return
    }

    fetch(`/api/routes/${activity.routeId}/export`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text()
          console.error('[ActivityDetailPage] HTTP error:', res.status, text)
          return
        }
        const text = await res.text()
        setGpxText(text)
      })
      .catch((err) => {
        console.error('[ActivityDetailPage] Fetch error:', err)
      })
  }, [activity?.routeId])

  const points = useMemo(() => (gpxText ? parseGpx(gpxText) : []), [gpxText])
  const { totalDistKm, segmentRange, setSegmentRange } = useSegmentRange(points)
  const [hoveredPoint, setHoveredPoint] = useState<TrackPoint | null>(null)

  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleDeleteActivity() {
    try {
      // Navigates away on success
      await deleteActivityMutation.mutateAsync({ id: activityId })
    } catch {
      // Shown in the dialog via deleteActivityMutation.isError
    }
  }

  if (isLoading) return <div style={styles.loading}>Lade...</div>
  if (isError) return <div style={styles.error}>{error instanceof Error ? error.message : 'Unbekannter Fehler'}</div>
  if (!activity) return <div style={styles.error}>Aktivität nicht gefunden</div>

  const parentRoute = activity.route as
    { name?: string; status?: string; stats?: { distance?: number; elevationGain?: number } } | undefined | null
  const duration = activity.duration as unknown as number | null
  const avgHr = activity.avgHr as unknown as number | null
  const maxHr = activity.maxHr as unknown as number | null
  const weather = activity.weather as unknown as Weather | null
  // Prefer the distance of the loaded track, fall back to the stored route stats
  const distance = points.length > 1 ? calculateTotalDistance(points) : (parentRoute?.stats?.distance ?? null)

  return (
    <div style={styles.container}>
      <SidebarLayout
        header={
          <Link to="/activities" style={styles.backLink}>
            ← Zurück zur Übersicht
          </Link>
        }
      >
        <div>
          <h2 style={styles.heading}>
            {activity.riddenAt &&
              new Date(activity.riddenAt).toLocaleDateString('de-DE', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
          </h2>

          {activity.title && <div style={styles.title}>{activity.title}</div>}

          {parentRoute && (
            <Link to="/routes/$routeId" params={{ routeId: activity.routeId }} style={styles.routeLink}>
              {parentRoute.name}
            </Link>
          )}

          {parentRoute?.status && (
            <div style={styles.meta}>
              <span style={{ ...styles.badge, backgroundColor: routeStatusColor(parentRoute.status) }}>
                {routeStatusLabel(parentRoute.status)}
              </span>
            </div>
          )}
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Aktivität</h3>
          <div style={styles.statsGrid}>
            {distance != null && <Stat label="Distanz" value={formatDistance(distance)} />}
            {points.length < 2 && parentRoute?.stats?.elevationGain != null && (
              <Stat label="Höhenmeter ↑" value={`${Math.round(parentRoute.stats.elevationGain)} hm`} />
            )}
            {duration != null && <Stat label="Dauer" value={formatDuration(duration)} />}
            {duration != null && distance != null && duration > 0 && (
              <Stat label="Ø Geschw." value={`${calculateAvgSpeed(distance, duration)} km/h`} />
            )}
            {avgHr != null && <Stat label="Ø Herzfrequenz" value={`${avgHr} bpm`} />}
            {maxHr != null && <Stat label="Max Herzfrequenz" value={`${maxHr} bpm`} />}
            {weather?.temperature2m?.min != null && (
              <Stat label="Temperatur" value={`${weather.temperature2m.min}° – ${weather.temperature2m.max}°`} />
            )}
            {weather?.rain?.sum != null && <Stat label="Regen" value={`${weather.rain.sum} mm`} />}
            {weather?.windGusts?.max != null && <Stat label="Windböen" value={`${weather.windGusts.max} km/h`} />}
          </div>
          {activity.notes && <p style={styles.notes}>{activity.notes as unknown as string}</p>}
        </div>

        {points.length >= 2 && (
          <>
            <SidebarDivider />
            <TrackAnalysis
              points={points}
              range={segmentRange}
              onRangeChange={setSegmentRange}
              name={activity.title ?? parentRoute?.name}
              onPointHover={setHoveredPoint}
            />
          </>
        )}

        <SidebarDivider />

        <button onClick={() => setConfirmDelete(true)} style={styles.deleteButton}>
          🗑 Aktivität löschen
        </button>
      </SidebarLayout>

      {confirmDelete && (
        <ConfirmDialog
          title="Aktivität löschen"
          message={`${activity.title ? `„${activity.title}“` : 'Die Aktivität'} wird endgültig gelöscht.${parentRoute?.name ? ` Die Route „${parentRoute.name}“ bleibt erhalten.` : ''}`}
          confirmLabel="Löschen"
          danger
          pending={deleteActivityMutation.isPending}
          error={deleteActivityMutation.isError ? 'Aktivität konnte nicht gelöscht werden.' : null}
          onConfirm={() => void handleDeleteActivity()}
          onCancel={() => {
            setConfirmDelete(false)
            deleteActivityMutation.reset()
          }}
        />
      )}

      <SegmentMap points={points} range={segmentRange} totalDistKm={totalDistKm} hoveredPoint={hoveredPoint} />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.stat}>
      <span style={styles.statLabel}>{label}</span>
      <span style={styles.statValue}>{value}</span>
    </div>
  )
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
    fontSize: 20,
    fontWeight: 600,
    color: '#f8fafc',
  } as const,
  title: {
    fontSize: 15,
    fontWeight: 500,
    color: '#e2e8f0',
    marginBottom: 8,
  } as const,
  routeLink: {
    fontSize: 14,
    color: '#60a5fa',
    textDecoration: 'none',
    marginBottom: 12,
    display: 'block',
  } as const,
  meta: {
    display: 'flex',
    gap: 6,
  } as const,
  badge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 12,
    fontSize: 12,
    color: '#fff',
    fontWeight: 500,
  } as const,
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  } as const,
  sectionTitle: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#f8fafc',
    margin: 0,
  } as const,
  statsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  } as const,
  stat: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  } as const,
  statLabel: {
    fontSize: '0.8rem',
    color: '#94a3b8',
  } as const,
  statValue: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#e2e8f0',
  } as const,
  notes: {
    fontSize: 13,
    color: '#94a3b8',
    fontStyle: 'italic',
    margin: 0,
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
    backgroundColor: 'transparent',
    color: '#fca5a5',
    border: '1px solid #f87171',
    borderRadius: 4,
    cursor: 'pointer',
    alignSelf: 'flex-start',
  } as const,
}
