import { useEffect, useMemo, useRef, useState } from 'react'

import type { TrackPoint } from '@plusone/gpx-toolbox-utils'
import {
  analyzePoints,
  calculateElevationLoss,
  calculateHaversineDistance,
  renderSvg,
} from '@plusone/gpx-toolbox-utils'

import { formatDistance, formatDuration } from '../utils/format'

import { DistanceRangeSlider } from './DistanceRangeSlider'
import { ElevationProfile } from './ElevationProfile'
import { SegmentStats } from './SegmentStats'

type RouteSegmentsProps = {
  points: Array<TrackPoint>
  routeName?: string
}

export function RouteSegments({ points, routeName }: RouteSegmentsProps) {
  // Total distance in km
  const totalDist = useMemo(() => {
    const dists: Array<number> = [0]
    for (let i = 1; i < points.length; i++) {
      dists.push(dists[i - 1] + calculateHaversineDistance(points[i - 1], points[i]))
    }
    return dists[dists.length - 1] / 1000
  }, [points])

  const [segmentRange, setSegmentRange] = useState<[number, number]>([0, 0])
  const initializedRef = useRef(false)

  useEffect(() => {
    if (totalDist > 0 && !initializedRef.current) {
      initializedRef.current = true
      setSegmentRange([0, totalDist])
    }
  }, [totalDist])

  const [exportingTotalGpx, setExportingTotalGpx] = useState(false)
  const [exportingTotalSvg, setExportingTotalSvg] = useState(false)
  const [exportingSegmentGpx, setExportingSegmentGpx] = useState(false)
  const [exportingSegmentSvg, setExportingSegmentSvg] = useState(false)

  const { overview, totalElevationLoss } = useMemo(() => {
    const overview = analyzePoints(points)
    const totalElevationLoss = calculateElevationLoss(points)
    return { overview, totalElevationLoss }
  }, [points])

  if (points.length < 2) return null

  // Compute visible segment points by distance
  const startIdx = findClosestIndex(points, segmentRange[0])
  const endIdx = findClosestIndex(points, segmentRange[1])
  const segmentPoints = points.slice(startIdx, endIdx + 1)

  const baseName = (routeName || 'route').replace(/[^a-zA-Z0-9äöüÄÖÜß\-_ ]/g, '').replace(/\s+/g, '_')

  function handleExportGpx() {
    setExportingTotalGpx(true)
    try {
      const trkpts = points
        .map(
          (p) =>
            `    <trkpt lat="${p.latitude}" lon="${p.longitude}">
      <ele>${p.elevation}</ele>
      <time>${p.time.toISOString()}</time>
    </trkpt>`,
        )
        .join('\n')

      const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="GPX-Toolbox" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`

      const blob = new Blob([gpx], { type: 'application/gpx+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${baseName}.gpx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setExportingTotalGpx(false)
    }
  }

  function handleExportSegmentGpx() {
    setExportingSegmentGpx(true)
    try {
      const trkpts = segmentPoints
        .map(
          (p) =>
            `    <trkpt lat="${p.latitude}" lon="${p.longitude}">
      <ele>${p.elevation}</ele>
      <time>${p.time.toISOString()}</time>
    </trkpt>`,
        )
        .join('\n')

      const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="GPX-Toolbox" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`

      const blob = new Blob([gpx], { type: 'application/gpx+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${baseName}_segment.gpx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setExportingSegmentGpx(false)
    }
  }

  function handleExportSvg() {
    setExportingTotalSvg(true)
    try {
      const { svg } = renderSvg({ points: points, rotate: true })
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${baseName}.svg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setExportingTotalSvg(false)
    }
  }

  function handleExportSegmentSvg() {
    setExportingSegmentSvg(true)
    try {
      const { svg } = renderSvg({ points: segmentPoints, rotate: true })
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${baseName}_segment.svg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setExportingSegmentSvg(false)
    }
  }

  return (
    <div style={styles.container}>
      {/* Gesamt */}
      <div style={styles.section}>
        <h3 style={styles.title}>Gesamt</h3>
        <div style={styles.statsGrid}>
          <Stat label="Distanz" value={formatDistance(overview.totalDistance)} />
          <Stat
            label="Höhenmeter ↑"
            value={`${Math.round(overview.segments.reduce((s, seg) => s + seg.elevationGain, 0))} hm`}
          />
          <Stat label="Abstieg ↓" value={`${Math.round(totalElevationLoss)} hm`} />
          <Stat label="Dauer" value={formatDuration(overview.totalDuration)} />
        </div>
        <ElevationProfile points={points} range={segmentRange} />
        <div style={styles.exportRow}>
          <button
            onClick={handleExportGpx}
            disabled={exportingTotalGpx || points.length < 2}
            style={{
              ...styles.exportButton,
              ...styles.exportButtonGpx,
              opacity: exportingTotalGpx || points.length < 2 ? 0.5 : 1,
            }}
          >
            {exportingTotalGpx ? '…' : 'GPX'}
          </button>
          <button
            onClick={handleExportSvg}
            disabled={exportingTotalSvg || points.length < 2}
            style={{
              ...styles.exportButton,
              ...styles.exportButtonSvg,
              opacity: exportingTotalSvg || points.length < 2 ? 0.5 : 1,
            }}
          >
            {exportingTotalSvg ? '…' : 'SVG'}
          </button>
        </div>
      </div>

      {/* Segment */}
      <div style={styles.section}>
        <h3 style={styles.title}>Segment</h3>
        <DistanceRangeSlider points={points} value={segmentRange} onChange={setSegmentRange} />
        {segmentPoints.length >= 2 && <SegmentStats points={segmentPoints} />}
        <div style={styles.exportRow}>
          <button
            onClick={handleExportSegmentGpx}
            disabled={exportingSegmentGpx || segmentPoints.length < 2}
            style={{
              ...styles.exportButton,
              ...styles.exportButtonGpx,
              opacity: exportingSegmentGpx || segmentPoints.length < 2 ? 0.5 : 1,
            }}
          >
            {exportingSegmentGpx ? '…' : 'GPX'}
          </button>
          <button
            onClick={handleExportSegmentSvg}
            disabled={exportingSegmentSvg || segmentPoints.length < 2}
            style={{
              ...styles.exportButton,
              ...styles.exportButtonSvg,
              opacity: exportingSegmentSvg || segmentPoints.length < 2 ? 0.5 : 1,
            }}
          >
            {exportingSegmentSvg ? '…' : 'SVG'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.stat}>
      <span style={styles.label}>{label}</span>
      <span style={styles.value}>{value}</span>
    </div>
  )
}

function findClosestIndex(points: Array<TrackPoint>, targetDistKm: number): number {
  let dist = 0
  for (let i = 1; i < points.length; i++) {
    if (dist / 1000 >= targetDistKm) return i - 1
    dist += calculateHaversineDistance(points[i - 1], points[i])
  }
  return points.length - 1
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  section: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  title: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#64748b',
    margin: 0,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
  },
  statsGrid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  stat: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  label: {
    fontSize: '0.8rem',
    color: '#94a3b8',
  },
  value: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  exportRow: {
    display: 'flex',
    gap: '0.5rem',
  },
  exportButton: {
    flex: 1,
    padding: '0.5rem 1rem',
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
