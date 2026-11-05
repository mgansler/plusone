import { INestApplication, UnauthorizedException, ValidationPipe } from '@nestjs/common'
import { JwtModule, JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import { PrismaService } from '@plusone/gpx-toolbox-persistence'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

const GOOGLE_COOKIE = 'gpx_toolbox_oauth'

const pending = { state: 's1', nonce: 'n1', codeVerifier: 'v1' }
const pendingCookie = (value: object = pending) => Buffer.from(JSON.stringify(value)).toString('base64url')

/** HTTP-level tests of the OAuth flows and the token endpoints */
describe('AuthController', () => {
  let app: INestApplication
  let jwt: JwtService

  const authService = {
    getGoogleAuthorization: vi.fn(),
    verifyState: vi.fn(),
    loginWithGoogle: vi.fn(),
  }
  const prisma = { user: { findUnique: vi.fn() } }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'test-secret' })],
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile()

    app = moduleRef.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ transform: true }))
    await app.init()
    jwt = moduleRef.get(JwtService)
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.FRONTEND_URL = 'https://gpx.example.com'
  })

  const bearer = (userId = 'user-1') => `Bearer ${jwt.sign({ sub: userId })}`

  describe('GET /auth/google', () => {
    it('remembers state, nonce and PKCE verifier in an http-only cookie and redirects to Google', async () => {
      authService.getGoogleAuthorization.mockResolvedValue({
        authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth?state=s1',
        ...pending,
      })

      const res = await request(app.getHttpServer()).get('/auth/google').expect(302)

      expect(res.headers.location).toBe('https://accounts.google.com/o/oauth2/v2/auth?state=s1')
      const cookie = String(res.headers['set-cookie'])
      expect(cookie).toContain(`${GOOGLE_COOKIE}=${pendingCookie()}`)
      expect(cookie).toContain('HttpOnly')
      expect(cookie).toContain('SameSite=Lax')
      expect(cookie).toContain('Path=/api/auth')
    })
  })

  describe('GET /auth/google/callback', () => {
    it('logs in and redirects to the frontend with the JWT in the fragment', async () => {
      authService.verifyState.mockReturnValue(true)
      authService.loginWithGoogle.mockResolvedValue({ jwtToken: 'jwt-1' })

      const res = await request(app.getHttpServer())
        .get('/auth/google/callback?code=c1&state=s1')
        .set('Cookie', `other=x; ${GOOGLE_COOKIE}=${pendingCookie()}`)
        .expect(302)

      expect(authService.verifyState).toHaveBeenCalledWith('s1', 's1')
      expect(authService.loginWithGoogle).toHaveBeenCalledWith('c1', 'v1', 'n1')
      expect(res.headers.location).toBe('https://gpx.example.com#token=jwt-1')
      // The cookie is single use
      expect(String(res.headers['set-cookie'])).toMatch(new RegExp(`${GOOGLE_COOKIE}=;.*Expires=Thu, 01 Jan 1970`))
    })

    it('rejects a state that does not match the cookie', async () => {
      authService.verifyState.mockReturnValue(false)

      await request(app.getHttpServer())
        .get('/auth/google/callback?code=c1&state=forged')
        .set('Cookie', `${GOOGLE_COOKIE}=${pendingCookie()}`)
        .expect(401)

      expect(authService.loginWithGoogle).not.toHaveBeenCalled()
    })

    it('rejects a callback of a login that was not started in this browser', async () => {
      await request(app.getHttpServer()).get('/auth/google/callback?code=c1&state=s1').expect(401)

      expect(authService.loginWithGoogle).not.toHaveBeenCalled()
    })

    it.each([
      ['is not valid base64 JSON', 'garbage'],
      ['lacks a field', pendingCookie({ state: 's1', nonce: 'n1' })],
    ])('treats a cookie that %s as no login started', async (_, cookie) => {
      authService.verifyState.mockReturnValue(true)

      await request(app.getHttpServer())
        .get('/auth/google/callback?code=c1&state=s1')
        .set('Cookie', `${GOOGLE_COOKIE}=${cookie}`)
        .expect(401)

      expect(authService.loginWithGoogle).not.toHaveBeenCalled()
    })

    it('sends the user back to the login page when they declined on the Google page', async () => {
      authService.verifyState.mockReturnValue(true)

      const res = await request(app.getHttpServer())
        .get('/auth/google/callback?state=s1&error=access_denied')
        .set('Cookie', `${GOOGLE_COOKIE}=${pendingCookie()}`)
        .expect(302)

      expect(res.headers.location).toBe('https://gpx.example.com/login?error=access_denied')
      expect(authService.loginWithGoogle).not.toHaveBeenCalled()
    })

    it('rejects a callback without code', async () => {
      authService.verifyState.mockReturnValue(true)

      await request(app.getHttpServer())
        .get('/auth/google/callback?state=s1')
        .set('Cookie', `${GOOGLE_COOKIE}=${pendingCookie()}`)
        .expect(400)
    })

    it('answers 401 when Google rejects the code or the ID token', async () => {
      authService.verifyState.mockReturnValue(true)
      authService.loginWithGoogle.mockRejectedValue(new UnauthorizedException('Invalid ID token'))

      const res = await request(app.getHttpServer())
        .get('/auth/google/callback?code=bad&state=s1')
        .set('Cookie', `${GOOGLE_COOKIE}=${pendingCookie()}`)
        .expect(401)

      expect(res.body.error).toBe('Invalid ID token')
    })

    it('answers 500 for unexpected errors', async () => {
      authService.verifyState.mockReturnValue(true)
      authService.loginWithGoogle.mockRejectedValue(new Error('db down'))

      await request(app.getHttpServer())
        .get('/auth/google/callback?code=c1&state=s1')
        .set('Cookie', `${GOOGLE_COOKIE}=${pendingCookie()}`)
        .expect(500)
    })
  })

  describe('GET /auth/status', () => {
    it('is unauthenticated without token', async () => {
      const res = await request(app.getHttpServer()).get('/auth/status').expect(200)

      expect(res.body).toEqual({ authenticated: false })
    })

    it('is unauthenticated with an invalid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/status')
        .set('Authorization', 'Bearer not-a-jwt')
        .expect(200)

      expect(res.body).toEqual({ authenticated: false })
    })

    it('is unauthenticated with an expired token', async () => {
      const token = jwt.sign({ sub: 'user-1' }, { expiresIn: -10 })

      const res = await request(app.getHttpServer())
        .get('/auth/status')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(res.body).toEqual({ authenticated: false })
    })

    it('is unauthenticated when the user of a valid token no longer exists', async () => {
      prisma.user.findUnique.mockResolvedValue(null)

      const res = await request(app.getHttpServer())
        .get('/auth/status')
        .set('Authorization', bearer('gone'))
        .expect(200)

      expect(res.body).toEqual({ authenticated: false })
    })

    it('returns the user', async () => {
      const user = { id: 'user-1', name: 'Test', email: 'test@example.com', avatarUrl: null }
      prisma.user.findUnique.mockResolvedValue(user)

      const res = await request(app.getHttpServer()).get('/auth/status').set('Authorization', bearer()).expect(200)

      expect(res.body).toEqual({ authenticated: true, user })
      expect(prisma.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'user-1' } }))
    })
  })
})
