import { Test, TestingModule } from '@nestjs/testing'
import { HttpService } from '@nestjs/axios'
import { of } from 'rxjs'

import { PrismaService } from '@plusone/gpx-toolbox-persistence'

import { RidesService } from './rides.service'

describe('RidesService', () => {
  let service: RidesService

  const mockHttpService = {
    get: vi.fn(),
  }

  const mockPrisma = {
    route: {
      findUnique: vi.fn(),
    },
    activity: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  }

  const userId = 'user-1'

  beforeEach(async () => {
    vi.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RidesService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile()

    service = module.get<RidesService>(RidesService)
  })

  describe('findAll', () => {
    it('returns paginated activities for a route', async () => {
      const mockActivities = [
        {
          id: 'f1',
          routeId: 'route-1',
          userId,
          riddenAt: new Date('2024-06-01'),
          duration: 3600,
          avgHr: 150,
          maxHr: 170,
          notes: null,
          weather: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'f2',
          routeId: 'route-1',
          userId,
          riddenAt: new Date('2024-07-01'),
          duration: 4200,
          avgHr: 155,
          maxHr: 175,
          notes: null,
          weather: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockPrisma.route.findUnique.mockResolvedValue({ id: 'route-1' })
      mockPrisma.activity.findMany.mockResolvedValue(mockActivities)

      const result = await service.findAll('route-1', { page: 1, limit: 10 }, userId)

      expect(result.items).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(result.totalPages).toBe(1)
    })

    it('throws when route does not belong to user', async () => {
      mockPrisma.route.findUnique.mockResolvedValue(null)

      await expect(service.findAll('nonexistent-route', {}, userId)).rejects.toThrow('not found')
    })

    it('filters by date range', async () => {
      const mockActivities = [
        {
          id: 'f1',
          routeId: 'route-1',
          userId,
          riddenAt: new Date('2024-06-15'),
          duration: 3600,
          avgHr: 150,
          maxHr: 170,
          notes: null,
          weather: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockPrisma.route.findUnique.mockResolvedValue({ id: 'route-1' })
      mockPrisma.activity.findMany.mockResolvedValue(mockActivities)

      await service.findAll('route-1', { dateFrom: '2024-06-01', dateTo: '2024-06-30' }, userId)

      expect(mockPrisma.activity.findMany.mock.calls[0][0].where.riddenAt.gte).toBeDefined()
      expect(mockPrisma.activity.findMany.mock.calls[0][0].where.riddenAt.lte).toBeDefined()
    })
  })

  describe('findOne', () => {
    it('returns an activity when found', async () => {
      const mockActivity = {
        id: 'f1',
        routeId: 'route-1',
        userId,
        riddenAt: new Date('2024-06-01'),
        duration: 3600,
        avgHr: 150,
        maxHr: 170,
        notes: 'Great ride',
        weather: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.activity.findUnique.mockResolvedValue(mockActivity)

      const result = await service.findOne('f1', userId)

      expect(result.id).toBe('f1')
      expect(result.riddenAt).toEqual(new Date('2024-06-01'))
      expect(result.duration).toBe(3600)
      expect(result.avgHr).toBe(150)
      expect(result.maxHr).toBe(170)
      expect(result.notes).toBe('Great ride')
    })

    it('throws when activity not found', async () => {
      mockPrisma.activity.findUnique.mockResolvedValue(null)

      await expect(service.findOne('nonexistent', userId)).rejects.toThrow('not found')
    })
  })

  describe('create', () => {
    it('creates an activity with weather forecast', async () => {
      const mockRoute = {
        id: 'route-1',
        name: 'Test Route',
        polyline: JSON.stringify([
          { lat: 48.0, lng: 11.0 },
          { lat: 48.001, lng: 11.001 },
        ]),
      }

      mockPrisma.route.findUnique.mockResolvedValue(mockRoute)
      mockPrisma.activity.create.mockResolvedValue({
        id: 'f1',
        routeId: 'route-1',
        riddenAt: new Date('2024-06-01'),
        duration: null,
        avgHr: null,
        maxHr: null,
        notes: null,
        weather: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        route: mockRoute,
      })
      mockHttpService.get.mockReturnValue(
        of({
          data: {
            daily: {
              time: ['2024-06-01'],
              temperature_2m_max: [25],
              temperature_2m_min: [15],
              rain_sum: [0],
              wind_gusts_10m_max: [20],
            },
          },
        }),
      )

      const result = await service.create('route-1', { riddenAt: '2024-06-01T10:00:00Z' }, userId)

      expect(result.id).toBe('f1')
      expect(mockPrisma.activity.create.mock.calls[0][0].data.riddenAt).toEqual(new Date('2024-06-01T10:00:00Z'))
    })

    it('throws when route does not belong to user', async () => {
      mockPrisma.route.findUnique.mockResolvedValue(null)

      await expect(service.create('nonexistent-route', { riddenAt: '2024-06-01T10:00:00Z' }, userId)).rejects.toThrow(
        'not found',
      )
    })
  })

  describe('update', () => {
    it('updates an activity', async () => {
      const existing = {
        id: 'f1',
        routeId: 'route-1',
        userId,
        riddenAt: new Date('2024-06-01'),
        duration: 3600,
        avgHr: 150,
        maxHr: 170,
        notes: null,
        weather: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        route: { id: 'route-1' },
      }
      const updated = { ...existing, duration: 4000, notes: 'Updated notes' }

      mockPrisma.activity.findUnique.mockResolvedValue(existing)
      mockPrisma.activity.update.mockResolvedValue(updated)

      const result = await service.update('f1', { duration: 4000, notes: 'Updated notes' }, userId)

      expect(result.duration).toBe(4000)
      expect(result.notes).toBe('Updated notes')
    })

    it('throws when activity not found', async () => {
      mockPrisma.activity.findUnique.mockResolvedValue(null)

      await expect(service.update('nonexistent', { duration: 4000 }, userId)).rejects.toThrow('not found')
    })
  })

  describe('remove', () => {
    it('deletes an activity', async () => {
      const existing = {
        id: 'f1',
        routeId: 'route-1',
        userId,
        riddenAt: new Date(),
        duration: 3600,
        avgHr: null,
        maxHr: null,
        notes: null,
        weather: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockPrisma.activity.findUnique.mockResolvedValue(existing)
      mockPrisma.activity.delete.mockResolvedValue(undefined)

      await expect(service.remove('f1', userId)).resolves.toBeUndefined()
    })

    it('throws when activity not found', async () => {
      mockPrisma.activity.findUnique.mockResolvedValue(null)

      await expect(service.remove('nonexistent', userId)).rejects.toThrow('not found')
    })
  })

  describe('getWeatherForecast', () => {
    it('returns weather for a route on a given date', async () => {
      const mockRoute = {
        id: 'route-1',
        polyline: JSON.stringify([
          { lat: 48.0, lng: 11.0 },
          { lat: 48.001, lng: 11.001 },
        ]),
      }

      mockPrisma.route.findUnique.mockResolvedValue(mockRoute)
      mockHttpService.get.mockReturnValue(
        of({
          data: {
            daily: {
              time: ['2024-06-01'],
              temperature_2m_max: [25],
              temperature_2m_min: [15],
              rain_sum: [0],
              wind_gusts_10m_max: [20],
            },
          },
        }),
      )

      const result = await service.getWeatherForecast('route-1', '2024-06-01')

      expect(result).not.toBeNull()
      expect(result?.temperature2m.max).toBe(25)
      expect(result?.temperature2m.min).toBe(15)
      expect(result?.rain.sum).toBe(0)
    })

    it('returns null when route has no polyline', async () => {
      const mockRoute = {
        id: 'route-1',
        polyline: JSON.stringify([]),
      }

      mockPrisma.route.findUnique.mockResolvedValue(mockRoute)

      const result = await service.getWeatherForecast('route-1', '2024-06-01')

      expect(result).toBeNull()
    })

    it('throws when route not found', async () => {
      mockPrisma.route.findUnique.mockResolvedValue(null)

      await expect(service.getWeatherForecast('nonexistent', '2024-06-01')).rejects.toThrow('not found')
    })
  })
})
