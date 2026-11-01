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

    process.env = { ...originalEnv, STRAVA_CLIENT_ID: 'test-client-id', STRAVA_CLIENT_SECRET: 'test-secret' }

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

    it('includes a random state parameter for CSRF protection and returns it', () => {
      const first = service.getAuthorizationUrl()
      const second = service.getAuthorizationUrl()

      expect(first.state).toMatch(/^[0-9a-f]{32}$/)
      expect(first.state).not.toBe(second.state)
      expect(new URL(first.authorizationUrl).searchParams.get('state')).toBe(first.state)
    })
  })

  describe('verifyState', () => {
    it('accepts the issued state', () => {
      expect(service.verifyState('abc123', 'abc123')).toBe(true)
    })

    it('rejects a different state', () => {
      expect(service.verifyState('abc124', 'abc123')).toBe(false)
      expect(service.verifyState('abc', 'abc123')).toBe(false)
    })

    it('rejects a missing state or a login that was not started here', () => {
      expect(service.verifyState(undefined, 'abc123')).toBe(false)
      expect(service.verifyState('abc123', undefined)).toBe(false)
      expect(service.verifyState('', '')).toBe(false)
    })
  })

  describe('authenticateWithAuthorizationCode', () => {
    const expiresAt = new Date('2030-01-01T00:00:00Z')

    beforeEach(() => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          access_token: 'access',
          refresh_token: 'refresh',
          expires_at: expiresAt.getTime() / 1000,
        }),
      })
      vi.mocked(prisma.user.upsert).mockResolvedValue({
        id: 'user-1',
        stravaId: '12345',
        name: 'Test',
        avatarUrl: null,
      } as never)
    })

    it('exchanges the code, upserts the user and issues a JWT', async () => {
      const result = await service.authenticateWithAuthorizationCode('the-code')

      expect(global.fetch).toHaveBeenCalledWith(
        'https://www.strava.com/oauth/token',
        expect.objectContaining({ body: expect.stringContaining('"grant_type":"authorization_code"') }),
      )
      expect(JSON.parse(vi.mocked(global.fetch).mock.calls[0][1]?.body as string)).toMatchObject({
        code: 'the-code',
        client_id: 'test-client-id',
        client_secret: 'test-secret',
      })
      expect(stravaService.getAthlete).toHaveBeenCalledWith('access')
      expect(prisma.user.upsert).toHaveBeenCalledWith({
        where: { stravaId: '12345' },
        update: { accessToken: 'access', refreshToken: 'refresh', tokenExpiresAt: expiresAt, name: 'Test' },
        create: {
          stravaId: '12345',
          accessToken: 'access',
          refreshToken: 'refresh',
          tokenExpiresAt: expiresAt,
          name: 'Test',
          avatarUrl: 'https://example.com/avatar.jpg',
        },
      })
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: 'user-1', stravaId: '12345' })
      expect(result.jwtToken).toBe('mock-jwt-token')
    })

    it('falls back to a 2h expiry when Strava returns no expires_at', async () => {
      vi.useFakeTimers({ now: new Date('2026-01-01T10:00:00Z') })
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ access_token: 'access', refresh_token: 'refresh' }),
      } as never)

      await service.authenticateWithAuthorizationCode('the-code')

      expect(vi.mocked(prisma.user.upsert).mock.calls[0][0].update.tokenExpiresAt).toEqual(
        new Date('2026-01-01T12:00:00Z'),
      )
      vi.useRealTimers()
    })

    it('throws Unauthorized when the code exchange fails', async () => {
      vi.mocked(global.fetch).mockResolvedValue({ ok: false, status: 400, statusText: 'Bad Request' } as never)

      await expect(service.authenticateWithAuthorizationCode('bad')).rejects.toBeInstanceOf(UnauthorizedException)
      expect(prisma.user.upsert).not.toHaveBeenCalled()
    })

    it('does not create a user with stravaId "undefined" when the profile cannot be fetched', async () => {
      vi.mocked(stravaService.getAthlete).mockResolvedValue({ message: 'Authorization Error' })

      await expect(service.authenticateWithAuthorizationCode('the-code')).rejects.toBeInstanceOf(UnauthorizedException)
      expect(prisma.user.upsert).not.toHaveBeenCalled()
    })
  })

  describe('authenticateWithRefreshToken', () => {
    it('refreshes the token and logs the user in', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ access_token: 'access', refresh_token: 'refresh', expires_at: 1 }),
      })
      vi.mocked(prisma.user.upsert).mockResolvedValue({
        id: 'user-1',
        stravaId: '12345',
        name: 'Test',
        avatarUrl: null,
      } as never)

      const result = await service.authenticateWithRefreshToken('my-refresh-token')

      expect(global.fetch).toHaveBeenCalledWith(
        'https://www.strava.com/oauth/token',
        expect.objectContaining({ body: expect.stringContaining('"refresh_token":"my-refresh-token"') }),
      )
      expect(result).toEqual({
        userId: 'user-1',
        stravaId: '12345',
        name: 'Test',
        avatarUrl: null,
        jwtToken: 'mock-jwt-token',
      })
    })

    it('throws Unauthorized for an invalid refresh token', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: vi.fn().mockResolvedValue('invalid'),
      })

      await expect(service.authenticateWithRefreshToken('invalid')).rejects.toBeInstanceOf(UnauthorizedException)
      expect(prisma.user.upsert).not.toHaveBeenCalled()
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
