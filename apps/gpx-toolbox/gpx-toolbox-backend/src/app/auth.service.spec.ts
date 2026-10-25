import { Test, TestingModule } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'

import { PrismaService } from '@plusone/gpx-toolbox-persistence'

import { AuthService } from './auth.service'

describe('AuthService', () => {
  let service: AuthService
  let jwtService: JwtService

  const originalEnv = process.env

  beforeEach(async () => {
    jwtService = {
      sign: vi.fn().mockReturnValue('mock-jwt-token'),
      verify: vi.fn().mockReturnValue({ sub: 'user-1', stravaId: '12345' }),
    } as unknown as JwtService

    process.env = { ...originalEnv, STRAVA_CLIENT_ID: 'test-client-id' }

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
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
  })

  afterEach(() => {
    process.env = originalEnv
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
    it('returns new access and refresh tokens', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
        }),
      })

      const result = await service.refreshToken('old-refresh-token')

      expect(result.accessToken).toBe('new-access-token')
      expect(result.refreshToken).toBe('new-refresh-token')
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
      })

      await expect(service.refreshToken('invalid-token')).rejects.toThrow('Failed to refresh Strava token')
    })
  })
})
