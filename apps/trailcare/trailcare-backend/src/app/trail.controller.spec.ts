import { INestApplication, NotFoundException } from '@nestjs/common'
import request from 'supertest'

import { AS_ADMIN, AS_USER, ADMIN_SESSION, createControllerTestApp, USER_SESSION } from './controller-test-app'
import { TrailController } from './trail.controller'
import { TrailService } from './trail.service'

describe('TrailController', () => {
  let app: INestApplication
  const trailService = { listTrailAreas: vi.fn(), getTrail: vi.fn() }

  beforeAll(async () => {
    app = await createControllerTestApp({
      controllers: [TrailController],
      providers: [{ provide: TrailService, useValue: trailService }],
    })
  })

  afterAll(() => app.close())

  beforeEach(() => vi.resetAllMocks())

  describe('GET /api/trail-areas', () => {
    it('requires a session', async () => {
      await request(app.getHttpServer()).get('/api/trail-areas').expect(401)
      expect(trailService.listTrailAreas).not.toHaveBeenCalled()
    })

    it('returns the areas for the current session', async () => {
      trailService.listTrailAreas.mockResolvedValue([{ id: 1, name: 'Heslach', trails: [] }])

      await request(app.getHttpServer())
        .get('/api/trail-areas')
        .set('Cookie', AS_USER)
        .expect(200, [{ id: 1, name: 'Heslach', trails: [] }])
      expect(trailService.listTrailAreas).toHaveBeenCalledWith(USER_SESSION)
    })
  })

  describe('GET /api/trails/:trailId', () => {
    it('passes the parsed id and session', async () => {
      trailService.getTrail.mockResolvedValue({ id: 7, name: 'Jojo' })

      await request(app.getHttpServer())
        .get('/api/trails/7')
        .set('Cookie', AS_ADMIN)
        .expect(200, { id: 7, name: 'Jojo' })
      expect(trailService.getTrail).toHaveBeenCalledWith(7, ADMIN_SESSION)
    })

    it('rejects non numeric ids', async () => {
      await request(app.getHttpServer()).get('/api/trails/jojo').set('Cookie', AS_USER).expect(400)
      expect(trailService.getTrail).not.toHaveBeenCalled()
    })

    it('forwards not found', async () => {
      trailService.getTrail.mockRejectedValue(new NotFoundException())
      await request(app.getHttpServer()).get('/api/trails/7').set('Cookie', AS_USER).expect(404)
    })
  })
})
