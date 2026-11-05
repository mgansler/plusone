import { describe, expect, it } from 'vitest'

import { parseCsv, parseRoutesCsv, readStravaExport } from './stravaExport'

/** A file as the browser reports it for a selected folder */
function file(path: string, content = '') {
  const result = new File([content], path.split('/').pop() ?? path)
  Object.defineProperty(result, 'webkitRelativePath', { value: path })
  return result
}

describe('parseCsv', () => {
  it('splits rows and fields', () => {
    expect(parseCsv('a,b\nc,d\n')).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ])
  })

  it('keeps commas, quotes and line breaks inside quoted fields', () => {
    expect(
      parseCsv('"Wissembourg von Ionut, Kevin, Stefan",routes/19.gpx\n"Er sagte ""Hallo""","zwei\nZeilen"'),
    ).toEqual([
      ['Wissembourg von Ionut, Kevin, Stefan', 'routes/19.gpx'],
      ['Er sagte "Hallo"', 'zwei\nZeilen'],
    ])
  })

  it('handles CRLF line breaks, a missing final line break and blank lines', () => {
    expect(parseCsv('a,b\r\n\r\nc,d')).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ])
  })

  it('keeps empty fields', () => {
    expect(parseCsv('a,,c\n,b,')).toEqual([
      ['a', '', 'c'],
      ['', 'b', ''],
    ])
  })

  it('drops a byte order mark and keeps emoji and umlauts', () => {
    expect(parseCsv('﻿Name\nDavos Alps Epic | ☀️☀️☀️\nRötelbach 👍')).toEqual([
      ['Name'],
      ['Davos Alps Epic | ☀️☀️☀️'],
      ['Rötelbach 👍'],
    ])
  })

  it('returns nothing for an empty text', () => {
    expect(parseCsv('')).toEqual([])
  })
})

describe('parseRoutesCsv', () => {
  it('reads name and file of every route', () => {
    const csv = 'Route Name,Route Filename\nAlb Kehren,routes/2.gpx\n"Din -> Pietra: Variante 1",routes/46.gpx\n'

    expect(parseRoutesCsv(csv)).toEqual([
      { name: 'Alb Kehren', filename: 'routes/2.gpx' },
      { name: 'Din -> Pietra: Variante 1', filename: 'routes/46.gpx' },
    ])
  })

  it('finds the columns by their header, whatever the order', () => {
    expect(parseRoutesCsv('Route Filename,Route Name\nroutes/1.gpx,Runde')).toEqual([
      { name: 'Runde', filename: 'routes/1.gpx' },
    ])
  })

  it('skips rows without a file', () => {
    expect(parseRoutesCsv('Route Name,Route Filename\nOhne Datei,\nMit Datei,routes/1.gpx')).toEqual([
      { name: 'Mit Datei', filename: 'routes/1.gpx' },
    ])
  })

  it('rejects other CSV files', () => {
    expect(() => parseRoutesCsv('Activity ID,Activity Name\n1,Ride')).toThrow('keine routes.csv')
    expect(() => parseRoutesCsv('')).toThrow('keine routes.csv')
  })
})

describe('readStravaExport', () => {
  const csv = 'Route Name,Route Filename\nAlb Kehren,routes/2.gpx\nBali,routes/25.gpx\n'

  it('finds the routes and only their GPX files in a selected export folder', async () => {
    const files = [
      file('export_1/routes.csv', csv),
      file('export_1/routes/2.gpx', '<gpx/>'),
      file('export_1/routes/25.gpx', '<gpx/>'),
      file('export_1/activities.csv', 'Activity ID\n1'),
      file('export_1/activities/1.gpx', '<gpx/>'),
      file('export_1/activities/1.fit.gz'),
      file('export_1/routes/notes.txt'),
    ]

    const result = await readStravaExport(files)

    expect(result?.routes).toEqual([
      { name: 'Alb Kehren', filename: 'routes/2.gpx' },
      { name: 'Bali', filename: 'routes/25.gpx' },
    ])
    expect([...(result?.gpxFiles.keys() ?? [])].sort()).toEqual(['routes/2.gpx', 'routes/25.gpx'])
  })

  it('uses the routes.csv of the export folder, not one deeper down', async () => {
    const files = [
      file('export_1/other/routes.csv', 'Route Name,Route Filename\nFalsch,routes/9.gpx'),
      file('export_1/routes.csv', csv),
      file('export_1/routes/2.gpx'),
    ]

    const result = await readStravaExport(files)

    expect(result?.routes.map((r) => r.name)).toEqual(['Alb Kehren', 'Bali'])
  })

  it('returns null without a routes.csv', async () => {
    expect(await readStravaExport([file('export_1/activities.csv')])).toBeNull()
    expect(await readStravaExport([])).toBeNull()
  })

  it('reports a routes.csv of another kind', async () => {
    await expect(readStravaExport([file('export_1/routes.csv', 'a,b')])).rejects.toThrow('keine routes.csv')
  })
})
