import { type TrackPoint } from './types'

/**
 * Escape a string for safe inclusion in XML element text or attribute values.
 */
function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/**
 * Build a single `<trkpt>` element from a track point.
 *
 * Emits `ele`, `time` and (when present) a `gpxtpx` extension with `hr`/`cad`,
 * matching the shape that {@link parseGpx} reads back.
 */
function serializeTrackPoint(point: TrackPoint): string {
  const lines: string[] = [
    `      <trkpt lat="${point.latitude}" lon="${point.longitude}">`,
    `        <ele>${point.elevation}</ele>`,
    `        <time>${point.time.toISOString()}</time>`,
  ]

  const extensionChildren: string[] = []
  if (typeof point.hr === 'number') {
    extensionChildren.push(`          <gpxtpx:hr>${point.hr}</gpxtpx:hr>`)
  }
  if (typeof point.cad === 'number') {
    extensionChildren.push(`          <gpxtpx:cad>${point.cad}</gpxtpx:cad>`)
  }

  if (extensionChildren.length > 0) {
    lines.push('        <extensions>')
    lines.push('          <gpxtpx:TrackPointExtension>')
    lines.push(...extensionChildren)
    lines.push('          </gpxtpx:TrackPointExtension>')
    lines.push('        </extensions>')
  }

  lines.push('      </trkpt>')
  return lines.join('\n')
}

/**
 * Serialize track points into a GPX 1.1 XML string.
 *
 * Counterpart to {@link parseGpx}: it produces the same element shape (ele, time,
 * gpxtpx extensions for hr/cad) so a track imported from Strava streams round-trips
 * through the `routes.gpxContent` column instead of being stored as stringified JSON.
 */
export function serializeGpx(points: Array<TrackPoint>, name?: string): string {
  const trkName = name ? `    <name>${escapeXml(name)}</name>` : ''
  const trkpts = points.map(serializeTrackPoint).join('\n')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<gpx version="1.1" creator="gpx-toolbox">',
    '  <trk>',
    trkName,
    '    <trkseg>',
    trkpts,
    '    </trkseg>',
    '  </trk>',
    '</gpx>',
  ]
    .filter((line) => line !== '')
    .join('\n')
}
