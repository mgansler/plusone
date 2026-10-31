import { ConfigService } from '@nestjs/config'
import { Test } from '@nestjs/testing'

import { PrismaService, Role } from '@plusone/trailcare-persistence'

import { TRAILCARE_ADMIN_PASSWORD, TRAILCARE_INITIAL_ACCESS_PASSWORD } from '../config'

import { AuthService } from './auth.service'
import { hashPassword } from './password-hash'

describe('AuthService', () => {
  const prisma = {
    accessPassword: { count: vi.fn(), create: vi.fn(), findMany: vi.fn(), update: vi.fn() },
  }
  let config: Map<string, string | undefined>

  async function createService() {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => config.get(key),
            set: (key: string, value: string) => config.set(key, value),
          },
        },
      ],
    }).compile()
    return module.get(AuthService)
  }

  beforeEach(() => {
    vi.resetAllMocks()
    config = new Map()
  })

  describe('onModuleInit', () => {
    it('generates an admin password when none is configured', async () => {
      const service = await createService()
      await service.onModuleInit()
      expect(config.get(TRAILCARE_ADMIN_PASSWORD)).toMatch(/^[a-z2-9]{4}-[a-z2-9]{4}-[a-z2-9]{4}$/)
    })

    it('keeps a configured admin password', async () => {
      config.set(TRAILCARE_ADMIN_PASSWORD, 'secret')
      await (await createService()).onModuleInit()
      expect(config.get(TRAILCARE_ADMIN_PASSWORD)).toBe('secret')
    })

    it('seeds the initial access password only into an empty database', async () => {
      config.set(TRAILCARE_INITIAL_ACCESS_PASSWORD, 'crew')
      const service = await createService()

      prisma.accessPassword.count.mockResolvedValue(0)
      await service.onModuleInit()
      expect(prisma.accessPassword.create).toHaveBeenCalledWith({
        data: { label: 'Initial', passwordHash: expect.stringMatching(/^scrypt:/) },
      })

      prisma.accessPassword.create.mockClear()
      prisma.accessPassword.count.mockResolvedValue(1)
      await service.onModuleInit()
      expect(prisma.accessPassword.create).not.toHaveBeenCalled()
    })

    it('does not seed without an initial password', async () => {
      prisma.accessPassword.count.mockResolvedValue(0)
      await (await createService()).onModuleInit()
      expect(prisma.accessPassword.create).not.toHaveBeenCalled()
    })
  })

  describe('login', () => {
    beforeEach(async () => {
      config.set(TRAILCARE_ADMIN_PASSWORD, 'admin-secret')
      prisma.accessPassword.findMany.mockResolvedValue([
        { id: 1, passwordHash: await hashPassword('crew-a') },
        { id: 2, passwordHash: await hashPassword('crew-b') },
      ])
    })

    it('grants admin access with the admin password without touching access passwords', async () => {
      expect(await (await createService()).login('admin-secret')).toEqual({ role: Role.ADMIN })
      expect(prisma.accessPassword.findMany).not.toHaveBeenCalled()
    })

    it('grants user access with any access password and records its use', async () => {
      expect(await (await createService()).login('crew-b')).toEqual({ role: Role.USER, accessPasswordId: 2 })
      expect(prisma.accessPassword.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { lastUsedAt: expect.any(Date) },
      })
    })

    it('rejects unknown passwords', async () => {
      expect(await (await createService()).login('crew-c')).toBeNull()
      expect(prisma.accessPassword.update).not.toHaveBeenCalled()
    })
  })
})
