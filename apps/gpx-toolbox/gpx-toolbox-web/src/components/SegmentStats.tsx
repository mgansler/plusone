import { useTranslation } from 'react-i18next'

import type { TrackPoint } from '@plusone/gpx-toolbox-utils'
import {
  calculateAvgSpeed,
  calculateDuration,
  calculateElevationGain,
  calculateElevationLoss,
  calculateMaxSpeed,
  calculateTotalDistance,
  getTimeRange,
} from '@plusone/gpx-toolbox-utils'

import { formatDistance, formatDuration } from '../utils/format'

type SegmentStatsProps = {
  points: Array<TrackPoint>
}

export function SegmentStats({ points }: SegmentStatsProps) {
  const { t } = useTranslation()
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
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{t('segmentStats.selectPoints')}</span>
      </div>
    )
  }

  return (
    <div style={styles.grid}>
      <Stat label={t('segmentStats.distance')} value={formatDistance(totalDistance)} />
      <Stat label={t('segmentStats.elevationGain')} value={`${Math.round(elevationGain)} m`} />
      <Stat label={t('segmentStats.elevationLoss')} value={`${Math.round(elevationLoss)} m`} />
      <Stat label={t('segmentStats.duration')} value={formatDuration(duration)} />
      <Stat label={t('segmentStats.avgSpeed')} value={`${avgSpeed} km/h`} />
      <Stat label={t('segmentStats.maxSpeed')} value={`${maxSpeed} km/h`} />
      <Stat label={t('segmentStats.time')} value={timeRange} />
    </div>
  )
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
