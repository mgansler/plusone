import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'

import { CareType, Prisma, PrismaService } from '@plusone/trailcare-persistence'

import { USER_SESSION } from './controller-test-app'
import { SweepStatus } from './sweep-status'
import { TrailService } from './trail.service'

const DAY = 24 * 60 * 60 * 1000

function trailRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    name: 'Klabuster',
    trailAreaId: 10,
    trailArea: { name: 'Heslach' },
    aliases: [{ id: 1, name: 'Klabi', trailId: 1 }],
    sweepGreenMaxDays: null,
    sweepYellowMaxDays: null,
    careEntries: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

function careEntry(overrides: Record<string, unknown> = {}) {
  return {
    id: 100,
    trailId: 1,
    type: CareType.FALLEN_TREE,
    performedAt: new Date(),
    comment: null,
    performedBy: null,
    createdBySessionId: USER_SESSION.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

const uniqueViolation = () =>
  new Prisma.PrismaClientKnownRequestError('unique', { code: 'P2002', clientVersion: 'test' })

describe('TrailService', () => {
  let service: TrailService
  const prisma = {
    trailArea: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    trail: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    careEntry: { findMany: vi.fn() },
    sweepSettings: { findUnique: vi.fn(), upsert: vi.fn() },
  }

  beforeEach(async () => {
    vi.resetAllMocks()
    prisma.careEntry.findMany.mockResolvedValue([])
    prisma.sweepSettings.findUnique.mockResolvedValue(null)
    const module = await Test.createTestingModule({
      providers: [TrailService, { provide: PrismaService, useValue: prisma }],
    }).compile()
    service = module.get(TrailService)
  })

  describe('listTrailAreas', () => {
    it('combines trails with their last sweep', async () => {
      prisma.trailArea.findMany.mockResolvedValue([
        {
          id: 10,
          name: 'Heslach',
          trails: [
            trailRecord(),
            trailRecord({ id: 2, name: 'Saubuckel', aliases: [], careEntries: [careEntry({ trailId: 2 })] }),
          ],
        },
      ])
      prisma.careEntry.findMany.mockResolvedValue([{ trailId: 1, performedAt: new Date(Date.now() - 3 * DAY) }])

      const [area] = await service.listTrailAreas(USER_SESSION)

      expect(area).toMatchObject({ id: 10, name: 'Heslach' })
      expect(area.trails[0]).toMatchObject({
        name: 'Klabuster',
        trailAreaName: 'Heslach',
        aliases: ['Klabi'],
        sweepStatus: SweepStatus.YELLOW,
        daysSinceSwept: 3,
        lastCareEntry: undefined,
      })
      expect(area.trails[1]).toMatchObject({ sweepStatus: SweepStatus.RED, daysSinceSwept: undefined })
      expect(area.trails[1].lastSweptAt).toBeUndefined()
      expect(area.trails[1].lastCareEntry).toMatchObject({ id: 100, type: CareType.FALLEN_TREE })
      expect(area.trails[1].lastCareEntry?.undoableUntil).toBeInstanceOf(Date)
    })

    it('bases the traffic light on the most recently entered sweep only', async () => {
      prisma.trailArea.findMany.mockResolvedValue([])
      await service.listTrailAreas()
      expect(prisma.careEntry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { type: CareType.SWEPT, trailId: undefined },
          orderBy: { id: 'desc' },
          distinct: ['trailId'],
        }),
      )
    })
  })

  describe('getTrail', () => {
    it('limits the sweep lookup to the trail', async () => {
      prisma.trail.findUnique.mockResolvedValue(trailRecord())
      prisma.careEntry.findMany.mockResolvedValue([{ trailId: 1, performedAt: new Date() }])

      expect(await service.getTrail(1)).toMatchObject({ id: 1, sweepStatus: SweepStatus.GREEN, daysSinceSwept: 0 })
      expect(prisma.careEntry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { type: CareType.SWEPT, trailId: 1 } }),
      )
    })

    it('throws for unknown trails', async () => {
      prisma.trail.findUnique.mockResolvedValue(null)
      await expect(service.getTrail(1)).rejects.toThrow(NotFoundException)
    })
  })

  describe('sweep settings', () => {
    it('falls back to 2/4 days until they are saved', async () => {
      expect(await service.getSweepSettings()).toEqual({ sweepGreenMaxDays: 2, sweepYellowMaxDays: 4 })
    })

    it('saves the thresholds in the single settings row', async () => {
      prisma.sweepSettings.upsert.mockResolvedValue({ id: 1, sweepGreenMaxDays: 4, sweepYellowMaxDays: 8 })

      await service.updateSweepSettings({ sweepGreenMaxDays: 4, sweepYellowMaxDays: 8 })

      expect(prisma.sweepSettings.upsert).toHaveBeenCalledWith({
        where: { id: 1 },
        create: { id: 1, sweepGreenMaxDays: 4, sweepYellowMaxDays: 8 },
        update: { sweepGreenMaxDays: 4, sweepYellowMaxDays: 8 },
      })
    })

    it('rejects yellow below green', async () => {
      await expect(service.updateSweepSettings({ sweepGreenMaxDays: 5, sweepYellowMaxDays: 4 })).rejects.toThrow(
        BadRequestException,
      )
      expect(prisma.sweepSettings.upsert).not.toHaveBeenCalled()
    })
  })

  describe('trail areas', () => {
    it('reports duplicate names as conflict', async () => {
      prisma.trailArea.create.mockRejectedValue(uniqueViolation())
      await expect(service.createTrailArea({ name: 'Heslach' })).rejects.toThrow(
        new ConflictException('Ein Trailgebiet mit diesem Namen existiert bereits'),
      )

      prisma.trailArea.update.mockRejectedValue(uniqueViolation())
      await expect(service.updateTrailArea(1, { name: 'Heslach' })).rejects.toThrow(ConflictException)
    })

    it('reports deleting an unknown area as not found', async () => {
      prisma.trailArea.delete.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('missing', { code: 'P2025', clientVersion: 'test' }),
      )
      await expect(service.deleteTrailArea(1)).rejects.toThrow(NotFoundException)
    })
  })

  describe('createTrail', () => {
    it('drops duplicate aliases and the trail name itself', async () => {
      prisma.trail.create.mockResolvedValue(trailRecord())

      await service.createTrail(10, { name: 'Klabuster', aliases: ['Klabi', 'KLABI', 'klabuster', 'Kla'] })

      expect(prisma.trail.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Klabuster',
            trailAreaId: 10,
            aliases: { create: [{ name: 'Klabi' }, { name: 'Kla' }] },
          }),
        }),
      )
    })

    it('stores no thresholds for trails that follow the global ones', async () => {
      prisma.trail.create.mockResolvedValue(trailRecord())
      await service.createTrail(10, { name: 'x' })
      expect(prisma.trail.create.mock.calls[0][0].data).toMatchObject({
        sweepGreenMaxDays: null,
        sweepYellowMaxDays: null,
      })
    })

    it('rejects yellow below green and only one of both thresholds', async () => {
      await expect(service.createTrail(10, { name: 'x', sweepGreenMaxDays: 3, sweepYellowMaxDays: 2 })).rejects.toThrow(
        BadRequestException,
      )
      await expect(service.createTrail(10, { name: 'x', sweepGreenMaxDays: 5 })).rejects.toThrow(BadRequestException)
      await expect(service.createTrail(10, { name: 'x', sweepYellowMaxDays: 1 })).rejects.toThrow(BadRequestException)
      expect(prisma.trail.create).not.toHaveBeenCalled()
    })

    it('allows equal thresholds', async () => {
      prisma.trail.create.mockResolvedValue(trailRecord({ sweepGreenMaxDays: 3, sweepYellowMaxDays: 3 }))
      await expect(
        service.createTrail(10, { name: 'x', sweepGreenMaxDays: 3, sweepYellowMaxDays: 3 }),
      ).resolves.toBeDefined()
    })

    it('reports duplicate names within the area as conflict', async () => {
      prisma.trail.create.mockRejectedValue(uniqueViolation())
      await expect(service.createTrail(10, { name: 'Klabuster' })).rejects.toThrow(
        new ConflictException('Ein Trail mit diesem Namen existiert in diesem Gebiet bereits'),
      )
    })
  })

  describe('updateTrail', () => {
    beforeEach(() => {
      prisma.trail.findUnique.mockResolvedValue(trailRecord())
      prisma.trail.update.mockResolvedValue(trailRecord())
    })

    it('keeps the aliases when none are sent', async () => {
      await service.updateTrail(1, { name: 'Neu' })
      expect(prisma.trail.update.mock.calls[0][0].data.aliases).toBeUndefined()
    })

    it('replaces the aliases and removes the new name from them', async () => {
      await service.updateTrail(1, { name: 'Klabi', aliases: ['Klabi', 'Klabuster'] })
      expect(prisma.trail.update.mock.calls[0][0].data.aliases).toEqual({
        deleteMany: {},
        create: [{ name: 'Klabuster' }],
      })
    })

    it('compares aliases with the existing name when the name stays', async () => {
      await service.updateTrail(1, { aliases: ['klabuster', 'K'] })
      expect(prisma.trail.update.mock.calls[0][0].data.aliases.create).toEqual([{ name: 'K' }])
    })

    it('sets, keeps and resets the trail’s own thresholds', async () => {
      await service.updateTrail(1, { sweepGreenMaxDays: 1, sweepYellowMaxDays: 2 })
      expect(prisma.trail.update.mock.calls[0][0].data).toMatchObject({ sweepGreenMaxDays: 1, sweepYellowMaxDays: 2 })

      prisma.trail.findUnique.mockResolvedValue(trailRecord({ sweepGreenMaxDays: 1, sweepYellowMaxDays: 2 }))
      await service.updateTrail(1, { name: 'Neu' })
      expect(prisma.trail.update.mock.calls[1][0].data).toMatchObject({ sweepGreenMaxDays: 1, sweepYellowMaxDays: 2 })

      await service.updateTrail(1, { sweepGreenMaxDays: null, sweepYellowMaxDays: null })
      expect(prisma.trail.update.mock.calls[2][0].data).toMatchObject({
        sweepGreenMaxDays: null,
        sweepYellowMaxDays: null,
      })
    })

    it('rejects yellow below green and only one of both thresholds', async () => {
      await expect(service.updateTrail(1, { sweepGreenMaxDays: 5, sweepYellowMaxDays: 3 })).rejects.toThrow(
        BadRequestException,
      )
      // Overrides always come as a pair, a single value would mix with the global one
      await expect(service.updateTrail(1, { sweepGreenMaxDays: 5 })).rejects.toThrow(BadRequestException)
      await expect(service.updateTrail(1, { sweepYellowMaxDays: 1 })).rejects.toThrow(BadRequestException)
      expect(prisma.trail.update).not.toHaveBeenCalled()
    })

    it('returns the reloaded trail', async () => {
      prisma.trail.findUnique
        .mockResolvedValueOnce(trailRecord())
        .mockResolvedValueOnce(trailRecord({ name: 'Neu', trailAreaId: 11, trailArea: { name: 'Solitude' } }))

      expect(await service.updateTrail(1, { name: 'Neu', trailAreaId: 11 })).toMatchObject({
        name: 'Neu',
        trailAreaName: 'Solitude',
      })
    })

    it('throws for unknown trails', async () => {
      prisma.trail.findUnique.mockReset().mockResolvedValue(null)
      await expect(service.updateTrail(1, { name: 'x' })).rejects.toThrow(NotFoundException)
    })
  })
})
