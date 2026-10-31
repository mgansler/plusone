import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'

import { CareType, PrismaService } from '@plusone/trailcare-persistence'

import { CareService } from './care.service'
import { UNDO_WINDOW_MS } from './care-entry.mapper'
import { ADMIN_SESSION, USER_SESSION } from './controller-test-app'

function careEntry(overrides: Record<string, unknown> = {}) {
  return {
    id: 5,
    trailId: 1,
    type: CareType.SWEPT,
    performedAt: new Date(),
    comment: null,
    performedBy: null,
    createdBySessionId: USER_SESSION.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

describe('CareService', () => {
  let service: CareService
  const prisma = {
    trail: { count: vi.fn() },
    careEntry: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  }

  beforeEach(async () => {
    vi.resetAllMocks()
    prisma.trail.count.mockResolvedValue(1)
    prisma.careEntry.create.mockImplementation(async ({ data }) => careEntry(data))
    prisma.careEntry.update.mockImplementation(async ({ data }) => careEntry(data))
    const module = await Test.createTestingModule({
      providers: [CareService, { provide: PrismaService, useValue: prisma }],
    }).compile()
    service = module.get(CareService)
  })

  describe('listEntries', () => {
    it('returns the entries newest first', async () => {
      prisma.careEntry.findMany.mockResolvedValue([careEntry({ id: 2 }), careEntry({ id: 1 })])

      const entries = await service.listEntries(1, USER_SESSION)

      expect(entries.map((entry) => entry.id)).toEqual([2, 1])
      expect(prisma.careEntry.findMany).toHaveBeenCalledWith({
        where: { trailId: 1 },
        orderBy: [{ performedAt: 'desc' }, { id: 'desc' }],
      })
    })

    it('throws for unknown trails', async () => {
      prisma.trail.count.mockResolvedValue(0)
      await expect(service.listEntries(1)).rejects.toThrow(NotFoundException)
    })
  })

  describe('createEntry', () => {
    it('defaults to now and remembers the creating session', async () => {
      const before = Date.now()
      const entry = await service.createEntry(1, { type: CareType.SWEPT }, USER_SESSION)

      const data = prisma.careEntry.create.mock.calls[0][0].data
      expect(data).toMatchObject({ trailId: 1, type: CareType.SWEPT, createdBySessionId: USER_SESSION.id })
      expect(data.performedAt.getTime()).toBeGreaterThanOrEqual(before)
      expect(entry.undoableUntil).toBeInstanceOf(Date)
    })

    it('trims texts and stores empty ones as null', async () => {
      await service.createEntry(1, { type: CareType.REPAIR, comment: '  Stufe  ', performedBy: '   ' }, USER_SESSION)
      expect(prisma.careEntry.create.mock.calls[0][0].data).toMatchObject({ comment: 'Stufe', performedBy: null })
    })

    it('accepts past dates and small clock skew', async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      await service.createEntry(1, { type: CareType.SWEPT, performedAt: yesterday }, USER_SESSION)
      await service.createEntry(1, { type: CareType.SWEPT, performedAt: new Date(Date.now() + 60_000) }, USER_SESSION)
      expect(prisma.careEntry.create).toHaveBeenCalledTimes(2)
    })

    it('rejects dates in the future', async () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
      await expect(
        service.createEntry(1, { type: CareType.SWEPT, performedAt: tomorrow }, USER_SESSION),
      ).rejects.toThrow(BadRequestException)
      expect(prisma.careEntry.create).not.toHaveBeenCalled()
    })

    it('throws for unknown trails', async () => {
      prisma.trail.count.mockResolvedValue(0)
      await expect(service.createEntry(1, { type: CareType.SWEPT }, USER_SESSION)).rejects.toThrow(NotFoundException)
    })
  })

  describe('updateEntry', () => {
    beforeEach(() => prisma.careEntry.findUnique.mockResolvedValue(careEntry({ comment: 'alt' })))

    it('leaves fields untouched that are not sent', async () => {
      await service.updateEntry(5, { type: CareType.INSPECTION }, ADMIN_SESSION)
      expect(prisma.careEntry.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: { type: CareType.INSPECTION, performedAt: undefined, comment: undefined, performedBy: undefined },
      })
    })

    it('clears texts sent as empty string', async () => {
      await service.updateEntry(5, { comment: '', performedBy: ' ' }, ADMIN_SESSION)
      expect(prisma.careEntry.update.mock.calls[0][0].data).toMatchObject({ comment: null, performedBy: null })
    })

    it('rejects dates in the future', async () => {
      await expect(
        service.updateEntry(5, { performedAt: new Date(Date.now() + 24 * 60 * 60 * 1000) }, ADMIN_SESSION),
      ).rejects.toThrow(BadRequestException)
    })

    it('throws for unknown entries', async () => {
      prisma.careEntry.findUnique.mockResolvedValue(null)
      await expect(service.updateEntry(5, {}, ADMIN_SESSION)).rejects.toThrow(NotFoundException)
    })
  })

  describe('deleteEntry', () => {
    it('lets the creator undo within the window', async () => {
      prisma.careEntry.findUnique.mockResolvedValue(careEntry())
      await service.deleteEntry(5, USER_SESSION)
      expect(prisma.careEntry.delete).toHaveBeenCalledWith({ where: { id: 5 } })
    })

    it('refuses other users and expired undos', async () => {
      prisma.careEntry.findUnique.mockResolvedValue(careEntry({ createdBySessionId: 'someone-else' }))
      await expect(service.deleteEntry(5, USER_SESSION)).rejects.toThrow(ForbiddenException)

      prisma.careEntry.findUnique.mockResolvedValue(careEntry({ createdAt: new Date(Date.now() - UNDO_WINDOW_MS - 1) }))
      await expect(service.deleteEntry(5, USER_SESSION)).rejects.toThrow(
        new ForbiddenException('Der Eintrag kann nicht mehr rückgängig gemacht werden'),
      )
      expect(prisma.careEntry.delete).not.toHaveBeenCalled()
    })

    it('lets admins delete any entry at any time', async () => {
      prisma.careEntry.findUnique.mockResolvedValue(
        careEntry({ createdBySessionId: 'someone-else', createdAt: new Date(2020, 0, 1) }),
      )
      await service.deleteEntry(5, ADMIN_SESSION)
      expect(prisma.careEntry.delete).toHaveBeenCalled()
    })

    it('throws for unknown entries', async () => {
      prisma.careEntry.findUnique.mockResolvedValue(null)
      await expect(service.deleteEntry(5, ADMIN_SESSION)).rejects.toThrow(NotFoundException)
    })
  })
})
