import { Test, TestingModule } from '@nestjs/testing'

import { PrismaService } from '@plusone/gpx-toolbox-persistence'

import { ImportService } from './import.service'
import { StravaService } from './strava.service'

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

  describe('importSingleStravaRoute', () => {
    it('creates a new route when none exists', async () => {
      const mockStrava = {
        getRoute: vi.fn().mockResolvedValue({ name: 'Test Route', distance: 5000 }),
        downloadRouteGPX: vi.fn().mockResolvedValue(`<?xml version="1.0" encoding="UTF-8"?>
<gpx>
  <trk><trkseg>
    <trkpt lat="48.0" lon="11.0"><ele>100</ele><time>2024-01-01T10:00:00Z</time></trkpt>
    <trkpt lat="48.001" lon="11.001"><ele>110</ele><time>2024-01-01T10:01:00Z</time></trkpt>
  </trkseg></trk>
</gpx>`),
      }

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ImportService,
          {
            provide: PrismaService,
            useValue: {
              route: {
                findFirst: vi.fn().mockResolvedValue(null),
                create: vi.fn().mockResolvedValue({ id: '1', name: 'Test Route' }),
              },
            },
          },
          { provide: StravaService, useValue: mockStrava },
        ],
      }).compile()

      service = module.get<ImportService>(ImportService)

      const result = await service.importSingleStravaRoute('token', 'user-1', '100')

      expect(result.imported).toBe(true)
      expect(result.newRoutes).toBe(true)
      expect(mockStrava.getRoute).toHaveBeenCalledWith('token', '100')
      expect(mockStrava.downloadRouteGPX).toHaveBeenCalledWith('token', '100')
    })

    it('updates an existing route when one already exists', async () => {
      const existingRoute = { id: 'existing-1', name: 'Old Name' }
      const mockStrava = {
        getRoute: vi.fn().mockResolvedValue({ name: 'Updated Name', distance: 6000 }),
        downloadRouteGPX: vi.fn().mockResolvedValue(`<?xml version="1.0" encoding="UTF-8"?>
<gpx>
  <trk><trkseg>
    <trkpt lat="48.0" lon="11.0"><ele>100</ele><time>2024-01-01T10:00:00Z</time></trkpt>
    <trkpt lat="48.001" lon="11.001"><ele>120</ele><time>2024-01-01T10:01:00Z</time></trkpt>
  </trkseg></trk>
</gpx>`),
      }

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ImportService,
          {
            provide: PrismaService,
            useValue: {
              route: {
                findFirst: vi.fn().mockResolvedValue(existingRoute),
                update: vi.fn().mockResolvedValue({ ...existingRoute, name: 'Updated Name' }),
              },
            },
          },
          { provide: StravaService, useValue: mockStrava },
        ],
      }).compile()

      service = module.get<ImportService>(ImportService)

      const result = await service.importSingleStravaRoute('token', 'user-1', '100')

      expect(result.imported).toBe(true)
      expect(result.newRoutes).toBe(false)
      expect(mockStrava.getRoute).toHaveBeenCalledWith('token', '100')
    })

    it('handles missing GPX gracefully', async () => {
      const mockStrava = {
        getRoute: vi.fn().mockResolvedValue({ name: 'No GPX Route', distance: 3000 }),
        downloadRouteGPX: vi.fn().mockRejectedValue(new Error('No GPX')),
      }

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ImportService,
          {
            provide: PrismaService,
            useValue: {
              route: {
                findFirst: vi.fn().mockResolvedValue(null),
                create: vi.fn().mockResolvedValue({ id: '1', name: 'No GPX Route' }),
              },
            },
          },
          { provide: StravaService, useValue: mockStrava },
        ],
      }).compile()

      service = module.get<ImportService>(ImportService)

      const result = await service.importSingleStravaRoute('token', 'user-1', '100')

      expect(result.imported).toBe(true)
      expect(result.newRoutes).toBe(true)
    })
  })

  describe('listStravaRoutes', () => {
    it('returns route summaries with imported flag', async () => {
      const stravaRoutes = [
        { id: 100, id_str: '100', name: 'Route A', distance: 5000, elevation_gain: 100 },
        { id: 200, id_str: '200', name: 'Route B', distance: 8000, elevation_gain: 200 },
      ]
      const mockStrava = {
        getRoutes: vi.fn().mockResolvedValue(stravaRoutes),
      }
      const existingRoutes = [{ id: 'db-1', stravaRouteId: '100' }]

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ImportService,
          {
            provide: PrismaService,
            useValue: {
              route: {
                findMany: vi.fn().mockResolvedValue(existingRoutes),
              },
            },
          },
          { provide: StravaService, useValue: mockStrava },
        ],
      }).compile()

      service = module.get<ImportService>(ImportService)

      const result = await service.listStravaRoutes('token', 'user-1', 12345)

      expect(result).toHaveLength(2)
      expect(result[0].stravaId).toBe(100)
      expect(result[0].name).toBe('Route A')
      expect(result[0].imported).toBe(true)
      expect(result[1].stravaId).toBe(200)
      expect(result[1].imported).toBe(false)
    })

    it('returns empty array when no strava routes', async () => {
      const mockStrava = {
        getRoutes: vi.fn().mockResolvedValue([]),
      }

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
          { provide: StravaService, useValue: mockStrava },
        ],
      }).compile()

      service = module.get<ImportService>(ImportService)

      const result = await service.listStravaRoutes('token', 'user-1', 12345)

      expect(result).toEqual([])
    })
  })

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
          { provide: StravaService, useValue: {} },
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
          { provide: StravaService, useValue: {} },
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
          { provide: StravaService, useValue: {} },
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
          { provide: StravaService, useValue: {} },
        ],
      }).compile()

      service = module.get<ImportService>(ImportService)

      const points = Array.from({ length: 20 }, (_, i) => makePoint(i, 100, 48.0, 11.0))
      const result = await service.findBestMatch(points, 'user-1')

      expect(result).toBeNull()
    })

    it('only considers manualImport and stravaRoute sources', async () => {
      const findManySpy = vi.fn().mockImplementation(({ where }: { where: { source?: { in: Array<string> } } }) => {
        // Simulate Prisma filtering: only return routes matching the source filter
        if (where.source?.in) {
          return Promise.resolve([]) // Mock Prisma respects the filter
        }
        return Promise.resolve([])
      })

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
          { provide: StravaService, useValue: {} },
        ],
      }).compile()

      service = module.get<ImportService>(ImportService)

      const points = Array.from({ length: 20 }, (_, i) => makePoint(i, 100, 48.0, 11.0))
      const result = await service.findBestMatch(points, 'user-1')

      // Should only query for manualImport and stravaRoute sources
      expect(findManySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            source: expect.objectContaining({ in: expect.arrayContaining(['manualImport', 'stravaRoute']) }),
          }),
        }),
      )
      expect(result).toBeNull()
    })
  })

  describe('importStravaActivity', () => {
    it('creates a new route from activity GPX', async () => {
      const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx>
  <trk><trkseg>
    <trkpt lat="48.0" lon="11.0"><ele>100</ele><time>2024-01-01T10:00:00Z</time></trkpt>
    <trkpt lat="48.001" lon="11.001"><ele>120</ele><time>2024-01-01T10:02:00Z</time></trkpt>
  </trkseg></trk>
</gpx>`

      const mockStrava = {
        downloadActivityGpx: vi.fn().mockResolvedValue(gpxContent),
        getActivity: vi.fn().mockResolvedValue({ id: 999, name: 'Activity 999', distance: 20000 }),
      }

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ImportService,
          {
            provide: PrismaService,
            useValue: {
              route: {
                findMany: vi.fn().mockResolvedValue([]), // No matches
                create: vi.fn().mockResolvedValue({ id: '1', name: 'Activity 999' }),
              },
            },
          },
          { provide: StravaService, useValue: mockStrava },
        ],
      }).compile()

      service = module.get<ImportService>(ImportService)

      const result = await service.importStravaActivity('token', 'user-1', '999', false)

      expect(result.imported).toBe(1)
      expect(result.newRoutes).toBe(1)
      expect(result.matched).toBe(0)
      expect(mockStrava.downloadActivityGpx).toHaveBeenCalledWith('token', '999')
    })

    it('auto-matches to existing route when enabled and a match exists', async () => {
      const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx>
  <trk><trkseg>
    <trkpt lat="48.0" lon="11.0"><ele>100</ele><time>2024-01-01T10:00:00Z</time></trkpt>
    <trkpt lat="48.001" lon="11.001"><ele>110</ele><time>2024-01-01T10:01:00Z</time></trkpt>
  </trkseg></trk>
</gpx>`

      const mockStrava = {
        downloadActivityGpx: vi.fn().mockResolvedValue(gpxContent),
        getActivity: vi.fn().mockResolvedValue({ id: 999, name: 'Activity 999', distance: 10000 }),
      }

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
                    name: 'Existing Route',
                    source: 'manualImport',
                    polyline: JSON.stringify(
                      Array.from({ length: 20 }, (_, i) => ({
                        lat: 48.0 + i * 0.0001,
                        lng: 11.0 + i * 0.0001,
                      })),
                    ),
                  },
                ]),
                update: vi.fn().mockResolvedValue({ id: '1', stravaActivityId: '999' }),
                create: vi.fn().mockResolvedValue({ id: '2', name: 'Activity 999' }),
              },
            },
          },
          { provide: StravaService, useValue: mockStrava },
        ],
      }).compile()

      service = module.get<ImportService>(ImportService)

      const result = await service.importStravaActivity('token', 'user-1', '999', true)

      expect(result.imported).toBe(1)
      expect(result.matched).toBe(1)
    })
  })

  describe('importStravaRoutes', () => {
    it('imports multiple routes', async () => {
      const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx>
  <trk><trkseg>
    <trkpt lat="48.0" lon="11.0"><ele>100</ele><time>2024-01-01T10:00:00Z</time></trkpt>
    <trkpt lat="48.001" lon="11.001"><ele>110</ele><time>2024-01-01T10:01:00Z</time></trkpt>
  </trkseg></trk>
</gpx>`

      const stravaRoutes = [
        { id: 100, id_str: '100', name: 'Route A', distance: 5000, elevation_gain: 100 },
        { id: 200, id_str: '200', name: 'Route B', distance: 8000, elevation_gain: 200 },
      ]

      const mockStrava = {
        getRoutes: vi.fn().mockResolvedValue(stravaRoutes),
        getRoute: vi.fn().mockResolvedValue({ distance: 5000 }),
        downloadRouteGPX: vi.fn().mockResolvedValue(gpxContent),
      }

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ImportService,
          {
            provide: PrismaService,
            useValue: {
              route: {
                findFirst: vi.fn().mockResolvedValue(null),
                create: vi.fn().mockImplementation(async (data: { data: Record<string, unknown> }) => ({
                  id: String(data.data.stravaRouteId),
                  ...data.data,
                })),
              },
            },
          },
          { provide: StravaService, useValue: mockStrava },
        ],
      }).compile()

      service = module.get<ImportService>(ImportService)

      const result = await service.importStravaRoutes('token', 'user-1', 12345)

      expect(result.imported).toBe(2)
      expect(result.newRoutes).toBe(2)
      expect(result.matched).toBe(0)
    })

    it('skips already imported routes', async () => {
      const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx>
  <trk><trkseg>
    <trkpt lat="48.0" lon="11.0"><ele>100</ele><time>2024-01-01T10:00:00Z</time></trkpt>
  </trkseg></trk>
</gpx>`

      const stravaRoutes = [{ id: 100, id_str: '100', name: 'Route A', distance: 5000, elevation_gain: 100 }]

      const mockStrava = {
        getRoutes: vi.fn().mockResolvedValue(stravaRoutes),
        getRoute: vi.fn().mockResolvedValue({ distance: 5000 }),
        downloadRouteGPX: vi.fn().mockResolvedValue(gpxContent),
      }

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ImportService,
          {
            provide: PrismaService,
            useValue: {
              route: {
                findFirst: vi.fn().mockResolvedValue({ id: 'db-1' }), // Already exists
                create: vi.fn().mockResolvedValue({ id: 'new-1' }),
              },
            },
          },
          { provide: StravaService, useValue: mockStrava },
        ],
      }).compile()

      service = module.get<ImportService>(ImportService)

      const result = await service.importStravaRoutes('token', 'user-1', 12345)

      expect(result.matched).toBe(1)
      expect(result.newRoutes).toBe(0)
    })

    it('re-imports when force is true', async () => {
      const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx>
  <trk><trkseg>
    <trkpt lat="48.0" lon="11.0"><ele>100</ele><time>2024-01-01T10:00:00Z</time></trkpt>
  </trkseg></trk>
</gpx>`

      const stravaRoutes = [{ id: 100, id_str: '100', name: 'Route A', distance: 5000, elevation_gain: 100 }]

      const mockStrava = {
        getRoutes: vi.fn().mockResolvedValue(stravaRoutes),
        getRoute: vi.fn().mockResolvedValue({ distance: 5000 }),
        downloadRouteGPX: vi.fn().mockResolvedValue(gpxContent),
      }

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ImportService,
          {
            provide: PrismaService,
            useValue: {
              route: {
                findFirst: vi.fn().mockResolvedValue({ id: 'db-1' }), // Already exists
                create: vi.fn().mockResolvedValue({ id: 'new-1' }),
                update: vi.fn().mockResolvedValue({ id: 'db-1' }),
              },
            },
          },
          { provide: StravaService, useValue: mockStrava },
        ],
      }).compile()

      service = module.get<ImportService>(ImportService)

      const result = await service.importStravaRoutes('token', 'user-1', 12345, true)

      expect(result.imported).toBe(1)
      // Force re-import: imported is incremented but matched is not
      expect(result.matched).toBe(0)
      expect(result.newRoutes).toBe(0)
    })
  })
})
