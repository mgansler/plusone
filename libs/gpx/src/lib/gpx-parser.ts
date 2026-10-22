import { XMLParser } from 'fast-xml-parser'
import { type TrackPoint } from './types'

const xmlParser = new XMLParser({ ignoreAttributes: false })

/**
 * Parse GPX XML into a flat array of track points.
 *
 * Extracts elevation, time, heart rate and cadence from the
 * `<trkpt>` elements (including the optional `gpxtpx` extensions).
 */
export function parseGpx(xml: string): TrackPoint[] {
  const parsed = xmlParser.parse(xml)

  // fast-xml-parser returns a single object (not array) for single-element nodes
  const trkpts = parsed.gpx.trk.trkseg.trkpt
  if (!trkpts) return []

  const points = Array.isArray(trkpts) ? trkpts : [trkpts]

  return (points as any[]).map((trkpt) => ({
    latitude: parseFloat(trkpt['@_lat']),
    longitude: parseFloat(trkpt['@_lon']),
    elevation: parseFloat(trkpt.ele),
    time: new Date(trkpt.time),
    hr: trkpt.extensions?.['gpxtpx:TrackPointExtension']?.['gpxtpx:hr'],
    cad: trkpt.extensions?.['gpxtpx:TrackPointExtension']?.['gpxtpx:cad'],
  }))
}
