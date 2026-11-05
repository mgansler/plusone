/** One row of the routes.csv of a Strava data export */
export type ExportRoute = {
  name: string
  /** Path of the GPX file relative to the export, e.g. `routes/12.gpx` */
  filename: string
}

/** What was found in the files the user selected */
export type StravaExport = {
  routes: Array<ExportRoute>
  /** GPX files of the export by their path relative to the export folder */
  gpxFiles: Map<string, File>
}

/** Parses CSV: quoted fields, doubled quotes inside them and line breaks inside quotes (RFC 4180) */
export function parseCsv(text: string): Array<Array<string>> {
  const rows: Array<Array<string>> = []
  let row: Array<string> = []
  let field = ''
  let quoted = false

  // A byte order mark would end up in the first header name
  const input = text.startsWith('﻿') ? text.slice(1) : text

  for (let i = 0; i < input.length; i++) {
    const char = input[i]
    if (quoted) {
      if (char === '"' && input[i + 1] === '"') {
        field += '"'
        i++
      } else if (char === '"') {
        quoted = false
      } else {
        field += char
      }
    } else if (char === '"') {
      quoted = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && input[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += char
    }
  }

  // Last line without line break
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  // Blank lines are rows with a single empty field
  return rows.filter((r) => !(r.length === 1 && r[0] === ''))
}

/** Reads the routes of a Strava `routes.csv` (columns "Route Name" and "Route Filename") */
export function parseRoutesCsv(text: string): Array<ExportRoute> {
  const [header, ...rows] = parseCsv(text)
  const nameColumn = header?.indexOf('Route Name') ?? -1
  const filenameColumn = header?.indexOf('Route Filename') ?? -1
  if (nameColumn < 0 || filenameColumn < 0) {
    throw new Error('Das ist keine routes.csv eines Strava-Exports.')
  }

  return rows
    .filter((row) => row[filenameColumn]?.trim())
    .map((row) => ({ name: row[nameColumn]?.trim() ?? '', filename: row[filenameColumn].trim() }))
}

/** Path of a selected file relative to the folder the user picked */
function relativePath(file: File): string {
  return file.webkitRelativePath || file.name
}

/**
 * Finds `routes.csv` and the GPX files of the routes among the files of a selected export folder. Only these are
 * looked at, the rest of an export (activities, photos, ...) is not touched. Returns null without a routes.csv.
 */
export async function readStravaExport(files: Array<File>): Promise<StravaExport | null> {
  // The export folder itself holds routes.csv, a file deeper down with the same name is not it
  const csv = files
    .filter((file) => relativePath(file).split('/').pop() === 'routes.csv')
    .sort((a, b) => relativePath(a).split('/').length - relativePath(b).split('/').length)[0]
  if (!csv) return null

  const path = relativePath(csv)
  const root = path.slice(0, path.length - 'routes.csv'.length)

  const gpxFiles = new Map<string, File>()
  for (const file of files) {
    const filePath = relativePath(file)
    if (filePath.startsWith(`${root}routes/`) && filePath.toLowerCase().endsWith('.gpx')) {
      gpxFiles.set(filePath.slice(root.length), file)
    }
  }

  return { routes: parseRoutesCsv(await csv.text()), gpxFiles }
}
