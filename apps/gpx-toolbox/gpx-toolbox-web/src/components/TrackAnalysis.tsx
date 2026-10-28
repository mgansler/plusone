import { useMemo } from 'react'

import {
  analyzePoints,
  calculateAvgSpeed,
  calculateElevationLoss,
  calculateMaxSpeed,
  getTimeRange,
  renderSvg,
  serializeGpx,
  type TrackPoint,
} from '@plusone/gpx-toolbox-utils'

import { formatDistance, formatDuration } from '../utils/format'
import { downloadFile, slicePointsByDistance } from '../utils/track'

import { DistanceRangeSlider } from './DistanceRangeSlider'
import { ElevationProfile } from './ElevationProfile'
import { SegmentStats } from './SegmentStats'
import { SidebarDivider } from './SidebarLayout'

type TrackAnalysisProps = {
  points: Array<TrackPoint>
  /** Selected segment in km, [startKm, endKm] */
  range: [number, number]
  onRangeChange: (range: [number, number]) => void
  /** Used for the track name and export file names */
  name?: string
}

/**
 * "Gesamt" and "Segment" sidebar sections: overall stats, elevation profile, segment slider and GPX/SVG export.
 */
export function TrackAnalysis({ points, range, onRangeChange, name }: TrackAnalysisProps) {
  const overview = useMemo(() => {
    const analysis = analyzePoints(points)
    return {
      totalDistance: analysis.totalDistance,
      totalDuration: analysis.totalDuration,
      elevationGain: analysis.segments.reduce((sum, seg) => sum + seg.elevationGain, 0),
      elevationLoss: calculateElevationLoss(points),
      maxSpeed: calculateMaxSpeed(points),
      timeRange: getTimeRange(points),
    }
  }, [points])

  const segmentPoints = useMemo(() => slicePointsByDistance(points, range), [points, range])

  if (points.length < 2) return null

  const baseName = (name || 'track').replace(/[^a-zA-Z0-9äöüÄÖÜß\-_ ]/g, '').replace(/\s+/g, '_')
  const hasTime = overview.totalDuration > 0

  return (
    <>
      <div style={styles.section}>
        <h3 style={styles.title}>Gesamt</h3>
        <div style={styles.statsGrid}>
          <Stat label="Distanz" value={formatDistance(overview.totalDistance)} />
          <Stat label="Höhenmeter ↑" value={`${Math.round(overview.elevationGain)} hm`} />
          <Stat label="Abstieg ↓" value={`${Math.round(overview.elevationLoss)} hm`} />
          {hasTime && (
            <>
              <Stat label="Dauer" value={formatDuration(overview.totalDuration)} />
              <Stat
                label="Ø Geschw."
                value={`${calculateAvgSpeed(overview.totalDistance, overview.totalDuration)} km/h`}
              />
              <Stat label="Max Geschw." value={`${overview.maxSpeed} km/h`} />
              <Stat label="Zeit" value={overview.timeRange} />
            </>
          )}
        </div>
        <ElevationProfile points={points} range={range} />
        <ExportButtons points={points} name={name} fileName={baseName} />
      </div>

      <SidebarDivider />

      <div style={styles.section}>
        <h3 style={styles.title}>Segment</h3>
        <DistanceRangeSlider points={points} value={range} onChange={onRangeChange} />
        <SegmentStats points={segmentPoints} />
        <ExportButtons points={segmentPoints} name={name} fileName={`${baseName}_segment`} />
      </div>
    </>
  )
}

function ExportButtons({ points, name, fileName }: { points: Array<TrackPoint>; name?: string; fileName: string }) {
  const disabled = points.length < 2

  function handleExportGpx() {
    downloadFile(serializeGpx(points, name), 'application/gpx+xml', `${fileName}.gpx`)
  }

  function handleExportSvg() {
    const { svg } = renderSvg({ points, rotate: true })
    downloadFile(svg, 'image/svg+xml', `${fileName}.svg`)
  }

  return (
    <div style={styles.exportRow}>
      <button
        onClick={handleExportGpx}
        disabled={disabled}
        style={{ ...styles.exportButton, ...styles.exportButtonGpx, opacity: disabled ? 0.5 : 1 }}
      >
        GPX
      </button>
      <button
        onClick={handleExportSvg}
        disabled={disabled}
        style={{ ...styles.exportButton, ...styles.exportButtonSvg, opacity: disabled ? 0.5 : 1 }}
      >
        SVG
      </button>
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
  section: {
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
  statsGrid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  stat: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  statLabel: {
    fontSize: '0.8rem',
    color: '#94a3b8',
  },
  statValue: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#e2e8f0',
  },
  exportRow: {
    display: 'flex',
    gap: '0.5rem',
  },
  exportButton: {
    flex: 1,
    padding: '0.6rem 1rem',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '0.85rem',
    transition: 'background-color 0.2s',
  },
  exportButtonGpx: {
    background: '#059669',
  },
  exportButtonSvg: {
    background: '#7c3aed',
  },
} as const
