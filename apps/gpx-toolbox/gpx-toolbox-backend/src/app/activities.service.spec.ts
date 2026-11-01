import { NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'

import { PrismaService } from '@plusone/gpx-toolbox-persistence'

import { ActivitiesService } from './activities.service'

const userId = 'user-1'

function makeActivity(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    routeId: 'route-1',
    userId,
    stravaActivityId: null,
    title: `Fahrt ${id}`,
    riddenAt: new Date('2024-06-01'),
    duration: 3600,
    avgHr: null,
    maxHr: null,
    notes: null,
    weather: null,
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-06-01'),
    route: { id: 'route-1', name: 'Hausrunde', status: 'ridden', stats: { distance: 30000 } },
    ...overrides,
  }
}

describe('ActivitiesService', () => {
  let service: ActivitiesService

  const mockPrisma = {
    activity: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  }

  beforeEach(async () => {
    vi.clearAllMocks()

    const moduleRef = await Test.createTestingModule({
      providers: [ActivitiesService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile()

    service = moduleRef.get(ActivitiesService)
  })

  describe('findAll', () => {
    const activities = Array.from({ length: 5 }, (_, i) => makeActivity(`a${i + 1}`))

    it('scopes the query to the user and includes the route', async () => {
      mockPrisma.activity.findMany.mockResolvedValue([])

      await service.findAll({}, userId)

      expect(mockPrisma.activity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ userId }), include: { route: true } }),
      )
    })

    it('paginates and adds the route name', async () => {
      mockPrisma.activity.findMany.mockResolvedValue(activities)

      const result = await service.findAll({ page: 2, limit: 2 }, userId)

      expect(result.items.map((a) => a.id)).toEqual(['a3', 'a4'])
      expect(result.items[0].routeName).toBe('Hausrunde')
      expect(result).toMatchObject({ total: 5, page: 2, limit: 2, totalPages: 3 })
    })

    it('returns a partial last page', async () => {
      mockPrisma.activity.findMany.mockResolvedValue(activities)

      const result = await service.findAll({ page: 3, limit: 2 }, userId)

      expect(result.items.map((a) => a.id)).toEqual(['a5'])
    })

    it('returns an empty page beyond the last page', async () => {
      mockPrisma.activity.findMany.mockResolvedValue(activities)

      const result = await service.findAll({ page: 4, limit: 2 }, userId)

      expect(result.items).toEqual([])
      expect(result.total).toBe(5)
    })

    it('defaults to page 1 with 50 entries', async () => {
      mockPrisma.activity.findMany.mockResolvedValue(activities)

      const result = await service.findAll({}, userId)

      expect(result).toMatchObject({ page: 1, limit: 50, totalPages: 1 })
      expect(result.items).toHaveLength(5)
    })
  })

  describe('findOne', () => {
    it('returns the activity with its route', async () => {
      mockPrisma.activity.findUnique.mockResolvedValue(
        makeActivity('a1', { weather: JSON.stringify({ date: '2024-06-01' }) }),
      )

      const result = await service.findOne('a1', userId)

      expect(mockPrisma.activity.findUnique).toHaveBeenCalledWith({
        where: { id: 'a1', userId },
        include: { route: true },
      })
      expect(result.route).toEqual({ id: 'route-1', name: 'Hausrunde', status: 'ridden', stats: { distance: 30000 } })
      expect(result.weather).toEqual({ date: '2024-06-01' })
    })

    it('throws NotFoundException when the activity does not exist', async () => {
      mockPrisma.activity.findUnique.mockResolvedValue(null)

      await expect(service.findOne('missing', userId)).rejects.toBeInstanceOf(NotFoundException)
    })
  })

  describe('update', () => {
    it('updates the activity of the user', async () => {
      mockPrisma.activity.findUnique.mockResolvedValue({ id: 'a1' })
      mockPrisma.activity.update.mockResolvedValue(makeActivity('a1', { notes: 'Gegenwind' }))

      const result = await service.update('a1', { notes: 'Gegenwind' }, userId)

      expect(mockPrisma.activity.update).toHaveBeenCalledWith({
        where: { id: 'a1', userId },
        data: { notes: 'Gegenwind' },
        include: { route: true },
      })
      expect(result.notes).toBe('Gegenwind')
    })

    it('throws NotFoundException instead of a Prisma error when the activity does not exist', async () => {
      mockPrisma.activity.findUnique.mockResolvedValue(null)

      await expect(service.update('missing', { notes: 'x' }, userId)).rejects.toBeInstanceOf(NotFoundException)
      expect(mockPrisma.activity.update).not.toHaveBeenCalled()
    })
  })

  describe('remove', () => {
    it('deletes the activity of the user', async () => {
      mockPrisma.activity.findUnique.mockResolvedValue({ id: 'a1' })

      await service.remove('a1', userId)

      expect(mockPrisma.activity.delete).toHaveBeenCalledWith({ where: { id: 'a1', userId } })
    })

    it('throws NotFoundException when the activity does not exist', async () => {
      mockPrisma.activity.findUnique.mockResolvedValue(null)

      await expect(service.remove('missing', userId)).rejects.toBeInstanceOf(NotFoundException)
      expect(mockPrisma.activity.delete).not.toHaveBeenCalled()
    })
  })
})
