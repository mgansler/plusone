import { INestApplication, NotFoundException, ValidationPipe } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import { ActivitiesController } from './activities.controller'
import { ActivitiesService } from './activities.service'
import { JwtStrategy } from './jwt.strategy'
import { RidesController } from './rides.controller'
import { RidesService } from './rides.service'
import { RoutesController } from './routes.controller'
import { RoutesService } from './routes.service'

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
  }
  const activitiesService = { findAll: vi.fn(), findOne: vi.fn(), update: vi.fn(), remove: vi.fn() }
  const ridesService = { findOne: vi.fn(), getWeatherForecast: vi.fn() }
  const sign = (payload: object, options?: { expiresIn?: number }) =>
    new JwtService({ secret: SECRET }).sign(payload, options)
  const get = (url: string) => request(app.getHttpServer()).get(url).set('Authorization', `Bearer ${token}`)

  beforeAll(async () => {
    process.env.JWT_SECRET = SECRET

    const moduleRef = await Test.createTestingModule({
      imports: [PassportModule],
      controllers: [RoutesController, ActivitiesController, RidesController],
      providers: [
        JwtStrategy,
        { provide: RoutesService, useValue: routesService },
        { provide: ActivitiesService, useValue: activitiesService },
        { provide: RidesService, useValue: ridesService },
      ],
    }).compile()

    app = moduleRef.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ transform: true }))
    await app.init()

    token = sign({ sub: 'user-1' })
  })

  afterAll(async () => {
    await app.close()
    delete process.env.JWT_SECRET
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('authentication', () => {
    it.each([
      ['GET', '/routes'],
      ['GET', `/routes/${ROUTE_ID}`],
      ['GET', '/activities'],
      ['GET', `/routes/${ROUTE_ID}/activities/${ACTIVITY_ID}`],
      ['POST', '/routes'],
    ])('rejects %s %s without token', async (method, url) => {
      const server = request(app.getHttpServer())
      await (method === 'GET' ? server.get(url) : server.post(url)).expect(401)
    })

    it('rejects a token signed with a different secret', async () => {
      const forged = new JwtService({ secret: 'other' }).sign({ sub: 'user-1' })

      await request(app.getHttpServer()).get('/routes').set('Authorization', `Bearer ${forged}`).expect(401)
      expect(routesService.findAll).not.toHaveBeenCalled()
    })

    it('rejects an expired token', async () => {
      const expired = sign({ sub: 'user-1' }, { expiresIn: -10 })

      await request(app.getHttpServer()).get('/routes').set('Authorization', `Bearer ${expired}`).expect(401)
    })

    it('rejects a token without user id', async () => {
      const noSub = sign({ name: 'no user id' })

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
})
