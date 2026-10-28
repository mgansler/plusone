import { Test, TestingModule } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import { UnauthorizedException } from '@nestjs/common'

import { PrismaService } from '@plusone/gpx-toolbox-persistence'

import { StravaService } from './strava.service'
import { AuthService } from './auth.service'

describe('AuthService', () => {
  let service: AuthService
  let jwtService: JwtService
  let prisma: PrismaService
  let stravaService: StravaService

  const originalEnv = process.env

  beforeEach(async () => {
    jwtService = {
      sign: vi.fn().mockReturnValue('mock-jwt-token'),
      verify: vi.fn().mockReturnValue({ sub: 'user-1', stravaId: '12345' }),
    } as unknown as JwtService

    process.env = { ...originalEnv, STRAVA_CLIENT_ID: 'test-client-id' }

    stravaService = {
      getAthlete: vi.fn().mockResolvedValue({
        id: '12345',
        firstname: 'Test',
        lastname: 'User',
        profile: 'https://example.com/avatar.jpg',
      }),
    } as unknown as StravaService

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: jwtService },
        {
          provide: PrismaService,
          useValue: {
            user: {
              upsert: vi.fn(),
              findUnique: vi.fn(),
              update: vi.fn(),
            },
          },
        },
        { provide: StravaService, useValue: stravaService },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    prisma = module.get(PrismaService)
  })

  afterEach(() => {
    process.env = originalEnv
    vi.restoreAllMocks()
  })

  describe('getAuthorizationUrl', () => {
    it('returns a Strava authorization URL with correct parameters', () => {
      const result = service.getAuthorizationUrl()

      expect(result.authorizationUrl).toContain('https://www.strava.com/oauth/authorize')
      expect(result.authorizationUrl).toContain('client_id=test-client-id')
      expect(result.authorizationUrl).toContain('response_type=code')
      expect(result.authorizationUrl).toContain('read_all')
      expect(result.authorizationUrl).toContain('activity%3Aread_all')
      expect(result.authorizationUrl).toContain('profile%3Aread_all')
    })

    it('uses custom redirect_uri when set', () => {
      process.env.STRAVA_REDIRECT_URI = 'https://custom.example.com/callback'

      const result = service.getAuthorizationUrl()

      expect(result.authorizationUrl).toContain('redirect_uri=https%3A%2F%2Fcustom.example.com%2Fcallback')
    })

    it('includes a state parameter for CSRF protection', () => {
      const result = service.getAuthorizationUrl()

      expect(result.authorizationUrl).toContain('state=')
    })
  })

  describe('verifyState', () => {
    it('accepts any state string (MVP behavior)', () => {
      expect(service.verifyState('any-state-value')).toBe(true)
      expect(service.verifyState('')).toBe(true)
      expect(service.verifyState('random123')).toBe(true)
    })
  })

  describe('refreshToken', () => {
    it('returns new access and refresh tokens plus expiry', async () => {
      const expiresAt = new Date('2030-01-01T00:00:00Z').getTime()
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          expires_at: Math.floor(expiresAt / 1000),
        }),
      })

      const result = await service.refreshToken('old-refresh-token')

      expect(result.accessToken).toBe('new-access-token')
      expect(result.refreshToken).toBe('new-refresh-token')
      expect(result.expiresAt).toEqual(new Date(expiresAt))
      expect(global.fetch).toHaveBeenCalledWith(
        'https://www.strava.com/oauth/token',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"refresh_token":"old-refresh-token"'),
        }),
      )
    })

    it('throws when token refresh fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: vi.fn().mockResolvedValue('invalid_grant'),
      })

      await expect(service.refreshToken('invalid-token')).rejects.toThrow('Failed to refresh Strava token')
    })
  })

  describe('getValidAccessToken', () => {
    it('returns the stored token when it is still valid', async () => {
      const future = new Date(Date.now() + 60 * 60 * 1000)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        accessToken: 'valid-token',
        refreshToken: 'refresh-token',
        tokenExpiresAt: future,
      } as never)

      const token = await service.getValidAccessToken('user-1')

      expect(token).toBe('valid-token')
      // No refresh should be attempted
      expect(global.fetch).not.toHaveBeenCalled()
      expect(prisma.user.update).not.toHaveBeenCalled()
    })

    it('refreshes and persists when the token is expired', async () => {
      const past = new Date(Date.now() - 60 * 1000)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        accessToken: 'expired-token',
        refreshToken: 'refresh-token',
        tokenExpiresAt: past,
      } as never)
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          access_token: 'fresh-token',
          refresh_token: 'fresh-refresh-token',
          expires_at: Math.floor((Date.now() + 60 * 60 * 1000) / 1000),
        }),
      })
      vi.mocked(prisma.user.update).mockResolvedValue({} as never)

      const token = await service.getValidAccessToken('user-1')

      expect(token).toBe('fresh-token')
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          data: expect.objectContaining({ accessToken: 'fresh-token', refreshToken: 'fresh-refresh-token' }),
        }),
      )
    })

    it('refreshes when the expiry is unknown (tokenExpiresAt null)', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        accessToken: 'unknown-token',
        refreshToken: 'refresh-token',
        tokenExpiresAt: null,
      } as never)
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          access_token: 'fresh-token',
          refresh_token: 'fresh-refresh-token',
          expires_at: Math.floor((Date.now() + 60 * 60 * 1000) / 1000),
        }),
      })
      vi.mocked(prisma.user.update).mockResolvedValue({} as never)

      const token = await service.getValidAccessToken('user-1')

      expect(token).toBe('fresh-token')
    })

    it('throws when no access token is stored', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

      await expect(service.getValidAccessToken('user-1')).rejects.toThrow(UnauthorizedException)
    })
  })
})
