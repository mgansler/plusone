import type { TrackPoint } from '@plusone/gpx'
import { calculateHaversineDistance } from '@plusone/gpx'

interface SegmentStatsProps {
  points: TrackPoint[]
}

export function SegmentStats({ points }: SegmentStatsProps) {
  const totalDistance = calculateTotalDistance(points)
  const elevationGain = calculateElevationGain(points)
  const elevationLoss = calculateElevationLoss(points)
  const duration = calculateDuration(points)
  const avgSpeed = calculateAvgSpeed(totalDistance, duration)
  const maxSpeed = calculateMaxSpeed(points)
  const timeRange = getTimeRange(points)

  if (points.length < 2) {
    return (
      <div style={styles.empty}>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Wähle mindestens 2 Punkte aus</span>
      </div>
    )
  }

  return (
    <div style={styles.grid}>
      <Stat label="Distanz" value={formatDistance(totalDistance)} />
      <Stat label="Höhenmeter ↑" value={`${Math.round(elevationGain)} m`} />
      <Stat label="Tiefenmeter ↓" value={`${Math.round(elevationLoss)} m`} />
      <Stat label="Dauer" value={formatDuration(duration)} />
      <Stat label="Ø Geschw." value={`${avgSpeed} km/h`} />
      <Stat label="Max Geschw." value={`${maxSpeed} km/h`} />
      <Stat label="Zeit" value={timeRange} />
    </div>
  )
}

function calculateTotalDistance(points: TrackPoint[]): number {
  let total = 0
  for (let i = 1; i < points.length; i++) {
    total += calculateHaversineDistance(points[i - 1], points[i])
  }
  return total
}

function calculateElevationGain(points: TrackPoint[]): number {
  let gain = 0
  for (let i = 1; i < points.length; i++) {
    const diff = points[i].elevation - points[i - 1].elevation
    if (diff > 0) gain += diff
  }
  return gain
}

function calculateElevationLoss(points: TrackPoint[]): number {
  let loss = 0
  for (let i = 1; i < points.length; i++) {
    const diff = points[i - 1].elevation - points[i].elevation
    if (diff > 0) loss += diff
  }
  return loss
}

function calculateDuration(points: TrackPoint[]): number {
  if (points.length < 2) return 0
  return (points[points.length - 1].time.getTime() - points[0].time.getTime()) / 1000
}

function calculateAvgSpeed(distance: number, duration: number): number {
  if (duration === 0) return 0
  return Math.round((distance / 1000 / (duration / 3600)) * 10) / 10
}

function calculateMaxSpeed(points: TrackPoint[]): number {
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

function getTimeRange(points: TrackPoint[]): string {
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

interface StatProps {
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
  grid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.35rem',
  },
  stat: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  label: {
    fontSize: '0.75rem',
    color: '#94a3b8',
  },
  value: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#e2e8f0',
  },
  empty: {
    padding: '0.5rem 0',
  },
} as const
