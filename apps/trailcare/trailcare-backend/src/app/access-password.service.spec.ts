import { NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'

import { Prisma, PrismaService } from '@plusone/trailcare-persistence'

import { AccessPasswordService } from './access-password.service'
import { verifyPassword } from './auth/password-hash'

function accessPassword(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    label: 'Crew',
    passwordHash: 'scrypt:00:00',
    lastUsedAt: null,
    createdAt: new Date('2026-10-01'),
    updatedAt: new Date('2026-10-01'),
    _count: { sessions: 2 },
    ...overrides,
  }
}

describe('AccessPasswordService', () => {
  let service: AccessPasswordService
  const prisma = {
    accessPassword: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), count: vi.fn(), delete: vi.fn() },
    session: { deleteMany: vi.fn() },
    $transaction: vi.fn(),
  }

  beforeEach(async () => {
    vi.resetAllMocks()
    prisma.accessPassword.create.mockImplementation(async ({ data }) => accessPassword(data))
    prisma.$transaction.mockImplementation(async (operations: Array<Promise<unknown>>) => Promise.all(operations))
    const module = await Test.createTestingModule({
      providers: [AccessPasswordService, { provide: PrismaService, useValue: prisma }],
    }).compile()
    service = module.get(AccessPasswordService)
  })

  it('lists passwords without their hashes and counts only active sessions', async () => {
    prisma.accessPassword.findMany.mockResolvedValue([accessPassword()])

    const [listed] = await service.list()

    expect(listed).toEqual({
      id: 1,
      label: 'Crew',
      activeSessions: 2,
      lastUsedAt: undefined,
      createdAt: new Date('2026-10-01'),
      updatedAt: new Date('2026-10-01'),
    })
    const include = prisma.accessPassword.findMany.mock.calls[0][0].include
    expect(include._count.select.sessions.where.expiresAt.gt).toBeInstanceOf(Date)
  })

  it('generates a password when none is given and stores only its hash', async () => {
    const created = await service.create({ label: 'Crew' })

    expect(created.password).toMatch(/^[a-z2-9]{4}-[a-z2-9]{4}-[a-z2-9]{4}$/)
    const { passwordHash } = prisma.accessPassword.create.mock.calls[0][0].data
    expect(passwordHash).not.toContain(created.password)
    expect(await verifyPassword(created.password, passwordHash)).toBe(true)
    expect(created).not.toHaveProperty('passwordHash')
  })

  it('uses a chosen password', async () => {
    const created = await service.create({ label: 'Crew', password: 'geheim123' })
    expect(created.password).toBe('geheim123')
  })

  it('rotates the password and ends its sessions in one transaction', async () => {
    prisma.accessPassword.count.mockResolvedValue(1)
    prisma.accessPassword.update.mockImplementation(async ({ data }) =>
      accessPassword({ ...data, _count: { sessions: 0 } }),
    )

    const rotated = await service.rotate(1, { password: 'neues-passwort' })

    expect(prisma.$transaction).toHaveBeenCalledTimes(1)
    expect(prisma.session.deleteMany).toHaveBeenCalledWith({ where: { accessPasswordId: 1 } })
    const { data } = prisma.accessPassword.update.mock.calls[0][0]
    expect(data.lastUsedAt).toBeNull()
    expect(await verifyPassword('neues-passwort', data.passwordHash)).toBe(true)
    expect(rotated).toMatchObject({ password: 'neues-passwort', activeSessions: 0 })
  })

  it('throws when rotating an unknown password', async () => {
    prisma.accessPassword.count.mockResolvedValue(0)
    await expect(service.rotate(1, {})).rejects.toThrow(NotFoundException)
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it('reports unknown passwords on rename and delete as not found', async () => {
    const missing = new Prisma.PrismaClientKnownRequestError('missing', { code: 'P2025', clientVersion: 'test' })
    prisma.accessPassword.update.mockRejectedValue(missing)
    prisma.accessPassword.delete.mockRejectedValue(missing)

    await expect(service.updateLabel(1, { label: 'x' })).rejects.toThrow(NotFoundException)
    await expect(service.delete(1)).rejects.toThrow(NotFoundException)
  })
})
