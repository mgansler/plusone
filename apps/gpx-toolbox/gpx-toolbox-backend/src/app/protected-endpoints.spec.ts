import { INestApplication, NotFoundException, ValidationPipe } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import { PrismaService } from '@plusone/gpx-toolbox-persistence'

import { ActivitiesController } from './activities.controller'
import { ActivitiesService } from './activities.service'
import { AuthService } from './auth.service'
import { DebugController } from './debug.controller'
import { ImportController } from './import.controller'
import { ImportService } from './import.service'
import { JwtStrategy } from './jwt.strategy'
import { RidesController } from './rides.controller'
import { RidesService } from './rides.service'
import { RoutesController } from './routes.controller'
import { RoutesService } from './routes.service'
import { StravaService } from './strava.service'

const SECRET = 'test-secret'
const ROUTE_ID = '3f2c1b6e-6a4f-4c39-9f0e-2d4c1a1b2c3d'
const ACTIVITY_ID = '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d'

/**
 * HTTP-level tests of the protected controllers with the real JWT guard and strategy:
 * authentication, parameter parsing and error mapping. The services are mocked.
 */
describe('Protected endpoints', () => {
  let app: INestApplication
  let token: string

  const routesService = {
    findAll: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    exportGpx: vi.fn(),
    findNearby: vi.fn(),
    getStravaActivities: vi.fn(),
  }
  const activitiesService = { findAll: vi.fn(), findOne: vi.fn(), update: vi.fn(), remove: vi.fn() }
  const ridesService = { findOne: vi.fn(), getWeatherForecast: vi.fn() }
  const importService = { importStravaRoutes: vi.fn(), importStravaActivity: vi.fn(), importAllActivities: vi.fn() }
  const stravaService = { getAthlete: vi.fn(), fetchStrava: vi.fn() }
  const authService = { getValidAccessToken: vi.fn() }
  const prisma = { user: { findUnique: vi.fn() } }

  const sign = (payload: object, options?: { expiresIn?: number }) =>
    new JwtService({ secret: SECRET }).sign(payload, options)
  const get = (url: string) => request(app.getHttpServer()).get(url).set('Authorization', `Bearer ${token}`)
  const post = (url: string) => request(app.getHttpServer()).post(url).set('Authorization', `Bearer ${token}`)

  beforeAll(async () => {
    process.env.JWT_SECRET = SECRET

    const moduleRef = await Test.createTestingModule({
      imports: [PassportModule],
      controllers: [RoutesController, ActivitiesController, RidesController, ImportController, DebugController],
      providers: [
        JwtStrategy,
        { provide: RoutesService, useValue: routesService },
        { provide: ActivitiesService, useValue: activitiesService },
        { provide: RidesService, useValue: ridesService },
        { provide: ImportService, useValue: importService },
        { provide: StravaService, useValue: stravaService },
        { provide: AuthService, useValue: authService },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile()

    app = moduleRef.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ transform: true }))
    await app.init()

    token = sign({ sub: 'user-1', stravaId: '42' })
  })

  afterAll(async () => {
    await app.close()
    delete process.env.JWT_SECRET
  })

  beforeEach(() => {
    vi.clearAllMocks()
    authService.getValidAccessToken.mockResolvedValue('strava-token')
  })

  describe('authentication', () => {
    it.each([
      ['GET', '/routes'],
      ['GET', `/routes/${ROUTE_ID}`],
      ['GET', '/activities'],
      ['GET', `/routes/${ROUTE_ID}/activities/${ACTIVITY_ID}`],
      ['POST', '/import/strava/routes'],
      ['GET', '/debug/strava?endpoint=/athlete'],
    ])('rejects %s %s without token', async (method, url) => {
      const server = request(app.getHttpServer())
      await (method === 'GET' ? server.get(url) : server.post(url)).expect(401)
    })

    it('rejects a token signed with a different secret', async () => {
      const forged = new JwtService({ secret: 'other' }).sign({ sub: 'user-1', stravaId: '42' })

      await request(app.getHttpServer()).get('/routes').set('Authorization', `Bearer ${forged}`).expect(401)
      expect(routesService.findAll).not.toHaveBeenCalled()
    })

    it('rejects an expired token', async () => {
      const expired = sign({ sub: 'user-1', stravaId: '42' }, { expiresIn: -10 })

      await request(app.getHttpServer()).get('/routes').set('Authorization', `Bearer ${expired}`).expect(401)
    })

    it('rejects a token without user id', async () => {
      const noSub = sign({ stravaId: '42' })

      await request(app.getHttpServer()).get('/routes').set('Authorization', `Bearer ${noSub}`).expect(401)
      expect(routesService.findAll).not.toHaveBeenCalled()
    })

    it('passes the user id of the token to the service', async () => {
      routesService.findAll.mockResolvedValue({ items: [] })

      await get('/routes').expect(200)

      expect(routesService.findAll).toHaveBeenCalledWith(expect.anything(), 'user-1')
    })
  })

  describe('routes', () => {
    it('rejects ids that are not UUIDs', async () => {
      await get('/routes/not-a-uuid').expect(400)
      await request(app.getHttpServer())
        .put('/routes/not-a-uuid')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400)
      expect(routesService.findById).not.toHaveBeenCalled()
    })

    it('maps a missing route to 404', async () => {
      routesService.update.mockRejectedValue(new NotFoundException())

      await request(app.getHttpServer())
        .put(`/routes/${ROUTE_ID}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'x' })
        .expect(404)
    })

    it('validates the update body', async () => {
      await request(app.getHttpServer())
        .put(`/routes/${ROUTE_ID}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'unknown' })
        .expect(400)
      expect(routesService.update).not.toHaveBeenCalled()
    })

    it('exports GPX as a download', async () => {
      routesService.exportGpx.mockResolvedValue('<gpx/>')

      const res = await get(`/routes/${ROUTE_ID}/export`).expect(200)

      expect(res.headers['content-type']).toContain('application/gpx+xml')
      expect(res.headers['content-disposition']).toBe('attachment; filename="route.gpx"')
      expect(res.text).toBe('<gpx/>')
    })

    it('parses the nearby query as numbers', async () => {
      routesService.findNearby.mockResolvedValue([])

      await get('/routes/nearby?lat=48.5&lng=9.25&radius=10').expect(200)

      expect(routesService.findNearby).toHaveBeenCalledWith(48.5, 9.25, 10, 'user-1')
    })

    it.each(['/routes/nearby?lat=48.5&lng=9.25', '/routes/nearby?lat=abc&lng=9.25&radius=10'])(
      'rejects an incomplete or invalid nearby query: %s',
      async (url) => {
        await get(url).expect(400)
        expect(routesService.findNearby).not.toHaveBeenCalled()
      },
    )

    it('uses default paging for Strava activities when page and per_page are omitted', async () => {
      routesService.getStravaActivities.mockResolvedValue([])

      await get('/routes/strava-activities').expect(200)

      expect(routesService.getStravaActivities).toHaveBeenCalledWith('strava-token', 'user-1', 1, 50, {
        after: undefined,
        before: undefined,
      })
    })

    it('converts the Strava activity date range to epoch seconds and rejects invalid dates', async () => {
      routesService.getStravaActivities.mockResolvedValue([])

      await get('/routes/strava-activities?page=2&per_page=10&after=2024-01-01T00:00:00Z').expect(200)
      expect(routesService.getStravaActivities).toHaveBeenCalledWith('strava-token', 'user-1', 2, 10, {
        after: 1704067200,
        before: undefined,
      })

      await get('/routes/strava-activities?before=yesterday').expect(400)
    })
  })

  describe('activities', () => {
    it('rejects ids that are not UUIDs', async () => {
      await get('/activities/123').expect(400)
      await get(`/routes/${ROUTE_ID}/activities/123`).expect(400)
    })

    it('validates the list query', async () => {
      await get('/activities?minDistance=-1').expect(400)
      expect(activitiesService.findAll).not.toHaveBeenCalled()
    })

    it('loads the weather only for the route of the activity of the user', async () => {
      ridesService.findOne.mockResolvedValue({ riddenAt: new Date('2024-06-01T08:00:00Z') })
      ridesService.getWeatherForecast.mockResolvedValue(null)

      await get(`/routes/${ROUTE_ID}/activities/${ACTIVITY_ID}/weather`).expect(200)

      expect(ridesService.findOne).toHaveBeenCalledWith(ROUTE_ID, ACTIVITY_ID, 'user-1')
      expect(ridesService.getWeatherForecast).toHaveBeenCalledWith(ROUTE_ID, '2024-06-01', 'user-1')
    })
  })

  describe('import', () => {
    it('passes force=true to the route import', async () => {
      stravaService.getAthlete.mockResolvedValue({ id: 42 })
      importService.importStravaRoutes.mockResolvedValue({})

      await post('/import/strava/routes?force=true').expect(201)
      await post('/import/strava/routes').expect(201)

      expect(importService.importStravaRoutes.mock.calls.map((call) => call[3])).toEqual([true, false])
    })

    it('answers 502 when the athlete cannot be loaded from Strava', async () => {
      stravaService.getAthlete.mockResolvedValue({ message: 'Authorization Error' })

      await post('/import/strava/routes').expect(502)
      expect(importService.importStravaRoutes).not.toHaveBeenCalled()
    })

    it('requires an activity id for a single activity import', async () => {
      await post('/import/strava/activity').expect(400)
      expect(importService.importStravaActivity).not.toHaveBeenCalled()
    })

    it('auto-matches unless autoMatch=false', async () => {
      importService.importStravaActivity.mockResolvedValue({})

      await post('/import/strava/activity?activityId=1').expect(201)
      await post('/import/strava/activity?activityId=2&autoMatch=false').expect(201)

      expect(importService.importStravaActivity.mock.calls.map((call) => call[3])).toEqual([true, false])
    })

    it('parses the limit of the bulk import and falls back to 100', async () => {
      importService.importAllActivities.mockResolvedValue({})

      await post('/import/strava/all-activities?limit=25').expect(201)
      await post('/import/strava/all-activities?limit=abc').expect(201)

      expect(importService.importAllActivities.mock.calls.map((call) => call[2])).toEqual([25, 100])
    })
  })

  describe('debug', () => {
    beforeEach(() => {
      prisma.user.findUnique.mockResolvedValue({ stravaId: '42' })
      stravaService.fetchStrava.mockResolvedValue({ ok: true, status: 200, json: async () => ({ id: 42 }) })
    })

    it('forwards a Strava API request and fills in the athlete id', async () => {
      const res = await get('/debug/strava?endpoint=/athletes/{id}/stats').expect(200)

      expect(stravaService.fetchStrava).toHaveBeenCalledWith('/athletes/42/stats', 'strava-token')
      expect(res.body).toEqual({ status: 200, data: { id: 42 } })
    })

    it.each([
      'https://evil.example.com/steal',
      '//evil.example.com/steal',
      'https://www.strava.com.evil.example.com/api/v3/athlete',
      'https://www.strava.com/oauth/token',
      'file:///etc/passwd',
    ])('does not send the access token anywhere but the Strava API: %s', async (endpoint) => {
      await get(`/debug/strava?endpoint=${encodeURIComponent(endpoint)}`).expect(400)

      expect(stravaService.fetchStrava).not.toHaveBeenCalled()
    })

    it('rejects a request without endpoint', async () => {
      await get('/debug/strava').expect(400)
    })
  })
})
