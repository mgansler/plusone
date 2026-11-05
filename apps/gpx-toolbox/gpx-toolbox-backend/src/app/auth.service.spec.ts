import { UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'

import { PrismaService } from '@plusone/gpx-toolbox-persistence'

import { AuthService } from './auth.service'
import { OidcService } from './oidc.service'

const JWT_SECRET = 'test-secret'

describe('AuthService', () => {
  let service: AuthService
  let jwtService: JwtService
  let prisma: {
    identity: { findUnique: ReturnType<typeof vi.fn> }
    user: { create: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> }
  }
  let oidcService: { buildAuthorization: ReturnType<typeof vi.fn>; authenticate: ReturnType<typeof vi.fn> }

  const originalEnv = process.env

  beforeEach(async () => {
    process.env = {
      ...originalEnv,
      JWT_SECRET,
      GOOGLE_CLIENT_ID: 'google-client-id',
      GOOGLE_CLIENT_SECRET: 'google-secret',
    }

    prisma = {
      identity: { findUnique: vi.fn() },
      user: { create: vi.fn(), update: vi.fn() },
    }
    oidcService = { buildAuthorization: vi.fn(), authenticate: vi.fn() }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: new JwtService({ secret: JWT_SECRET }) },
        { provide: PrismaService, useValue: prisma },
        { provide: OidcService, useValue: oidcService },
      ],
    }).compile()

    service = module.get(AuthService)
    jwtService = module.get(JwtService)
  })

  afterEach(() => {
    process.env = originalEnv
    vi.restoreAllMocks()
  })

  describe('getGoogleAuthorization', () => {
    it('starts the flow at Google with the configured client', async () => {
      oidcService.buildAuthorization.mockResolvedValue({ authorizationUrl: 'https://google/auth' })

      await expect(service.getGoogleAuthorization()).resolves.toEqual({ authorizationUrl: 'https://google/auth' })

      expect(oidcService.buildAuthorization).toHaveBeenCalledWith({
        discoveryUrl: 'https://accounts.google.com/.well-known/openid-configuration',
        clientId: 'google-client-id',
        clientSecret: 'google-secret',
        redirectUri: 'http://localhost:3333/api/auth/google/callback',
        scope: 'openid email profile',
      })
    })

    it('uses the configured redirect URI and discovery document', async () => {
      process.env.GOOGLE_REDIRECT_URI = 'https://gpx.example.com/api/auth/google/callback'
      process.env.GOOGLE_DISCOVERY_URL = 'http://localhost:3435/.well-known/openid-configuration'

      await service.getGoogleAuthorization()

      expect(oidcService.buildAuthorization).toHaveBeenCalledWith(
        expect.objectContaining({
          redirectUri: 'https://gpx.example.com/api/auth/google/callback',
          discoveryUrl: 'http://localhost:3435/.well-known/openid-configuration',
        }),
      )
    })
  })

  describe('loginWithGoogle', () => {
    const claims = {
      subject: 'google-sub-1',
      email: 'test@example.com',
      emailVerified: true,
      name: 'Test User',
      picture: 'https://example.com/avatar.jpg',
    }

    beforeEach(() => {
      oidcService.authenticate.mockResolvedValue(claims)
    })

    it('verifies the identity with the values remembered at the start of the login', async () => {
      prisma.identity.findUnique.mockResolvedValue(null)
      prisma.user.create.mockResolvedValue({ id: 'user-1' })

      await service.loginWithGoogle('the-code', 'verifier', 'nonce')

      expect(oidcService.authenticate).toHaveBeenCalledWith(
        expect.objectContaining({ clientId: 'google-client-id' }),
        'the-code',
        'verifier',
        'nonce',
      )
    })

    it('creates the user with its identity on the first login and issues a JWT', async () => {
      prisma.identity.findUnique.mockResolvedValue(null)
      prisma.user.create.mockResolvedValue({ id: 'user-1' })

      const result = await service.loginWithGoogle('the-code', 'verifier', 'nonce')

      expect(prisma.identity.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { provider_subject: { provider: 'google', subject: 'google-sub-1' } } }),
      )
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          avatarUrl: 'https://example.com/avatar.jpg',
          identities: { create: { provider: 'google', subject: 'google-sub-1', email: 'test@example.com' } },
        },
      })
      expect(result.userId).toBe('user-1')
      expect(jwtService.verify(result.jwtToken)).toMatchObject({ sub: 'user-1' })
      expect(prisma.user.update).not.toHaveBeenCalled()
    })

    it('does not store an email address Google has not verified', async () => {
      oidcService.authenticate.mockResolvedValue({ ...claims, emailVerified: false })
      prisma.identity.findUnique.mockResolvedValue(null)
      prisma.user.create.mockResolvedValue({ id: 'user-1' })

      await service.loginWithGoogle('the-code', 'verifier', 'nonce')

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: null,
          identities: { create: expect.objectContaining({ email: null }) },
        }),
      })
    })

    it('logs in the existing user and refreshes the profile', async () => {
      prisma.identity.findUnique.mockResolvedValue({
        userId: 'user-1',
        user: { id: 'user-1', name: 'Old Name', email: 'old@example.com', avatarUrl: null },
      })
      prisma.user.update.mockResolvedValue({ id: 'user-1' })

      const result = await service.loginWithGoogle('the-code', 'verifier', 'nonce')

      expect(prisma.user.create).not.toHaveBeenCalled()
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { name: 'Test User', email: 'test@example.com', avatarUrl: 'https://example.com/avatar.jpg' },
      })
      expect(jwtService.verify(result.jwtToken)).toMatchObject({ sub: 'user-1' })
    })

    it('keeps the stored profile when Google sends less', async () => {
      oidcService.authenticate.mockResolvedValue({
        subject: 'google-sub-1',
        email: null,
        emailVerified: false,
        name: null,
        picture: null,
      })
      prisma.identity.findUnique.mockResolvedValue({
        userId: 'user-1',
        user: { id: 'user-1', name: 'Old Name', email: 'old@example.com', avatarUrl: 'https://example.com/old.jpg' },
      })
      prisma.user.update.mockResolvedValue({ id: 'user-1' })

      await service.loginWithGoogle('the-code', 'verifier', 'nonce')

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { name: 'Old Name', email: 'old@example.com', avatarUrl: 'https://example.com/old.jpg' },
      })
    })

    it('does not create a user when the identity cannot be verified', async () => {
      oidcService.authenticate.mockRejectedValue(new UnauthorizedException('Invalid ID token'))

      await expect(service.loginWithGoogle('bad', 'verifier', 'nonce')).rejects.toBeInstanceOf(UnauthorizedException)

      expect(prisma.user.create).not.toHaveBeenCalled()
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
})
