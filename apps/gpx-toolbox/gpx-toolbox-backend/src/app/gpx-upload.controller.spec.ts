import { ExecutionContext, INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import { ImportController } from './import.controller'
import { ImportService } from './import.service'
import { JwtAuthGuard } from './jwt-auth.guard'
import { RoutesController } from './routes.controller'
import { RoutesService } from './routes.service'

/** Verifies the multipart parsing of the GPX upload endpoints (file + form fields) */
describe('GPX upload endpoints', () => {
  let app: INestApplication

  const routesService = { importGpx: vi.fn() }
  const importService = { importGpxActivity: vi.fn() }
  const gpx = Buffer.from('<gpx></gpx>')

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [RoutesController, ImportController],
      providers: [
        { provide: RoutesService, useValue: routesService },
        { provide: ImportService, useValue: importService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          context.switchToHttp().getRequest().user = { sub: 'user-1' }
          return true
        },
      })
      .compile()

    app = moduleRef.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ transform: true }))
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /routes', () => {
    it('passes file and form fields to the service', async () => {
      routesService.importGpx.mockResolvedValue({ id: 'r1' })

      await request(app.getHttpServer())
        .post('/routes')
        .attach('file', gpx, 'tour.gpx')
        .field('name', 'foo')
        .field('source', 'manualImport')
        .expect(201)

      expect(routesService.importGpx).toHaveBeenCalledWith(
        '<gpx></gpx>',
        expect.objectContaining({ name: 'foo', source: 'manualImport' }),
        'user-1',
      )
    })

    it('passes skipDuplicate as boolean', async () => {
      routesService.importGpx.mockResolvedValue({ id: 'r1' })

      await request(app.getHttpServer())
        .post('/routes')
        .attach('file', gpx, 'tour.gpx')
        .field('skipDuplicate', 'true')
        .expect(201)

      expect(routesService.importGpx).toHaveBeenCalledWith(
        '<gpx></gpx>',
        expect.objectContaining({ skipDuplicate: true }),
        'user-1',
      )
    })

    it('rejects an invalid skipDuplicate value', async () => {
      await request(app.getHttpServer())
        .post('/routes')
        .attach('file', gpx, 'tour.gpx')
        .field('skipDuplicate', 'maybe')
        .expect(400)

      expect(routesService.importGpx).not.toHaveBeenCalled()
    })

    it('accepts an upload without name', async () => {
      routesService.importGpx.mockResolvedValue({ id: 'r1' })

      await request(app.getHttpServer()).post('/routes').attach('file', gpx, 'tour.gpx').expect(201)

      expect(routesService.importGpx).toHaveBeenCalledWith(
        '<gpx></gpx>',
        expect.not.objectContaining({ name: expect.anything() }),
        'user-1',
      )
    })

    it('rejects a request without file', async () => {
      await request(app.getHttpServer()).post('/routes').field('name', 'foo').expect(400)
      expect(routesService.importGpx).not.toHaveBeenCalled()
    })
  })

  describe('POST /import/activity', () => {
    it('passes file and title to the service', async () => {
      importService.importGpxActivity.mockResolvedValue({ imported: 1, matched: 0, newRoutes: 1 })

      const res = await request(app.getHttpServer())
        .post('/import/activity')
        .attach('file', gpx, 'ride.gpx')
        .field('title', 'Feierabendrunde')
        .expect(201)

      expect(res.body).toEqual({ imported: 1, matched: 0, newRoutes: 1 })
      expect(importService.importGpxActivity).toHaveBeenCalledWith('<gpx></gpx>', 'user-1', 'Feierabendrunde')
    })

    it('returns 400 if the import fails', async () => {
      importService.importGpxActivity.mockRejectedValue(new Error('No track points found in GPX file'))

      const res = await request(app.getHttpServer())
        .post('/import/activity')
        .attach('file', gpx, 'ride.gpx')
        .expect(400)

      expect(res.body.message).toBe('No track points found in GPX file')
    })

    it('rejects files that are not GPX', async () => {
      await request(app.getHttpServer()).post('/import/activity').attach('file', gpx, 'ride.fit').expect(400)
      expect(importService.importGpxActivity).not.toHaveBeenCalled()
    })
  })
})
