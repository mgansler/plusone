import { type MouseEvent, useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { TrackPoint } from '@plusone/gpx-toolbox-utils'

import { cumulativeDistances, indexAtDistance, niceStep } from '../utils/profile'

export type ProfileTrack = { id: string; name: string; color: string; dashArray?: string; points: Array<TrackPoint> }

export type ProfileHover = Array<{ id: string; point: TrackPoint }>

type CompareElevationProfileProps = {
  tracks: Array<ProfileTrack>
  /** Points under the mouse (one per track that is long enough), or null on leave */
  onHover?: (hover: ProfileHover | null) => void
}

// SVG coordinate system; stretched to the container (preserveAspectRatio="none")
const W = 1000
const H = 300
const PAD_Y = 8
/** Enough for a smooth line at any realistic panel width */
const MAX_PATH_POINTS = 1500
/** Viewport shows 20 km at a time; longer routes scroll horizontally */
const VIEWPORT_KM = 20000

/**
 * Elevation profiles of several tracks on shared axes.
 * The viewport shows 20 km at a time; longer routes scroll horizontally.
 * Elevation labels (y-axis) appear to the right of the 0 km line.
 */
export function CompareElevationProfile({ tracks, onHover }: CompareElevationProfileProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const profiles = useMemo(
    () =>
      tracks
        // Without elevation (GPX without <ele>) a track cannot be drawn
        .filter((t) => t.points.length >= 2 && t.points.every((p) => Number.isFinite(p.elevation)))
        .map((t) => ({ ...t, distances: cumulativeDistances(t.points) })),
    [tracks],
  )

  const maxDistance = Math.max(0, ...profiles.map((p) => p.distances[p.distances.length - 1]))
  const elevations = profiles.flatMap((p) => p.points.map((pt) => pt.elevation))
  const minElevation = Math.min(...elevations)
  const maxElevation = Math.max(...elevations)
  const elevationRange = maxElevation - minElevation || 1

  // The SVG x-axis always maps to the full track distance, but the visible viewport is 20 km
  const toX = (distance: number) => (distance / maxDistance) * W
  const toY = (elevation: number) => H - PAD_Y - ((elevation - minElevation) / elevationRange) * (H - 2 * PAD_Y)

  const paths = useMemo(
    () =>
      profiles.map((p) => {
        const step = Math.max(1, Math.ceil(p.points.length / MAX_PATH_POINTS))
        const indices = p.points.map((_, i) => i).filter((i) => i % step === 0 || i === p.points.length - 1)
        const d = indices
          .map(
            (i, n) =>
              `${n === 0 ? 'M' : 'L'}${toX(p.distances[i]).toFixed(1)},${toY(p.points[i].elevation).toFixed(1)}`,
          )
          .join(' ')
        return { id: p.id, color: p.color, d }
      }),
    // toX/toY only depend on the values below
    [profiles, maxDistance, minElevation, elevationRange],
  )

  const kmStep = niceStep(maxDistance)
  const ticks = Array.from({ length: Math.floor(maxDistance / kmStep) + 1 }, (_, i) => i * kmStep)

  const [hover, setHover] = useState<{
    distance: number
    entries: Array<{ id: string; color: string; name: string; point: TrackPoint }>
  } | null>(null)

  const handleMouseMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect()
      const distance = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)) * maxDistance
      const entries = profiles
        // A shorter track has no point at this distance
        .filter((p) => distance <= p.distances[p.distances.length - 1])
        .map((p) => ({
          id: p.id,
          color: p.color,
          name: p.name,
          point: p.points[indexAtDistance(p.distances, distance)],
        }))
      setHover({ distance, entries })
      onHover?.(entries.map(({ id, point }) => ({ id, point })))
    },
    [profiles, maxDistance, onHover],
  )

  const handleMouseLeave = useCallback(() => {
    setHover(null)
    onHover?.(null)
  }, [onHover])

  const { t } = useTranslation()

  if (profiles.length === 0 || maxDistance === 0) {
    return <div style={styles.empty}>{t('compare.noElevationData')}</div>
  }

  // Whether horizontal scrolling is needed
  const needsScroll = maxDistance > VIEWPORT_KM

  return (
    <div style={styles.container}>
      <div style={styles.plotColumn}>
        {/* Scrollable wrapper — only scrolls when route exceeds 20 km */}
        <div ref={scrollRef} style={styles.scrollWrapper}>
          <div style={{ ...styles.plotInner, width: needsScroll ? `${(maxDistance / VIEWPORT_KM) * 100}%` : '100%' }}>
            <div
              style={styles.plot}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              data-testid="compare-profile-plot"
            >
              <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={styles.svg}>
                {ticks.map((t) => (
                  <line
                    key={t}
                    x1={toX(t)}
                    x2={toX(t)}
                    y1={0}
                    y2={H}
                    stroke="#334155"
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                {paths.map((p) => (
                  <path
                    key={p.id}
                    d={p.d}
                    fill="none"
                    stroke={p.color}
                    strokeWidth={2}
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    data-testid={`profile-${p.id}`}
                  />
                ))}
                {hover && (
                  <line
                    x1={toX(hover.distance)}
                    x2={toX(hover.distance)}
                    y1={0}
                    y2={H}
                    stroke="#94a3b8"
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                  />
                )}
              </svg>

              {/* Elevation labels — positioned to the right of the 0 km line, inside the plot */}
              <div style={styles.yAxisInline}>
                <span>{Math.round(maxElevation)} m</span>
                <span>{Math.round(minElevation)} m</span>
              </div>

              {/* Dots and tooltip as HTML: in the stretched SVG circles would turn into ellipses */}
              {hover?.entries.map((e) => (
                <span
                  key={e.id}
                  style={{
                    ...styles.dot,
                    backgroundColor: e.color,
                    left: `${(toX(hover.distance) / W) * 100}%`,
                    top: `${(toY(e.point.elevation) / H) * 100}%`,
                  }}
                />
              ))}
              {hover && (
                <div
                  style={{
                    ...styles.tooltip,
                    // Flip to the left side in the right half so the tooltip stays inside the panel
                    ...(hover.distance > maxDistance / 2
                      ? { right: `${100 - (toX(hover.distance) / W) * 100}%`, marginRight: 8 }
                      : { left: `${(toX(hover.distance) / W) * 100}%`, marginLeft: 8 }),
                  }}
                >
                  <div style={styles.tooltipTitle}>{(hover.distance / 1000).toFixed(1)} km</div>
                  {hover.entries.map((e) => (
                    <div key={e.id} style={styles.tooltipRow}>
                      <span style={{ ...styles.swatch, backgroundColor: e.color }} />
                      <span style={styles.tooltipName}>{e.name}</span>
                      <span>{Math.round(e.point.elevation)} m</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={styles.xAxis}>
              {ticks.map((t) => (
                <span key={t} style={{ ...styles.xTick, left: `${(toX(t) / W) * 100}%` }}>
                  {t / 1000} km
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    height: '100%',
    minHeight: 0,
  } as const,
  yAxisInline: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#94a3b8',
    textAlign: 'left',
    paddingLeft: 6,
    pointerEvents: 'none',
    zIndex: 1,
  } as const,
  plotColumn: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
  } as const,
  scrollWrapper: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    overflowX: 'auto',
    overflowY: 'hidden',
  } as const,
  plotInner: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    height: '100%',
  } as const,
  plot: {
    position: 'relative',
    flex: 1,
    minHeight: 0,
    cursor: 'crosshair',
    display: 'flex',
    flexDirection: 'column',
  } as const,
  svg: {
    display: 'block',
    width: '100%',
    height: '100%',
  } as const,
  xAxis: {
    position: 'relative',
    height: 18,
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#94a3b8',
  } as const,
  xTick: {
    position: 'absolute',
    top: 2,
    transform: 'translateX(-50%)',
    whiteSpace: 'nowrap',
  } as const,
  dot: {
    position: 'absolute',
    width: 10,
    height: 10,
    marginLeft: -5,
    marginTop: -5,
    borderRadius: '50%',
    border: '2px solid #fff',
    boxSizing: 'border-box',
    pointerEvents: 'none',
  } as const,
  tooltip: {
    position: 'absolute',
    top: 4,
    padding: '6px 8px',
    fontSize: 12,
    color: '#e2e8f0',
    backgroundColor: 'rgba(15,23,42,0.92)',
    border: '1px solid #334155',
    borderRadius: 6,
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
  } as const,
  tooltipTitle: {
    fontWeight: 600,
    marginBottom: 4,
  } as const,
  tooltipRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  } as const,
  tooltipName: {
    flex: 1,
    maxWidth: 180,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } as const,
  swatch: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  } as const,
  empty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    fontSize: 13,
    color: '#94a3b8',
  } as const,
}
