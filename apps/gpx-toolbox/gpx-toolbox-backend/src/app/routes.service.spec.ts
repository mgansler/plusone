import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { Mock } from 'vitest'

import { PrismaService } from '@plusone/gpx-toolbox-persistence'

import { RoutesService } from './routes.service'

const sampleGpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx>
  <trk><trkseg>
    <trkpt lat="48.00000" lon="11.00000"><ele>100.0</ele><time>2024-01-01T10:00:00Z</time></trkpt>
    <trkpt lat="48.00100" lon="11.00100"><ele>110.0</ele><time>2024-01-01T10:01:00Z</time></trkpt>
    <trkpt lat="48.00200" lon="11.00200"><ele>120.0</ele><time>2024-01-01T10:02:00Z</time></trkpt>
    <trkpt lat="48.00300" lon="11.00300"><ele>115.0</ele><time>2024-01-01T10:03:00Z</time></trkpt>
    <trkpt lat="48.00400" lon="11.00400"><ele>130.0</ele><time>2024-01-01T10:04:00Z</time></trkpt>
  </trkseg></trk>
</gpx>`

const userId = 'user-1'

type MockPrisma = { route: Record<'create' | 'findUnique' | 'findFirst' | 'findMany' | 'update' | 'delete', Mock> }

/**
 * Build a fresh testing module with a mutable mock PrismaService.
 */
async function buildModule(mockPrisma: MockPrisma) {
  return Test.createTestingModule({
    providers: [
      RoutesService,
      {
        provide: PrismaService,
        useValue: mockPrisma,
      },
    ],
  }).compile()
}

describe('RoutesService', () => {
  let service: RoutesService
  let mockPrisma: MockPrisma

  beforeEach(async () => {
    const routeMock = {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }
    mockPrisma = { route: routeMock }
    const module: TestingModule = await buildModule(mockPrisma)
    service = module.get<RoutesService>(RoutesService)
  })

  describe('importGpx', () => {
    it('parses GPX and creates a route with computed stats', async () => {
      const mockRoute = { id: 'route-1', name: 'Test Route' }
      mockPrisma.route.create.mockResolvedValue(mockRoute)

      const result = await service.importGpx(sampleGpx, { name: 'Test Route', source: 'manualImport' }, userId)

      expect(result.name).toBe('Test Route')
      expect(result.totalDistance).toBeGreaterThan(0)
      expect(result.elevationGain).toBeGreaterThan(0)
      expect(result.elevationLoss).toBeGreaterThan(0)
    })

    it('uses GPX track name when dto.name is omitted', async () => {
      const gpxWithName = `<?xml version="1.0" encoding="UTF-8"?>
<gpx>
  <trk><name>My Named Track</name><trkseg>
    <trkpt lat="48.0" lon="11.0"><ele>100</ele><time>2024-01-01T10:00:00Z</time></trkpt>
    <trkpt lat="48.001" lon="11.001"><ele>110</ele><time>2024-01-01T10:01:00Z</time></trkpt>
  </trkseg></trk>
</gpx>`

      mockPrisma.route.create.mockResolvedValue({ id: 'r1', name: 'My Named Track' })

      const result = await service.importGpx(gpxWithName, { source: 'manualImport', name: 'My Named Track' }, userId)

      expect(result.name).toBe('My Named Track')
    })

    describe('skipDuplicate', () => {
      it('returns the existing route instead of creating another one with the same GPX content', async () => {
        mockPrisma.route.findFirst.mockResolvedValue({ id: 'existing', name: 'Alte Runde' })

        const result = await service.importGpx(sampleGpx, { name: 'Neue Runde', skipDuplicate: true }, userId)

        expect(result).toMatchObject({ id: 'existing', name: 'Alte Runde', duplicate: true })
        expect(result.totalDistance).toBeGreaterThan(0)
        expect(mockPrisma.route.create).not.toHaveBeenCalled()
        // Only the routes of the same user count
        expect(mockPrisma.route.findFirst).toHaveBeenCalledWith(
          expect.objectContaining({ where: { userId, gpxContent: sampleGpx } }),
        )
      })

      it('creates the route when there is none with this content yet', async () => {
        mockPrisma.route.findFirst.mockResolvedValue(null)
        mockPrisma.route.create.mockResolvedValue({ id: 'route-1', name: 'Neue Runde' })

        const result = await service.importGpx(sampleGpx, { name: 'Neue Runde', skipDuplicate: true }, userId)

        expect(result).toMatchObject({ id: 'route-1', duplicate: false })
        expect(mockPrisma.route.create).toHaveBeenCalledTimes(1)
      })

      it('does not look for duplicates unless asked to', async () => {
        mockPrisma.route.create.mockResolvedValue({ id: 'route-1', name: 'Runde' })

        const result = await service.importGpx(sampleGpx, { name: 'Runde' }, userId)

        expect(result.duplicate).toBe(false)
        expect(mockPrisma.route.findFirst).not.toHaveBeenCalled()
      })

      it('still rejects a GPX file without track points', async () => {
        await expect(
          service.importGpx('<gpx><trk><trkseg></trkseg></trk></gpx>', { name: 'Leer', skipDuplicate: true }, userId),
        ).rejects.toThrow('No track points found in GPX file')
        expect(mockPrisma.route.findFirst).not.toHaveBeenCalled()
      })
    })

    it('throws when GPX has no track points', async () => {
      const emptyGpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx>
  <trk><trkseg></trkseg></trk>
</gpx>`

      await expect(service.importGpx(emptyGpx, { name: 'Empty', source: 'manualImport' }, userId)).rejects.toThrow(
        'No track points found in GPX file',
      )
    })
  })

  describe('findById', () => {
    it('returns a formatted route when found', async () => {
      const mockRoute = {
        id: 'route-1',
        name: 'Test Route',
        description: 'A test',
        source: 'manualImport',
        status: 'planned',
        ratingTags: [],
        notes: null,
        stats: JSON.stringify({ distance: 5000, elevationGain: 100 }),
        polyline: JSON.stringify([{ lat: 48.0, lng: 11.0 }]),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        activities: [],
      }

      mockPrisma.route.findUnique.mockResolvedValue(mockRoute)

      const result = await service.findById('route-1', userId)

      expect(result.id).toBe('route-1')
      expect(result.name).toBe('Test Route')
      expect(result.description).toBe('A test')
      expect(result.stats).toEqual({ distance: 5000, elevationGain: 100 })
    })

    it('throws NotFoundException when route does not exist', async () => {
      mockPrisma.route.findUnique.mockResolvedValue(null)

      await expect(service.findById('nonexistent', userId)).rejects.toThrow('not found')
    })
  })

  describe('findAll', () => {
    it('returns paginated routes', async () => {
      const mockRoutes = Array.from({ length: 7 }, (_, i) => ({
        id: `route-${i}`,
        name: `Route ${i}`,
        description: null,
        source: 'manualImport',
        status: 'planned',
        ratingTags: [],
        notes: null,
        stats: JSON.stringify({ distance: 5000 + i * 1000, elevationGain: 100 + i * 50 }),
        polyline: JSON.stringify([{ lat: 48.0, lng: 11.0 }]),
        createdAt: new Date(),
        updatedAt: new Date(),
        activities: [],
      }))

      mockPrisma.route.findMany.mockResolvedValue(mockRoutes)

      const result = await service.findAll({ page: 1, limit: 5 }, userId)

      expect(result.total).toBe(7)
      expect(result.items).toHaveLength(5)
      expect(result.totalPages).toBe(2)
      expect(result.page).toBe(1)
    })

    it('filters by minDistance', async () => {
      const mockRoutes = [
        {
          id: 'route-1',
          name: 'Short Route',
          description: null,
          source: 'manualImport',
          status: 'planned',
          ratingTags: [],
          notes: null,
          stats: JSON.stringify({ distance: 3000, elevationGain: 50 }),
          polyline: JSON.stringify([{ lat: 48.0, lng: 11.0 }]),
          createdAt: new Date(),
          updatedAt: new Date(),
          activities: [],
        },
        {
          id: 'route-2',
          name: 'Long Route',
          description: null,
          source: 'manualImport',
          status: 'planned',
          ratingTags: [],
          notes: null,
          stats: JSON.stringify({ distance: 10000, elevationGain: 200 }),
          polyline: JSON.stringify([{ lat: 48.0, lng: 11.0 }]),
          createdAt: new Date(),
          updatedAt: new Date(),
          activities: [],
        },
      ]

      mockPrisma.route.findMany.mockResolvedValue(mockRoutes)

      const result = await service.findAll({ minDistance: 5000 }, userId)

      expect(result.items).toHaveLength(1)
      expect(result.items[0].name).toBe('Long Route')
    })

    it('filters by maxDistance', async () => {
      const mockRoutes = [
        {
          id: 'route-1',
          name: 'Short Route',
          description: null,
          source: 'manualImport',
          status: 'planned',
          ratingTags: [],
          notes: null,
          stats: JSON.stringify({ distance: 3000, elevationGain: 50 }),
          polyline: JSON.stringify([{ lat: 48.0, lng: 11.0 }]),
          createdAt: new Date(),
          updatedAt: new Date(),
          activities: [],
        },
        {
          id: 'route-2',
          name: 'Long Route',
          description: null,
          source: 'manualImport',
          status: 'planned',
          ratingTags: [],
          notes: null,
          stats: JSON.stringify({ distance: 10000, elevationGain: 200 }),
          polyline: JSON.stringify([{ lat: 48.0, lng: 11.0 }]),
          createdAt: new Date(),
          updatedAt: new Date(),
          activities: [],
        },
      ]

      mockPrisma.route.findMany.mockResolvedValue(mockRoutes)

      const result = await service.findAll({ maxDistance: 5000 }, userId)

      expect(result.items).toHaveLength(1)
      expect(result.items[0].name).toBe('Short Route')
    })

    it('filters by minElevation', async () => {
      const mockRoutes = [
        {
          id: 'route-1',
          name: 'Flat Route',
          description: null,
          source: 'manualImport',
          status: 'planned',
          ratingTags: [],
          notes: null,
          stats: JSON.stringify({ distance: 5000, elevationGain: 50 }),
          polyline: JSON.stringify([{ lat: 48.0, lng: 11.0 }]),
          createdAt: new Date(),
          updatedAt: new Date(),
          activities: [],
        },
        {
          id: 'route-2',
          name: 'Mountain Route',
          description: null,
          source: 'manualImport',
          status: 'planned',
          ratingTags: [],
          notes: null,
          stats: JSON.stringify({ distance: 8000, elevationGain: 500 }),
          polyline: JSON.stringify([{ lat: 48.0, lng: 11.0 }]),
          createdAt: new Date(),
          updatedAt: new Date(),
          activities: [],
        },
      ]

      mockPrisma.route.findMany.mockResolvedValue(mockRoutes)

      const result = await service.findAll({ minElevation: 100 }, userId)

      expect(result.items).toHaveLength(1)
      expect(result.items[0].name).toBe('Mountain Route')
    })
  })

  describe('findNearby', () => {
    it('returns routes within the given radius', async () => {
      const mockRoutes = [
        {
          id: 'near-1',
          name: 'Nearby Route',
          status: 'planned',
          source: 'manualImport',
          stats: JSON.stringify({ distance: 5000, elevationGain: 100 }),
          polyline: JSON.stringify([
            { lat: 48.0001, lng: 11.0001 }, // ~100m from center
            { lat: 48.0002, lng: 11.0002 },
          ]),
        },
        {
          id: 'far-1',
          name: 'Far Route',
          status: 'planned',
          source: 'manualImport',
          stats: JSON.stringify({ distance: 20000, elevationGain: 300 }),
          polyline: JSON.stringify([
            { lat: 48.1, lng: 11.1 }, // ~14km from center
            { lat: 48.1001, lng: 11.1001 },
          ]),
        },
      ]

      mockPrisma.route.findMany.mockResolvedValue(mockRoutes)

      const results = await service.findNearby(48.0, 11.0, 1, userId) // 1km radius

      expect(results).toHaveLength(1)
      expect(results[0].name).toBe('Nearby Route')
      expect(results[0].distance).toBeLessThan(1000)
      expect(results[0].polyline).toEqual([
        { lat: 48.0001, lng: 11.0001 },
        { lat: 48.0002, lng: 11.0002 },
      ])
    })

    it('returns empty array when no routes exist', async () => {
      mockPrisma.route.findMany.mockResolvedValue([])

      const results = await service.findNearby(48.0, 11.0, 10, userId)

      expect(results).toEqual([])
    })

    it('returns empty array when route has empty polyline', async () => {
      mockPrisma.route.findMany.mockResolvedValue([
        {
          id: 'empty-1',
          name: 'Empty Route',
          status: 'planned',
          source: 'manualImport',
          stats: JSON.stringify({ distance: 0, elevationGain: 0 }),
          polyline: JSON.stringify([]),
        },
      ])

      const results = await service.findNearby(48.0, 11.0, 10, userId)

      expect(results).toEqual([])
    })

    it('sorts results by distance ascending', async () => {
      const mockRoutes = [
        {
          id: 'far-1',
          name: 'Farther Route',
          status: 'planned',
          source: 'manualImport',
          stats: JSON.stringify({ distance: 5000, elevationGain: 100 }),
          polyline: JSON.stringify([
            { lat: 48.0005, lng: 11.0005 }, // ~500m
            { lat: 48.0006, lng: 11.0006 },
          ]),
        },
        {
          id: 'near-1',
          name: 'Closer Route',
          status: 'planned',
          source: 'manualImport',
          stats: JSON.stringify({ distance: 3000, elevationGain: 50 }),
          polyline: JSON.stringify([
            { lat: 48.0001, lng: 11.0001 }, // ~100m
            { lat: 48.0002, lng: 11.0002 },
          ]),
        },
      ]

      mockPrisma.route.findMany.mockResolvedValue(mockRoutes)

      const results = await service.findNearby(48.0, 11.0, 10, userId)

      expect(results).toHaveLength(2)
      expect(results[0].name).toBe('Closer Route')
      expect(results[1].name).toBe('Farther Route')
    })
  })

  describe('update', () => {
    it('updates the route of the user', async () => {
      mockPrisma.route.findUnique.mockResolvedValue({ id: 'route-1' })
      mockPrisma.route.update.mockResolvedValue({
        id: 'route-1',
        name: 'Renamed',
        status: 'ridden',
        ratingTags: ['Nochmal fahren'],
        stats: { distance: 5000, elevationGain: 100 },
        polyline: [],
        activities: [],
      })

      const result = await service.update('route-1', { name: 'Renamed', status: 'ridden' }, userId)

      expect(mockPrisma.route.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'route-1', userId }, data: { name: 'Renamed', status: 'ridden' } }),
      )
      expect(result.name).toBe('Renamed')
      expect(result.status).toBe('ridden')
    })

    it('throws NotFoundException instead of a Prisma error when the route does not exist', async () => {
      mockPrisma.route.findUnique.mockResolvedValue(null)

      await expect(service.update('nonexistent', { name: 'x' }, userId)).rejects.toBeInstanceOf(NotFoundException)
      expect(mockPrisma.route.update).not.toHaveBeenCalled()
    })
  })

  describe('remove', () => {
    it('deletes the route of the user', async () => {
      mockPrisma.route.findUnique.mockResolvedValue({ id: 'route-1' })

      await service.remove('route-1', userId)

      expect(mockPrisma.route.delete).toHaveBeenCalledWith({ where: { id: 'route-1', userId } })
    })

    it('throws NotFoundException when route does not exist', async () => {
      mockPrisma.route.findUnique.mockResolvedValue(null)

      await expect(service.remove('nonexistent', userId)).rejects.toThrow('not found')
      expect(mockPrisma.route.delete).not.toHaveBeenCalled()
    })
  })

  describe('exportGpx', () => {
    it('returns the stored GPX content', async () => {
      mockPrisma.route.findUnique.mockResolvedValue({
        gpxContent: sampleGpx,
        name: 'Test Route',
      })

      const result = await service.exportGpx('route-1', userId)

      expect(result).toBe(sampleGpx)
    })

    it('throws NotFoundException when route does not exist', async () => {
      mockPrisma.route.findUnique.mockResolvedValue(null)

      await expect(service.exportGpx('nonexistent', userId)).rejects.toThrow('not found')
    })
  })
})
