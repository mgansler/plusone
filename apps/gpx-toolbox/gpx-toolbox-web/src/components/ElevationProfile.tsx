import { useMemo } from 'react'

import type { TrackPoint } from '@plusone/gpx-toolbox-utils'
import { calculateHaversineDistance } from '@plusone/gpx-toolbox-utils'

type ElevationProfileProps = {
  points: Array<TrackPoint>
  range: [number, number]
}

/** Simple polyline elevation profile — no Catmull-Rom, clean & fast */
export function ElevationProfile({ points, range }: ElevationProfileProps) {
  const {
    profile,
    minE,
    maxE,
    totalDist: _totalDist,
  } = useMemo(() => {
    // Cumulative distances
    const dists: Array<number> = [0]
    for (let i = 1; i < points.length; i++) {
      dists.push(dists[i - 1] + calculateHaversineDistance(points[i - 1], points[i]))
    }

    const elevations = points.map((p) => p.elevation)
    const minE = Math.min(...elevations)
    const maxE = Math.max(...elevations)

    return {
      profile: points.map((p, i) => ({
        x: (i / (points.length - 1)) * 100,
        y: p.elevation,
        dist: dists[i] / 1000,
      })),
      minE,
      maxE,
      totalDist: dists[dists.length - 1] / 1000,
    }
  }, [points])

  const {
    startIdx,
    endIdx,
    startEle,
    endEle,
    segMinE: _segMinE,
    segMaxE: _segMaxE,
  } = useMemo(() => {
    const s = Math.round((range[0] / 100) * (points.length - 1))
    const e = Math.round((range[1] / 100) * (points.length - 1))
    const seg = points.slice(s, e + 1)
    return {
      startIdx: s,
      endIdx: e,
      startEle: seg[0].elevation,
      endEle: seg[seg.length - 1].elevation,
      segMinE: Math.min(...seg.map((p) => p.elevation)),
      segMaxE: Math.max(...seg.map((p) => p.elevation)),
    }
  }, [points, range])

  // Scale helpers (viewBox 0 0 100 40)
  const pad = 1
  const w = 100
  const h = 40
  const eRange = maxE - minE || 1
  const toY = (ele: number) => h - pad - ((ele - minE) / eRange) * (h - 2 * pad)

  // Full track path
  const fullPath = profile.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${toY(p.y).toFixed(1)}`).join(' ')
  const areaPath = `${fullPath} L ${w - pad},${h} ${pad},${h} Z`

  // Selected segment path
  const segPath = profile
    .slice(startIdx, endIdx + 1)
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${toY(p.y).toFixed(1)}`)
    .join(' ')

  return (
    <div style={styles.container}>
      <svg viewBox={`0 0 ${w} ${h}`} style={styles.svg} preserveAspectRatio="none">
        {/* Background */}
        <rect x={pad} y={pad} width={w - 2 * pad} height={h - 2 * pad} fill="rgba(255,255,255,0.04)" rx="1" />

        {/* Full track area */}
        <path d={areaPath} fill="rgba(148,163,184,0.08)" />

        {/* Full track line */}
        <path d={fullPath} fill="none" stroke="#475569" strokeWidth="0.6" strokeLinejoin="round" />

        {/* Selected segment area */}
        {segPath && (
          <>
            <path
              d={`${segPath} L ${profile[endIdx].x.toFixed(1)},${h} ${profile[startIdx].x.toFixed(1)},${h} Z`}
              fill="rgba(37,99,235,0.15)"
            />
            <path d={segPath} fill="none" stroke="#3b82f6" strokeWidth="0.8" strokeLinejoin="round" />
          </>
        )}

        {/* Start marker */}
        <circle cx={profile[startIdx].x.toFixed(1)} cy={toY(startEle).toFixed(1)} r="1.5" fill="#4ade80" />

        {/* End marker */}
        <circle cx={profile[endIdx].x.toFixed(1)} cy={toY(endEle).toFixed(1)} r="1.5" fill="#f87171" />
      </svg>

      {/* Labels */}
      <div style={styles.labels}>
        <span style={{ ...styles.label, color: '#4ade80' }}>↑ {Math.round(startEle)} m</span>
        <span style={{ ...styles.label, color: '#64748b' }}>
          {profile[startIdx].dist.toFixed(1)} – {profile[endIdx].dist.toFixed(1)} km
        </span>
        <span style={{ ...styles.label, color: '#f87171' }}>{Math.round(endEle)} m ↓</span>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  svg: {
    width: '100%',
    height: 'auto',
    display: 'block',
  },
  labels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.65rem',
    fontFamily: 'monospace',
  },
  label: {
    color: '#64748b',
  },
} as const
