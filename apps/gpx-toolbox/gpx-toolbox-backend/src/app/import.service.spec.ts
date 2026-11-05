import { Test, TestingModule } from '@nestjs/testing'

import { PrismaService } from '@plusone/gpx-toolbox-persistence'

import { ImportService } from './import.service'

function makePoint(i: number, ele = 100, latBase = 48.0, lngBase = 11.0) {
  return {
    latitude: latBase + i * 0.0001,
    longitude: lngBase + i * 0.0001,
    elevation: ele,
    time: new Date(2024, 0, 1, 10, 0, i),
  }
}

describe('ImportService', () => {
  let service: ImportService

  describe('findBestMatch', () => {
    it('returns null when no existing routes', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ImportService,
          {
            provide: PrismaService,
            useValue: {
              route: {
                findMany: vi.fn().mockResolvedValue([]),
              },
            },
          },
        ],
      }).compile()

      service = module.get<ImportService>(ImportService)

      const points = Array.from({ length: 10 }, (_, i) => makePoint(i, 100))
      const result = await service.findBestMatch(points, 'user-1')

      expect(result).toBeNull()
    })

    it('returns null when routes have no polyline points', async () => {
      // polyline is stored as a JSON string in the DB
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ImportService,
          {
            provide: PrismaService,
            useValue: {
              route: {
                findMany: vi.fn().mockResolvedValue([{ id: '1', name: 'Empty Route', polyline: '[]' }]),
              },
            },
          },
        ],
      }).compile()

      service = module.get<ImportService>(ImportService)

      const points = Array.from({ length: 10 }, (_, i) => makePoint(i, 100))
      const result = await service.findBestMatch(points, 'user-1')

      expect(result).toBeNull()
    })

    it('matches when activity closely follows an existing route', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ImportService,
          {
            provide: PrismaService,
            useValue: {
              route: {
                findMany: vi.fn().mockResolvedValue([
                  {
                    id: '1',
                    name: 'Matching Route',
                    polyline: JSON.stringify(
                      Array.from({ length: 20 }, (_, i) => ({
                        lat: 48.0 + i * 0.0001,
                        lng: 11.0 + i * 0.0001,
                      })),
                    ),
                  },
                ]),
              },
            },
          },
        ],
      }).compile()

      service = module.get<ImportService>(ImportService)

      const points = Array.from({ length: 20 }, (_, i) => makePoint(i, 100 + i * 0.5, 48.0, 11.0))
      const result = await service.findBestMatch(points, 'user-1')

      expect(result).not.toBeNull()
      expect(result?.routeId).toBe('1')
      expect(result?.routeName).toBe('Matching Route')
    })

    it('returns null when no route is within threshold', async () => {
      // Route far away from the activity
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ImportService,
          {
            provide: PrismaService,
            useValue: {
              route: {
                findMany: vi.fn().mockResolvedValue([
                  {
                    id: '1',
                    name: 'Far Away Route',
                    polyline: JSON.stringify(
                      Array.from({ length: 20 }, (_, i) => ({
                        lat: 52.0 + i * 0.0001, // Completely different location
                        lng: 10.0 + i * 0.0001,
                      })),
                    ),
                  },
                ]),
              },
            },
          },
        ],
      }).compile()

      service = module.get<ImportService>(ImportService)

      const points = Array.from({ length: 20 }, (_, i) => makePoint(i, 100, 48.0, 11.0))
      const result = await service.findBestMatch(points, 'user-1')

      expect(result).toBeNull()
    })

    it('pre-filters candidates in SQL by bounding box and distance', async () => {
      const findMany = vi.fn().mockResolvedValue([])
      const module: TestingModule = await Test.createTestingModule({
        providers: [ImportService, { provide: PrismaService, useValue: { route: { findMany } } }],
      }).compile()

      service = module.get<ImportService>(ImportService)

      const points = Array.from({ length: 20 }, (_, i) => makePoint(i, 100, 48.0, 11.0))
      await service.findBestMatch(points, 'user-1', 10_000)

      const { where } = findMany.mock.calls[0][0]
      expect(where.userId).toBe('user-1')
      expect(where.distance).toEqual({ gte: 8_000, lte: 12_000 })
      // Activity spans 48.0000–48.0019; the search box is grown by 200 m (~0.0018°)
      expect(where.minLat.lte).toBeCloseTo(48.0019 + 0.0018, 4)
      expect(where.maxLat.gte).toBeCloseTo(48.0 - 0.0018, 4)
      expect(where.minLng.lte).toBeGreaterThan(11.0019)
      expect(where.maxLng.gte).toBeLessThan(11.0)
    })

    it('only considers manually imported routes', async () => {
      const findManySpy = vi.fn().mockResolvedValue([])

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ImportService,
          {
            provide: PrismaService,
            useValue: {
              route: {
                findMany: findManySpy,
              },
            },
          },
        ],
      }).compile()

      service = module.get<ImportService>(ImportService)

      const points = Array.from({ length: 20 }, (_, i) => makePoint(i, 100, 48.0, 11.0))
      const result = await service.findBestMatch(points, 'user-1')

      expect(findManySpy).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ source: 'manualImport' }) }),
      )
      expect(result).toBeNull()
    })
  })

  describe('importGpxActivity', () => {
    const activityGpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1">
  <trk><name>Feierabendrunde</name><trkseg>
    <trkpt lat="48.0" lon="11.0"><ele>100</ele><time>2024-01-01T10:00:00Z</time>
      <extensions><gpxtpx:TrackPointExtension><gpxtpx:hr>140</gpxtpx:hr></gpxtpx:TrackPointExtension></extensions>
    </trkpt>
    <trkpt lat="48.001" lon="11.001"><ele>110</ele><time>2024-01-01T10:10:00Z</time>
      <extensions><gpxtpx:TrackPointExtension><gpxtpx:hr>170</gpxtpx:hr></gpxtpx:TrackPointExtension></extensions>
    </trkpt>
  </trkseg></trk>
</gpx>`

    async function createService() {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ImportService,
          {
            provide: PrismaService,
            useValue: {
              route: {
                findMany: vi.fn().mockResolvedValue([]), // No matches → a new route is created
                create: vi.fn().mockResolvedValue({ id: '1', name: 'Feierabendrunde' }),
              },
              activity: {
                create: vi.fn().mockResolvedValue({ id: 'f1', routeId: '1' }),
              },
            },
          },
        ],
      }).compile()

      return module.get<ImportService>(ImportService)
    }

    it('creates a route and an activity with data derived from the track points', async () => {
      service = await createService()

      const result = await service.importGpxActivity(activityGpx, 'user-1')

      expect(result).toEqual({ imported: 1, matched: 0, newRoutes: 1 })
      expect(service['prisma'].route.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ name: 'Feierabendrunde', source: 'manualImport', status: 'ridden' }),
      })
      expect(service['prisma'].activity.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Feierabendrunde',
          riddenAt: new Date('2024-01-01T10:00:00Z'),
          duration: 600,
          maxHr: 170,
        }),
      })
    })

    it('prefers the given title over the GPX track name', async () => {
      service = await createService()

      await service.importGpxActivity(activityGpx, 'user-1', 'Mit Umweg')

      expect(service['prisma'].activity.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ title: 'Mit Umweg' }),
      })
    })

    it('rejects a GPX file without track points', async () => {
      service = await createService()

      await expect(service.importGpxActivity('<gpx><trk><trkseg></trkseg></trk></gpx>', 'user-1')).rejects.toThrow(
        'No track points found in GPX file',
      )
    })
  })
})
