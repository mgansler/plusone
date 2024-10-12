import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import { Prisma, PrismaService } from '@plusone/stgtrails-persistence'

import { AppModule } from './app.module'
import { AppService } from './app.service'

describe('TrailAreaController', () => {
  let app: INestApplication

  const appServiceMock = {
    fetchDataForNewArea: jest.fn(),
  }
  const prismaServiceMock = {
    trailArea: {
      create: (input: Prisma.TrailAreaCreateArgs) =>
        Promise.resolve({
          trailAreaId: 1,
          name: input.data.name,
          longitude: input.data.longitude,
          latitude: input.data.latitude,
          threshold: 0.35,
        }),
      update: (input: Prisma.TrailAreaUpdateArgs) =>
        Promise.resolve({
          trailAreaId: input.where.id,
          name: input.data.name,
          longitude: input.data.longitude,
          latitude: input.data.latitude,
          threshold: input.data.threshold,
        }),
    },
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AppService)
      .useValue(appServiceMock)
      .overrideProvider(PrismaService)
      .useValue(prismaServiceMock)
      .compile()

    app = moduleRef.createNestApplication()
    app.useGlobalPipes(new ValidationPipe())
    app.setGlobalPrefix('api')
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('createTrailArea', () => {
    it('should reject missing properties', async () => {
      const res = await request(app.getHttpServer()).post('/api/trailAreas').send({})

      expect(res.status).toBe(400)
      expect(res.body.message).toEqual([
        'name must be longer than or equal to 1 characters',
        'latitude must not be greater than 90',
        'latitude must not be less than -90',
        'longitude must not be greater than 180',
        'longitude must not be less than -180',
      ])
      expect(appServiceMock.fetchDataForNewArea).not.toHaveBeenCalled()
    })

    it('should reject too large values', async () => {
      const res = await request(app.getHttpServer()).post('/api/trailAreas').send({
        name: 'TestTrailArea',
        latitude: 100,
        longitude: 200,
        threshold: 1.01,
      })

      expect(res.status).toBe(400)
      expect(res.body.message).toEqual([
        'latitude must not be greater than 90',
        'longitude must not be greater than 180',
        'threshold must not be greater than 1',
      ])
      expect(appServiceMock.fetchDataForNewArea).not.toHaveBeenCalled()
    })

    it('should reject too small longitude/latitude', async () => {
      const res = await request(app.getHttpServer()).post('/api/trailAreas').send({
        name: 'TestTrailArea',
        latitude: -100,
        longitude: -200,
        threshold: -0.01,
      })

      expect(res.status).toBe(400)
      expect(res.body.message).toEqual([
        'latitude must not be less than -90',
        'longitude must not be less than -180',
        'threshold must not be less than 0',
      ])
      expect(appServiceMock.fetchDataForNewArea).not.toHaveBeenCalled()
    })

    it('should create a trail area', async () => {
      const res = await request(app.getHttpServer()).post('/api/trailAreas').send({
        name: 'TestTrailArea',
        latitude: 48,
        longitude: 9,
      })
      expect(res.status).toBe(201)
      expect(res.body).toEqual({
        trailAreaId: 1,
        name: 'TestTrailArea',
        latitude: 48,
        longitude: 9,
        threshold: 0.35,
      })
      expect(appServiceMock.fetchDataForNewArea).toHaveBeenCalled()
    })
  })

  describe('updateTrailArea', () => {
    it('should reject missing properties', async () => {
      const res = await request(app.getHttpServer()).put('/api/trailAreas/1').send({})

      expect(res.status).toBe(400)
      expect(res.body.message).toEqual([
        'name must be longer than or equal to 1 characters',
        'latitude must not be greater than 90',
        'latitude must not be less than -90',
        'longitude must not be greater than 180',
        'longitude must not be less than -180',
        'threshold must not be greater than 1',
        'threshold must not be less than 0',
      ])
      expect(appServiceMock.fetchDataForNewArea).not.toHaveBeenCalled()
    })

    it('should update a trail area', async () => {
      const res = await request(app.getHttpServer()).put('/api/trailAreas/2').send({
        name: 'UpdatedTrailArea',
        latitude: 49,
        longitude: 10,
        threshold: 0.5,
      })

      expect(res.status).toBe(200)
      expect(res.body).toEqual({
        trailAreaId: 2,
        name: 'UpdatedTrailArea',
        latitude: 49,
        longitude: 10,
        threshold: 0.5,
      })
      expect(appServiceMock.fetchDataForNewArea).toHaveBeenCalled()
    })
  })
})
