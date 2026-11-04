import { useEffect, useMemo, useRef, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQueries } from '@tanstack/react-query'
import L from 'leaflet'

import { parseGpx } from '@plusone/gpx-toolbox-utils'
import { getExportRouteQueryOptions, getGetRouteQueryOptions } from '@plusone/gpx-toolbox-api-client'

import { CompareElevationProfile, type ProfileHover, type ProfileTrack } from '../components/CompareElevationProfile'
import { Map } from '../components/Map'
import { SidebarDivider, SidebarLayout } from '../components/SidebarLayout'
import { type CompareItem, useCompareList } from '../hooks/useCompareList'
import { formatDifference } from '../utils/format'
import { cumulativeDistances } from '../utils/profile'
import { routeColor, routeStyle } from '../utils/routeColors'

export const Route = createFileRoute('/compare')({
  component: ComparePage,
})

type CompareRow = {
  item: CompareItem
  color: string
  isLoading: boolean
  isError: boolean
  name: string
  /** meters; null while loading or unknown */
  distance: number | null
  elevationGain: number | null
}

function formatKm(meters: number): string {
  return `${(meters / 1000).toFixed(1)} km`
}

function formatMeters(meters: number): string {
  return `${Math.round(meters)} m`
}

function ComparePage() {
  const { items, remove, makeReference, clear } = useCompareList()

  const routeQueries = useQueries({ queries: items.map((i) => getGetRouteQueryOptions(i.id)) })
  const gpxQueries = useQueries({ queries: items.map((i) => getExportRouteQueryOptions(i.id)) })

  // The generated type says void, but the export endpoint returns the GPX XML as text.
  // Parsed only when the loaded GPX texts change, not on every render (e.g. while hovering the profile).
  const gpxTexts = gpxQueries.map((q) => (typeof q.data === 'string' ? (q.data as string) : null))
  const gpxKey = gpxTexts.join('\u0000')
  const parsedTracks = useMemo(
    () =>
      gpxTexts.map((text) => {
        const points = text ? parseGpx(text) : []
        return points.length > 1 ? { points, distance: cumulativeDistances(points).at(-1) ?? 0 } : null
      }),
    [gpxKey],
  )

  // Stable across renders (hovering the profile re-renders this page), so the map does not redraw
  const tracks = useMemo(
    () =>
      items.flatMap((item, index) => {
        const parsed = parsedTracks[index]
        return parsed
          ? [
              {
                id: item.id,
                name: item.name,
                color: routeColor(index),
                dashArray: routeStyle(index).dashArray,
                points: parsed.points,
              },
            ]
          : []
      }),
    [items, parsedTracks],
  )

  const rows: Array<CompareRow> = items.map((item, index) => {
    const route = routeQueries[index]?.data
    const stats = route?.stats as { distance?: number; elevationGain?: number } | null | undefined
    return {
      item,
      color: routeColor(index),
      isLoading: routeQueries[index]?.isLoading || gpxQueries[index]?.isLoading,
      isError: routeQueries[index]?.isError ?? false,
      name: route?.name ?? item.name,
      distance: stats?.distance ?? parsedTracks[index]?.distance ?? null,
      elevationGain: stats?.elevationGain ?? null,
    }
  })
  const [hover, setHover] = useState<ProfileHover | null>(null)
  // Route under the mouse on the map or in the table; drawn on top of overlapping routes
  const [highlightedId, setHighlightedId] = useState<string | null>(null)

  return (
    <div style={styles.container}>
      <SidebarLayout
        header={
          <Link to="/" style={styles.backLink}>
            ← Zurück zur Übersicht
          </Link>
        }
      >
        <h2 style={styles.heading}>Routenvergleich</h2>

        {items.length < 2 ? (
          <p style={styles.hint}>
            Füge mindestens zwei Routen über „+ Vergleich“ in der{' '}
            <Link to="/" style={styles.link}>
              Routenliste
            </Link>{' '}
            oder unter{' '}
            <Link to="/nearby" style={styles.link}>
              In der Nähe
            </Link>{' '}
            hinzu.
          </p>
        ) : null}

        {rows.length > 0 && (
          <CompareTable
            rows={rows}
            highlightedId={highlightedId}
            onHighlight={setHighlightedId}
            onRemove={remove}
            onMakeReference={makeReference}
          />
        )}

        {rows.length > 0 && (
          <>
            <SidebarDivider />
            <button type="button" onClick={clear} style={styles.clearButton}>
              Vergleichsliste leeren
            </button>
          </>
        )}
      </SidebarLayout>

      <div style={styles.main}>
        <div style={styles.mapArea}>
          <CompareMap tracks={tracks} hover={hover} highlightedId={highlightedId} onHighlight={setHighlightedId} />
        </div>
        <div style={styles.profilePanel}>
          {tracks.length > 0 ? (
            <CompareElevationProfile tracks={tracks} onHover={setHover} />
          ) : (
            <div style={styles.profileHint}>
              {rows.some((r) => r.isLoading) ? 'Lade Höhenprofile…' : 'Keine Routen zum Anzeigen'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CompareTable({
  rows,
  highlightedId,
  onHighlight,
  onRemove,
  onMakeReference,
}: {
  rows: Array<CompareRow>
  highlightedId: string | null
  onHighlight: (id: string | null) => void
  onRemove: (id: string) => void
  onMakeReference: (id: string) => void
}) {
  const reference = rows[0]

  return (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={{ ...styles.th, textAlign: 'left' }}>Route</th>
          <th style={styles.th}>Strecke</th>
          <th style={styles.th}>Höhenmeter</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => {
          const isReference = index === 0
          return (
            <tr
              key={row.item.id}
              onMouseEnter={() => onHighlight(row.item.id)}
              onMouseLeave={() => onHighlight(null)}
              style={{ ...styles.row, ...(highlightedId === row.item.id ? styles.highlightedRow : {}) }}
            >
              <td style={styles.nameCell}>
                <div style={styles.nameLine}>
                  <span style={{ ...styles.swatch, backgroundColor: row.color }} />
                  <Link
                    to="/routes/$routeId"
                    params={{ routeId: row.item.id }}
                    style={styles.routeLink}
                    title={row.name}
                  >
                    {row.name}
                  </Link>
                </div>
                <div style={styles.rowActions}>
                  {isReference ? (
                    <span style={styles.referenceBadge}>Referenz</span>
                  ) : (
                    <button type="button" onClick={() => onMakeReference(row.item.id)} style={styles.textButton}>
                      Als Referenz
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemove(row.item.id)}
                    style={styles.textButton}
                    aria-label={`${row.name} aus dem Vergleich entfernen`}
                  >
                    Entfernen
                  </button>
                </div>
                {row.isError && <div style={styles.error}>Route nicht gefunden</div>}
              </td>
              <StatCell
                value={row.distance}
                reference={isReference ? null : reference.distance}
                format={formatKm}
                isLoading={row.isLoading}
              />
              <StatCell
                value={row.elevationGain}
                reference={isReference ? null : reference.elevationGain}
                format={formatMeters}
                isLoading={row.isLoading}
              />
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function StatCell({
  value,
  reference,
  format,
  isLoading,
}: {
  value: number | null
  /** Value of the reference route; null for the reference itself */
  reference: number | null
  format: (v: number) => string
  isLoading: boolean
}) {
  if (value == null) return <td style={styles.statCell}>{isLoading ? '…' : '–'}</td>
  return (
    <td style={styles.statCell}>
      <div style={styles.statValue}>{format(value)}</div>
      {reference != null && <div style={styles.difference}>{formatDifference(value, reference, format)}</div>}
    </td>
  )
}

/** All compared tracks on one map, plus markers for the position hovered in the elevation profile */
function CompareMap({
  tracks,
  hover,
  highlightedId,
  onHighlight,
}: {
  tracks: Array<ProfileTrack>
  hover: ProfileHover | null
  highlightedId: string | null
  onHighlight: (id: string | null) => void
}) {
  const [map, setMap] = useState<L.Map | null>(null)
  // Polylines by route ID, so highlighting only restyles them instead of redrawing
  const linesRef = useRef(new globalThis.Map<string, L.Polyline>())
  const highlightedIdRef = useRef(highlightedId)
  highlightedIdRef.current = highlightedId
  const colorById = Object.fromEntries(tracks.map((t) => [t.id, t.color]))

  // Fit the view only when the set of routes changes, not when the reference (order) changes
  const trackKey = tracks
    .map((t) => t.id)
    .sort()
    .join(',')

  useEffect(() => {
    if (!map || tracks.length === 0) return
    const layer = L.layerGroup()
    const lines = linesRef.current
    for (const track of tracks) {
      const line = L.polyline(
        track.points.map((p) => [p.latitude, p.longitude] as [number, number]),
        { ...track, opacity: 0.9, weight: track.id === highlightedIdRef.current ? 7 : 4 },
      )
        .bindTooltip(track.name, { sticky: true })
        .on('mouseover', () => onHighlight(track.id))
        .on('mouseout', () => onHighlight(null))
        .addTo(layer)
      lines.set(track.id, line)
    }
    layer.addTo(map)
    if (highlightedIdRef.current) lines.get(highlightedIdRef.current)?.bringToFront()
    return () => {
      layer.remove()
      lines.clear()
    }
  }, [map, tracks, onHighlight])

  // Overlapping routes hide each other: bring the highlighted one to the front
  useEffect(() => {
    for (const [id, line] of linesRef.current) {
      line.setStyle({ weight: id === highlightedId ? 7 : 4 })
    }
    if (highlightedId) linesRef.current.get(highlightedId)?.bringToFront()
  }, [highlightedId])

  useEffect(() => {
    if (!map || tracks.length === 0) return
    const bounds = L.latLngBounds(
      tracks.flatMap((t) => t.points.map((p) => [p.latitude, p.longitude] as [number, number])),
    )
    map.fitBounds(bounds, { padding: [24, 24] })
    // Only on a different set of routes, see trackKey
  }, [map, trackKey])

  useEffect(() => {
    if (!map || !hover) return
    const markers = hover.map(({ id, point }) =>
      L.circleMarker([point.latitude, point.longitude], {
        radius: 6,
        color: '#fff',
        weight: 2,
        fillColor: colorById[id] ?? '#60a5fa',
        fillOpacity: 1,
        interactive: false,
      }).addTo(map),
    )
    return () => markers.forEach((m) => m.remove())
  }, [map, hover])

  return <Map onMapReady={setMap} />
}

const styles = {
  container: {
    display: 'flex',
    height: '100%',
    width: '100%',
  } as const,
  main: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
  } as const,
  mapArea: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
  } as const,
  profilePanel: {
    height: 220,
    flexShrink: 0,
    padding: '12px 16px 8px',
    backgroundColor: '#1e293b',
    borderTop: '1px solid #334155',
    boxSizing: 'border-box',
  } as const,
  profileHint: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    fontSize: 13,
    color: '#94a3b8',
  } as const,
  backLink: {
    color: '#93c5fd',
    textDecoration: 'none',
    fontSize: 14,
  } as const,
  heading: {
    margin: 0,
    fontSize: 20,
    fontWeight: 600,
  } as const,
  hint: {
    margin: 0,
    fontSize: 13,
    lineHeight: 1.5,
    color: '#94a3b8',
  } as const,
  link: {
    color: '#93c5fd',
  } as const,
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
  } as const,
  th: {
    padding: '0 0 6px',
    textAlign: 'right',
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: '#94a3b8',
    borderBottom: '1px solid #334155',
  } as const,
  row: {
    borderBottom: '1px solid #334155',
    verticalAlign: 'top',
  } as const,
  highlightedRow: {
    backgroundColor: 'rgba(148,163,184,0.12)',
  } as const,
  nameCell: {
    padding: '8px 8px 8px 0',
    maxWidth: 0,
    width: '100%',
  } as const,
  nameLine: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  } as const,
  swatch: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    flexShrink: 0,
  } as const,
  routeLink: {
    color: '#e2e8f0',
    textDecoration: 'none',
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } as const,
  rowActions: {
    display: 'flex',
    gap: 10,
    marginTop: 4,
    paddingLeft: 16,
  } as const,
  referenceBadge: {
    fontSize: 11,
    fontWeight: 600,
    color: '#fbbf24',
  } as const,
  textButton: {
    padding: 0,
    fontSize: 11,
    border: 'none',
    background: 'none',
    color: '#93c5fd',
    cursor: 'pointer',
  } as const,
  statCell: {
    padding: '8px 0 8px 8px',
    textAlign: 'right',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  } as const,
  statValue: {
    fontWeight: 600,
  } as const,
  difference: {
    marginTop: 2,
    fontSize: 12,
    color: '#94a3b8',
  } as const,
  error: {
    marginTop: 4,
    paddingLeft: 16,
    fontSize: 12,
    color: '#fca5a5',
  } as const,
  clearButton: {
    alignSelf: 'flex-start',
    padding: '6px 12px',
    fontSize: 13,
    backgroundColor: 'transparent',
    color: '#cbd5e1',
    border: '1px solid #475569',
    borderRadius: 4,
    cursor: 'pointer',
  } as const,
}
