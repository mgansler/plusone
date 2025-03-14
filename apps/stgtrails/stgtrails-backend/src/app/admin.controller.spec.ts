import process from 'node:process'

import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import { Prisma, PrismaService } from '@plusone/stgtrails-persistence'

import { AppModule } from './app.module'
import { AppService } from './app.service'
import { ADMIN_PASSWORD, ADMIN_USERNAME } from './config'
import { OsmService } from './osm.service'

describe('TrailAreaController', () => {
  let app: INestApplication

  const appServiceMock = {
    fetchDataForNewArea: jest.fn(),
  }
  const osmServiceMock = {
    reverseLookup: ({ latitude, longitude }) => {
      return {
        country: 'unknown',
        countryCode: 'unknown',
        state: 'unknown',
        stateCode: 'unknown',
      }
    },
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
      findMany: (input: Prisma.TrailAreaFindManyArgs) => Promise.resolve([]),
    },
  }

  const username = process.env[ADMIN_USERNAME]
  const password = process.env[ADMIN_PASSWORD]

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AppService)
      .useValue(appServiceMock)
      .overrideProvider(OsmService)
      .useValue(osmServiceMock)
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

  it('should have set a username and password', () => {
    expect(username).toBeDefined()
    expect(password).toBeDefined()
  })

  describe('createTrailArea', () => {
    describe('fromCoordinates', () => {
      it('should reject unauthenticated request', async () => {
        const res = await request(app.getHttpServer()).post('/api/trailAreas/fromCoordinates').send()

        expect(res.status).toBe(HttpStatus.UNAUTHORIZED)
      })

      it('should reject missing properties', async () => {
        const res = await request(app.getHttpServer())
          .post('/api/trailAreas/fromCoordinates')
          .auth(username, password)
          .send({})

        expect(res.status).toBe(HttpStatus.BAD_REQUEST)
        expect(res.body.message).toEqual([
          'latitude must not be greater than 90',
          'latitude must not be less than -90',
          'longitude must not be greater than 180',
          'longitude must not be less than -180',
          'name must be longer than or equal to 1 characters',
        ])
        expect(appServiceMock.fetchDataForNewArea).not.toHaveBeenCalled()
      })

      it('should reject too large values', async () => {
        const res = await request(app.getHttpServer())
          .post('/api/trailAreas/fromCoordinates')
          .auth(username, password)
          .send({
            name: 'TestTrailArea',
            latitude: 100,
            longitude: 200,
            threshold: 1.01,
          })

        expect(res.status).toBe(HttpStatus.BAD_REQUEST)
        expect(res.body.message).toEqual([
          'latitude must not be greater than 90',
          'longitude must not be greater than 180',
          'threshold must not be greater than 1',
        ])
        expect(appServiceMock.fetchDataForNewArea).not.toHaveBeenCalled()
      })

      it('should reject too small longitude/latitude', async () => {
        const res = await request(app.getHttpServer())
          .post('/api/trailAreas/fromCoordinates')
          .auth(username, password)
          .send({
            name: 'TestTrailArea',
            latitude: -100,
            longitude: -200,
            threshold: -0.01,
          })

        expect(res.status).toBe(HttpStatus.BAD_REQUEST)
        expect(res.body.message).toEqual([
          'latitude must not be less than -90',
          'longitude must not be less than -180',
          'threshold must not be less than 0',
        ])
        expect(appServiceMock.fetchDataForNewArea).not.toHaveBeenCalled()
      })

      it('should create a trail area', async () => {
        const res = await request(app.getHttpServer())
          .post('/api/trailAreas/fromCoordinates')
          .auth(username, password)
          .send({
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

    describe('fromUrl', () => {
      it('should reject unauthenticated request', async () => {
        const res = await request(app.getHttpServer()).post('/api/trailAreas/fromUrl').send()

        expect(res.status).toBe(HttpStatus.UNAUTHORIZED)
      })
      it('should reject missing properties', async () => {
        const res = await request(app.getHttpServer()).post('/api/trailAreas/fromUrl').auth(username, password).send({})

        expect(res.status).toBe(HttpStatus.BAD_REQUEST)
        expect(res.body.message).toEqual([
          'mapsShortUrl must be a URL address',
          'name must be longer than or equal to 1 characters',
        ])
        expect(appServiceMock.fetchDataForNewArea).not.toHaveBeenCalled()
      })

      it('should create a trail area', async () => {
        const res = await request(app.getHttpServer()).post('/api/trailAreas/fromUrl').auth(username, password).send({
          name: 'Whistler',
          mapsShortUrl: 'https://maps.app.goo.gl/bPvKchfbcaYH8CbP9',
        })
        expect(res.status).toBe(201)
        expect(res.body).toEqual({
          trailAreaId: 1,
          name: 'Whistler',
          latitude: 50.113334,
          longitude: -122.954281,
          threshold: 0.35,
        })
        expect(appServiceMock.fetchDataForNewArea).toHaveBeenCalled()
      })
    })
  })

  describe('updateTrailArea', () => {
    it('should reject unauthenticated request', async () => {
      const res = await request(app.getHttpServer()).put('/api/trailAreas/1').send()

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED)
    })

    it('should reject missing properties', async () => {
      const res = await request(app.getHttpServer()).put('/api/trailAreas/1').auth(username, password).send({})

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(res.body.message).toEqual([
        'latitude must not be greater than 90',
        'latitude must not be less than -90',
        'longitude must not be greater than 180',
        'longitude must not be less than -180',
        'threshold must not be greater than 1',
        'threshold must not be less than 0',
        'name must be longer than or equal to 1 characters',
      ])
      expect(appServiceMock.fetchDataForNewArea).not.toHaveBeenCalled()
    })

    it('should update a trail area', async () => {
      const res = await request(app.getHttpServer()).put('/api/trailAreas/2').auth(username, password).send({
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
