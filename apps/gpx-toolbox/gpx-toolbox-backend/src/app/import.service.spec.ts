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

    it('pre-filters candidates in SQL by bounding box and distance', async () => {
      const findMany = vi.fn().mockResolvedValue([])
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ImportService,
          { provide: PrismaService, useValue: { route: { findMany } } },
          { provide: StravaService, useValue: {} },
        ],
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
          { provide: StravaService, useValue: {} },
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

  describe('importStravaActivity', () => {
    it('creates a new route from activity GPX', async () => {
      const streamPoints = [
        { latitude: 48.0, longitude: 11.0, elevation: 100, time: new Date('2024-01-01T10:00:00Z') },
        { latitude: 48.001, longitude: 11.001, elevation: 120, time: new Date('2024-01-01T10:02:00Z') },
      ]

      const mockStrava = {
        downloadActivityStreams: vi.fn().mockResolvedValue(streamPoints),
        getActivity: vi.fn().mockResolvedValue({ id: 999, name: 'Activity 999', distance: 20000 }),
      }

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ImportService,
          {
            provide: PrismaService,
            useValue: {
              route: {
                findFirst: vi.fn().mockResolvedValue(null),
                findMany: vi.fn().mockResolvedValue([]), // No matches
                create: vi.fn().mockResolvedValue({ id: '1', name: 'Activity 999' }),
              },
              activity: {
                findFirst: vi.fn().mockResolvedValue(null),
                create: vi.fn().mockResolvedValue({ id: 'f1', routeId: '1' }),
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
      expect(mockStrava.downloadActivityStreams).toHaveBeenCalledWith('token', 999)
      expect(service['prisma'].activity.create).toHaveBeenCalled()
    })

    it('auto-matches to existing route when enabled and a match exists', async () => {
      const streamPoints = [
        { latitude: 48.0, longitude: 11.0, elevation: 100, time: new Date('2024-01-01T10:00:00Z') },
        { latitude: 48.001, longitude: 11.001, elevation: 110, time: new Date('2024-01-01T10:01:00Z') },
      ]

      const mockStrava = {
        downloadActivityStreams: vi.fn().mockResolvedValue(streamPoints),
        getActivity: vi.fn().mockResolvedValue({
          id: 999,
          name: 'Activity 999',
          distance: 10000,
          start_date_local: '2024-01-01T10:00:00Z',
          moving_time: 3600,
          average_heartrate: 150.4,
          max_heartrate: 180,
        }),
      }

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ImportService,
          {
            provide: PrismaService,
            useValue: {
              route: {
                findFirst: vi.fn().mockResolvedValue(null),
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
                update: vi.fn().mockResolvedValue({ id: '1' }),
                create: vi.fn().mockResolvedValue({ id: '2', name: 'Activity 999' }),
              },
              activity: {
                findFirst: vi.fn().mockResolvedValue(null),
                create: vi.fn().mockResolvedValue({ id: 'f1', routeId: '1' }),
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
      expect(service['prisma'].route.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: 'ridden' },
      })
      expect(service['prisma'].activity.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ duration: 3600, avgHr: 150, maxHr: 180 }),
      })
    })

    it('skips an activity that is already imported without calling Strava', async () => {
      const mockStrava = { getActivity: vi.fn(), downloadActivityStreams: vi.fn() }
      const createActivity = vi.fn()

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ImportService,
          {
            provide: PrismaService,
            useValue: {
              route: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn() },
              activity: { findFirst: vi.fn().mockResolvedValue({ id: 'f1' }), create: createActivity },
            },
          },
          { provide: StravaService, useValue: mockStrava },
        ],
      }).compile()

      service = module.get<ImportService>(ImportService)

      const result = await service.importStravaActivity('token', 'user-1', '999', true)

      expect(result).toEqual({ imported: 0, matched: 0, newRoutes: 0 })
      expect(mockStrava.getActivity).not.toHaveBeenCalled()
      expect(createActivity).not.toHaveBeenCalled()
    })

    it('reattaches a re-imported activity to the route it was originally created from', async () => {
      const streamPoints = [
        { latitude: 48.0, longitude: 11.0, elevation: 100, time: new Date('2024-01-01T10:00:00Z') },
        { latitude: 48.001, longitude: 11.001, elevation: 120, time: new Date('2024-01-01T10:02:00Z') },
      ]
      const mockStrava = {
        downloadActivityStreams: vi.fn().mockResolvedValue(streamPoints),
        getActivity: vi.fn().mockResolvedValue({ id: 999, name: 'Activity 999', distance: 20000 }),
      }
      const createRoute = vi.fn()
      const findMatchCandidates = vi.fn()
      const createActivity = vi.fn().mockResolvedValue({ id: 'f2', routeId: 'origin-route' })

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ImportService,
          {
            provide: PrismaService,
            useValue: {
              route: {
                findFirst: vi.fn().mockResolvedValue({ id: 'origin-route' }),
                findMany: findMatchCandidates,
                create: createRoute,
              },
              activity: { findFirst: vi.fn().mockResolvedValue(null), create: createActivity },
            },
          },
          { provide: StravaService, useValue: mockStrava },
        ],
      }).compile()

      service = module.get<ImportService>(ImportService)

      const result = await service.importStravaActivity('token', 'user-1', '999', true)

      expect(result).toEqual({ imported: 1, matched: 0, newRoutes: 0 })
      expect(createRoute).not.toHaveBeenCalled()
      expect(findMatchCandidates).not.toHaveBeenCalled()
      expect(createActivity).toHaveBeenCalledWith({
        data: expect.objectContaining({ routeId: 'origin-route', stravaActivityId: '999' }),
      })
    })

    it('stores valid GPX XML (not stringified JSON) in the gpxContent column', async () => {
      const streamPoints = [
        { latitude: 48.0, longitude: 11.0, elevation: 100, time: new Date('2024-01-01T10:00:00Z'), hr: 150, cad: 90 },
        { latitude: 48.001, longitude: 11.001, elevation: 120, time: new Date('2024-01-01T10:02:00Z'), hr: 160 },
      ]

      const mockStrava = {
        downloadActivityStreams: vi.fn().mockResolvedValue(streamPoints),
        getActivity: vi.fn().mockResolvedValue({ id: 999, name: 'Activity 999', distance: 20000 }),
      }

      const createRoute = vi.fn().mockResolvedValue({ id: '1', name: 'Activity 999' })

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ImportService,
          {
            provide: PrismaService,
            useValue: {
              route: {
                findFirst: vi.fn().mockResolvedValue(null),
                findMany: vi.fn().mockResolvedValue([]), // No matches → a new route is created
                create: createRoute,
              },
              activity: {
                findFirst: vi.fn().mockResolvedValue(null),
                create: vi.fn().mockResolvedValue({ id: 'f1', routeId: '1' }),
              },
            },
          },
          { provide: StravaService, useValue: mockStrava },
        ],
      }).compile()

      service = module.get<ImportService>(ImportService)

      await service.importStravaActivity('token', 'user-1', '999', false)

      // The data passed to route.create is what lands in the DB gpxContent column.
      const gpxContent = createRoute.mock.calls[0][0].data.gpxContent as string

      // It must be real GPX XML starting with the XML declaration, not the
      // stringified JSON array the old bug stored (which started with '[').
      expect(gpxContent).toMatch(/^<\?xml/)
      expect(gpxContent).toContain('<gpx')
      expect(gpxContent).toContain('<trkpt')
      expect(gpxContent.startsWith('[')).toBe(false)
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
                findFirst: vi.fn().mockResolvedValue(null),
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
                findFirst: vi.fn().mockResolvedValue(null),
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

  describe('importAllActivities', () => {
    it('respects the limit by paginating through the Strava API', async () => {
      // Page 1 returns 200 activities (per_page), page 2 returns 5 (remaining)
      const page1Activities = Array.from({ length: 200 }, (_, i) => ({ id: i + 1 }))
      const page2Activities = Array.from({ length: 5 }, (_, i) => ({ id: 201 + i }))

      const mockStrava = {
        getActivities: vi
          .fn()
          .mockResolvedValueOnce(page1Activities) // First page
          .mockResolvedValueOnce(page2Activities), // Second page
        getActivity: vi.fn().mockResolvedValue({ id: 1, name: 'Activity 1', distance: 10000 }),
        downloadActivityStreams: vi
          .fn()
          .mockResolvedValue([{ latitude: 48.0, longitude: 11.0, elevation: 100, time: new Date(), hr: 150 }]),
      }

      const createRoute = vi.fn().mockResolvedValue({ id: 'route-1', name: 'Activity 1' })

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ImportService,
          {
            provide: PrismaService,
            useValue: {
              route: {
                findFirst: vi.fn().mockResolvedValue(null),
                findMany: vi.fn().mockResolvedValue([]),
                create: createRoute,
              },
              activity: {
                findFirst: vi.fn().mockResolvedValue(null),
                create: vi.fn().mockResolvedValue({ id: 'f1', routeId: 'route-1' }),
              },
            },
          },
          { provide: StravaService, useValue: mockStrava },
        ],
      }).compile()

      service = module.get<ImportService>(ImportService)

      // Request limit of 50 — should only fetch page 1 and slice to 50
      const _result = await service.importAllActivities('token', 'user-1', 50)

      // Should have made only 1 API call (page 1 with 200 items, then sliced)
      expect(mockStrava.getActivities).toHaveBeenCalledTimes(1)
      expect(mockStrava.getActivities).toHaveBeenCalledWith('token', { page: 1, per_page: 200 })
      // Should have imported exactly 50 (the limit)
      expect(createRoute).toHaveBeenCalledTimes(50)
    })

    it('fetches multiple pages when limit exceeds first page', async () => {
      const page1Activities = Array.from({ length: 200 }, (_, i) => ({ id: i + 1 }))
      const page2Activities = Array.from({ length: 50 }, (_, i) => ({ id: 201 + i }))

      const mockStrava = {
        getActivities: vi.fn().mockResolvedValueOnce(page1Activities).mockResolvedValueOnce(page2Activities),
        getActivity: vi.fn().mockResolvedValue({ id: 1, name: 'Activity 1', distance: 10000 }),
        downloadActivityStreams: vi
          .fn()
          .mockResolvedValue([{ latitude: 48.0, longitude: 11.0, elevation: 100, time: new Date(), hr: 150 }]),
      }

      const createRoute = vi.fn().mockResolvedValue({ id: 'route-1', name: 'Activity 1' })

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ImportService,
          {
            provide: PrismaService,
            useValue: {
              route: {
                findFirst: vi.fn().mockResolvedValue(null),
                findMany: vi.fn().mockResolvedValue([]),
                create: createRoute,
              },
              activity: {
                findFirst: vi.fn().mockResolvedValue(null),
                create: vi.fn().mockResolvedValue({ id: 'f1', routeId: 'route-1' }),
              },
            },
          },
          { provide: StravaService, useValue: mockStrava },
        ],
      }).compile()

      service = module.get<ImportService>(ImportService)

      // Request limit of 250 — page 1 (200) + page 2 (50) = 250
      const _result = await service.importAllActivities('token', 'user-1', 250)

      expect(mockStrava.getActivities).toHaveBeenCalledTimes(2)
      expect(mockStrava.getActivities).toHaveBeenNthCalledWith(1, 'token', { page: 1, per_page: 200 })
      expect(mockStrava.getActivities).toHaveBeenNthCalledWith(2, 'token', { page: 2, per_page: 200 })
      expect(createRoute).toHaveBeenCalledTimes(250)
    })

    it('stops fetching when limit is reached mid-page', async () => {
      const page1Activities = Array.from({ length: 200 }, (_, i) => ({ id: i + 1 }))
      const page2Activities = Array.from({ length: 200 }, (_, i) => ({ id: 201 + i }))

      const mockStrava = {
        getActivities: vi.fn().mockResolvedValueOnce(page1Activities).mockResolvedValueOnce(page2Activities), // Would return more, but we should stop
        getActivity: vi.fn().mockResolvedValue({ id: 1, name: 'Activity 1', distance: 10000 }),
        downloadActivityStreams: vi
          .fn()
          .mockResolvedValue([{ latitude: 48.0, longitude: 11.0, elevation: 100, time: new Date(), hr: 150 }]),
      }

      const createRoute = vi.fn().mockResolvedValue({ id: 'route-1', name: 'Activity 1' })

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ImportService,
          {
            provide: PrismaService,
            useValue: {
              route: {
                findFirst: vi.fn().mockResolvedValue(null),
                findMany: vi.fn().mockResolvedValue([]),
                create: createRoute,
              },
              activity: {
                findFirst: vi.fn().mockResolvedValue(null),
                create: vi.fn().mockResolvedValue({ id: 'f1', routeId: 'route-1' }),
              },
            },
          },
          { provide: StravaService, useValue: mockStrava },
        ],
      }).compile()

      service = module.get<ImportService>(ImportService)

      // Request limit of 250 — page 1 (200) + need 50 from page 2
      const _result = await service.importAllActivities('token', 'user-1', 250)

      // Should have fetched 2 pages but only used 50 from page 2
      expect(mockStrava.getActivities).toHaveBeenCalledTimes(2)
      expect(createRoute).toHaveBeenCalledTimes(250)
    })
  })
})
