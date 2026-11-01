import { createServer, type Server } from 'node:http'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export const STRAVA_ATHLETE = { id: 4711, firstname: 'Erika', lastname: 'Mustermann', username: 'erika' }

/** Activity that follows the "Hausrunde" fixture, so it is matched to that route on import */
export const MATCHING_ACTIVITY = { id: 1001, name: 'Feierabendrunde' }
/** Indoor ride without GPS track */
export const VIRTUAL_ACTIVITY = { id: 1002, name: 'Zwift Watopia' }

type Point = { lat: number; lng: number; ele: number }

function hausrundePoints(): Array<Point> {
  const gpx = readFileSync(join(__dirname, '../fixtures/hausrunde.gpx'), 'utf-8')
  return [...gpx.matchAll(/lat="([\d.]+)" lon="([\d.]+)"><ele>([\d.]+)/g)].map(([, lat, lng, ele]) => ({
    lat: Number(lat),
    lng: Number(lng),
    ele: Number(ele),
  }))
}

function activities() {
  return [
    {
      id: MATCHING_ACTIVITY.id,
      name: MATCHING_ACTIVITY.name,
      distance: 4300,
      total_elevation_gain: 117,
      moving_time: 1170,
      elapsed_time: 1200,
      start_date_local: '2024-06-01T10:00:00Z',
      sport_type: 'Ride',
      trainer: false,
      average_heartrate: 142,
      max_heartrate: 171,
    },
    {
      id: VIRTUAL_ACTIVITY.id,
      name: VIRTUAL_ACTIVITY.name,
      distance: 25000,
      total_elevation_gain: 300,
      moving_time: 3600,
      elapsed_time: 3600,
      start_date_local: '2024-06-02T18:00:00Z',
      sport_type: 'VirtualRide',
      trainer: true,
    },
  ]
}

function streams() {
  const points = hausrundePoints()
  return {
    latlng: { data: points.map((p) => [p.lat, p.lng]) },
    altitude: { data: points.map((p) => p.ele) },
    time: { data: points.map((_, i) => i * 30) },
    heartrate: { data: points.map((_, i) => 130 + (i % 20)) },
  }
}

/**
 * Minimal stand-in for the Strava OAuth and API endpoints used by the app. The backend is pointed at it
 * with STRAVA_BASE_URL, so the end-to-end tests never talk to the real Strava.
 */
export function startStravaMock(port: number): Promise<Server> {
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', `http://localhost:${port}`)
    const json = (status: number, body: unknown) => {
      res.writeHead(status, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(body))
    }

    // The user agrees on the Strava page and is sent back with a code
    if (url.pathname === '/oauth/authorize') {
      const callback = new URL(url.searchParams.get('redirect_uri') ?? '')
      callback.searchParams.set('code', 'e2e-code')
      callback.searchParams.set('state', url.searchParams.get('state') ?? '')
      res.writeHead(302, { Location: callback.toString() })
      return res.end()
    }

    if (url.pathname === '/oauth/token' && req.method === 'POST') {
      return json(200, {
        access_token: 'e2e-access-token',
        refresh_token: 'e2e-refresh-token',
        expires_at: Math.floor(Date.now() / 1000) + 6 * 3600,
        scope: 'read_all,activity:read_all,profile:read_all',
      })
    }

    if (req.headers.authorization !== 'Bearer e2e-access-token') {
      return json(401, { message: 'Authorization Error' })
    }

    if (url.pathname === '/api/v3/athlete') return json(200, STRAVA_ATHLETE)
    if (url.pathname === '/api/v3/athlete/activities') {
      return json(200, url.searchParams.get('page') === '1' ? activities() : [])
    }

    const activity = url.pathname.match(/^\/api\/v3\/activities\/(\d+)(\/streams)?$/)
    const found = activity && activities().find((a) => a.id === Number(activity[1]))
    if (found) return json(200, activity[2] ? streams() : found)

    json(404, { message: 'Record Not Found', path: url.pathname })
  })

  return new Promise((resolve) => {
    // Does not keep Cypress alive after the run
    server.listen(port, () => resolve(server)).unref()
  })
}
