import type { TrackPoint } from '@plusone/gpx-toolbox-utils'
import { calculateHaversineDistance } from '@plusone/gpx-toolbox-utils'

type TrackInfoProps = {
  points: Array<TrackPoint>
}

export function TrackInfo({ points }: TrackInfoProps) {
  const totalDistance = calculateTotalDistance(points)
  const elevationGain = calculateElevationGain(points)
  const duration = calculateDuration(points)
  const avgSpeed = calculateAvgSpeed(totalDistance, duration)
  const maxSpeed = calculateMaxSpeed(points)
  const timeRange = getTimeRange(points)

  return (
    <div style={styles.panel}>
      <h3 style={styles.title}>Track-Info</h3>
      <div style={styles.grid}>
        <Stat label="Distanz" value={`${formatDistance(totalDistance)}`} />
        <Stat label="Höhenmeter ↑" value={`${Math.round(elevationGain)} m`} />
        <Stat label="Dauer" value={formatDuration(duration)} />
        <Stat label="Ø Geschw." value={`${avgSpeed} km/h`} />
        <Stat label="Max Geschw." value={`${maxSpeed} km/h`} />
        <Stat label="Zeit" value={timeRange} />
      </div>
    </div>
  )
}

function calculateTotalDistance(points: Array<TrackPoint>): number {
  let total = 0
  for (let i = 1; i < points.length; i++) {
    total += calculateHaversineDistance(points[i - 1], points[i])
  }
  return total
}

function calculateElevationGain(points: Array<TrackPoint>): number {
  let gain = 0
  for (let i = 1; i < points.length; i++) {
    const diff = points[i].elevation - points[i - 1].elevation
    if (diff > 0) gain += diff
  }
  return gain
}

function calculateDuration(points: Array<TrackPoint>): number {
  if (points.length < 2) return 0
  return (points[points.length - 1].time.getTime() - points[0].time.getTime()) / 1000
}

function calculateAvgSpeed(distance: number, duration: number): number {
  if (duration === 0) return 0
  return Math.round((distance / 1000 / (duration / 3600)) * 10) / 10
}

function calculateMaxSpeed(points: Array<TrackPoint>): number {
  let maxSpeed = 0
  for (let i = 1; i < points.length; i++) {
    const dt = (points[i].time.getTime() - points[i - 1].time.getTime()) / 1000
    if (dt > 0) {
      const dist = calculateHaversineDistance(points[i - 1], points[i])
      const speed = dist / 1000 / (dt / 3600)
      if (speed > maxSpeed) maxSpeed = speed
    }
  }
  return Math.round(maxSpeed * 10) / 10
}

function getTimeRange(points: Array<TrackPoint>): string {
  if (points.length < 2) return ''
  const start = points[0].time
  const end = points[points.length - 1].time
  return `${formatTime(start)} – ${formatTime(end)}`
}

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`
  }
  return `${Math.round(meters)} m`
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`
  }
  return `${secs}s`
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

type StatProps = {
  label: string
  value: string
}

function Stat({ label, value }: StatProps) {
  return (
    <div style={styles.stat}>
      <span style={styles.label}>{label}</span>
      <span style={styles.value}>{value}</span>
    </div>
  )
}

const styles = {
  panel: {
    position: 'absolute',
    top: '1rem',
    left: '1rem',
    background: '#fff',
    borderRadius: '12px',
    padding: '1.25rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
    zIndex: 1000,
    minWidth: '220px',
  },
  title: {
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: '0.75rem',
    color: '#1a1a1a',
  },
  grid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  stat: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  label: {
    fontSize: '0.8rem',
    color: '#666',
  },
  value: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#1a1a1a',
  },
} as const
