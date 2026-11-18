import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { segmentTrack, type TrackPoint } from '@plusone/gpx-toolbox-utils'

type SegmentBreakdownProps = {
  points: Array<TrackPoint>
}

/**
 * Shows the route broken down into uphill, downhill, and flat segments
 * with distance, elevation gain, and duration for each.
 */
export function SegmentBreakdown({ points }: SegmentBreakdownProps) {
  const { t } = useTranslation()

  const breakdown = useMemo(() => {
    if (points.length < 2) return null

    const segments = segmentTrack(points)

    // Aggregate by type
    const byType: Record<
      string,
      { distance: number; elevationGain: number; elevationLoss: number; durationSeconds: number; count: number }
    > = {}

    for (const seg of segments) {
      const type = seg.type ?? 'flat'
      if (!byType[type]) {
        byType[type] = { distance: 0, elevationGain: 0, elevationLoss: 0, durationSeconds: 0, count: 0 }
      }
      byType[type].distance += seg.totalDistance
      byType[type].elevationGain += seg.elevationGain
      // Calculate elevation loss from segment points
      let loss = 0
      for (let i = 1; i < seg.points.length; i++) {
        const diff = seg.points[i - 1].elevation - seg.points[i].elevation
        if (diff > 0) loss += diff
      }
      byType[type].elevationLoss += loss
      const startTime = seg.points[0].time
      const endTime = seg.points[seg.points.length - 1].time
      byType[type].durationSeconds += (endTime.getTime() - startTime.getTime()) / 1000
      byType[type].count += 1
    }

    return byType
  }, [points])

  if (!breakdown) return null

  const types = ['uphill', 'downhill', 'flat']
  const labels: Record<string, string> = {
    uphill: t('segmentBreakdown.uphill'),
    downhill: t('segmentBreakdown.downhill'),
    flat: t('segmentBreakdown.flat'),
  }
  const icons: Record<string, string> = {
    uphill: '⬆️',
    downhill: '⬇️',
    flat: '➡️',
  }
  const colors: Record<string, string> = {
    uphill: '#22c55e',
    downhill: '#f97316',
    flat: '#60a5fa',
  }

  // Calculate totals for percentages
  const totalDistance = Object.values(breakdown).reduce((sum, b) => sum + b.distance, 0)

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>{t('segmentBreakdown.title')}</h3>
      <div style={styles.list}>
        {types
          .filter((type) => breakdown[type])
          .map((type) => {
            const data = breakdown[type]
            const percentage = totalDistance > 0 ? Math.round((data.distance / totalDistance) * 100) : 0
            return (
              <div key={type} style={styles.row}>
                <div style={styles.rowHeader}>
                  <span style={styles.icon}>{icons[type]}</span>
                  <span style={{ ...styles.label, color: colors[type] }}>{labels[type]}</span>
                  <span style={styles.count}>{t('segmentBreakdown.segments', { count: data.count })}</span>
                </div>
                <div style={styles.progressBar}>
                  <div style={{ ...styles.progressFill, width: `${percentage}%`, backgroundColor: colors[type] }} />
                </div>
                <div style={styles.rowStats}>
                  <span style={styles.stat}>
                    {formatDistance(data.distance)}
                    {percentage > 0 && <span style={styles.percentage}>{percentage}%</span>}
                  </span>
                  <span style={styles.stat}>
                    {data.elevationGain > 0 ? `↑ ${Math.round(data.elevationGain)} m` : '—'}
                  </span>
                  <span style={styles.stat}>
                    {data.elevationLoss > 0 ? `↓ ${Math.round(data.elevationLoss)} m` : '—'}
                  </span>
                  <span style={styles.stat}>
                    {data.durationSeconds > 0 ? formatDuration(data.durationSeconds) : '—'}
                  </span>
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}

function formatDistance(meters: number): string {
  const rounded = Math.round(meters)
  if (rounded >= 1000) {
    return `${(rounded / 1000).toFixed(1)} km`
  }
  return `${rounded} m`
}

function formatDuration(totalSeconds: number): string {
  const seconds = Math.floor(totalSeconds)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  title: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#f8fafc',
    margin: 0,
  },
  list: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  row: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  rowHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  icon: {
    fontSize: '0.9rem',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  count: {
    fontSize: '0.7rem',
    color: '#64748b',
    marginLeft: 'auto',
  },
  progressBar: {
    height: '3px',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 0.3s ease',
  },
  rowStats: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.75rem',
  },
  stat: {
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  percentage: {
    fontSize: '0.65rem',
    color: '#64748b',
  },
} as const
