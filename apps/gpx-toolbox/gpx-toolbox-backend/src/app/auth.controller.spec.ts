import { INestApplication, UnauthorizedException, ValidationPipe } from '@nestjs/common'
import { JwtModule, JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import { PrismaService } from '@plusone/gpx-toolbox-persistence'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { StravaService } from './strava.service'

const STATE_COOKIE = 'gpx_toolbox_oauth_state'

/** HTTP-level tests of the OAuth flow and the token endpoints */
describe('AuthController', () => {
  let app: INestApplication
  let jwt: JwtService

  const authService = {
    getAuthorizationUrl: vi.fn(),
    verifyState: vi.fn(),
    authenticateWithAuthorizationCode: vi.fn(),
    authenticateWithRefreshToken: vi.fn(),
    refreshAndPersist: vi.fn(),
    getValidAccessToken: vi.fn(),
  }
  const stravaService = { getAthlete: vi.fn() }
  const prisma = {
    user: { findUnique: vi.fn() },
    route: { count: vi.fn(), findMany: vi.fn() },
    activity: { count: vi.fn() },
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'test-secret' })],
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: StravaService, useValue: stravaService },
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

  describe('GET /auth/strava', () => {
    it('remembers the state in an http-only cookie and redirects to Strava', async () => {
      authService.getAuthorizationUrl.mockReturnValue({
        authorizationUrl: 'https://www.strava.com/oauth/authorize?state=s1',
        state: 's1',
      })

      const res = await request(app.getHttpServer()).get('/auth/strava').expect(302)

      expect(res.headers.location).toBe('https://www.strava.com/oauth/authorize?state=s1')
      const cookie = String(res.headers['set-cookie'])
      expect(cookie).toContain(`${STATE_COOKIE}=s1`)
      expect(cookie).toContain('HttpOnly')
      expect(cookie).toContain('SameSite=Lax')
    })
  })

  describe('GET /auth/strava/callback', () => {
    it('logs in and redirects to the frontend with the JWT in the fragment', async () => {
      authService.verifyState.mockReturnValue(true)
      authService.authenticateWithAuthorizationCode.mockResolvedValue({ jwtToken: 'jwt-1' })

      const res = await request(app.getHttpServer())
        .get('/auth/strava/callback?code=c1&state=s1')
        .set('Cookie', `other=x; ${STATE_COOKIE}=s1`)
        .expect(302)

      expect(authService.verifyState).toHaveBeenCalledWith('s1', 's1')
      expect(authService.authenticateWithAuthorizationCode).toHaveBeenCalledWith('c1')
      expect(res.headers.location).toBe('https://gpx.example.com#token=jwt-1')
      // The state is single use
      expect(String(res.headers['set-cookie'])).toMatch(new RegExp(`${STATE_COOKIE}=;.*Expires=Thu, 01 Jan 1970`))
    })

    it('rejects a state that does not match the cookie', async () => {
      authService.verifyState.mockReturnValue(false)

      await request(app.getHttpServer()).get('/auth/strava/callback?code=c1&state=forged').expect(401)

      expect(authService.verifyState).toHaveBeenCalledWith('forged', undefined)
      expect(authService.authenticateWithAuthorizationCode).not.toHaveBeenCalled()
    })

    it('rejects a callback without code (e.g. the user denied access)', async () => {
      authService.verifyState.mockReturnValue(true)

      await request(app.getHttpServer())
        .get('/auth/strava/callback?state=s1&error=access_denied')
        .set('Cookie', `${STATE_COOKIE}=s1`)
        .expect(400)

      expect(authService.authenticateWithAuthorizationCode).not.toHaveBeenCalled()
    })

    it('answers 401 when Strava rejects the code', async () => {
      authService.verifyState.mockReturnValue(true)
      authService.authenticateWithAuthorizationCode.mockRejectedValue(
        new UnauthorizedException('Failed to exchange code for token'),
      )

      const res = await request(app.getHttpServer())
        .get('/auth/strava/callback?code=bad&state=s1')
        .set('Cookie', `${STATE_COOKIE}=s1`)
        .expect(401)

      expect(res.body.error).toBe('Failed to exchange code for token')
    })

    it('answers 500 for unexpected errors', async () => {
      authService.verifyState.mockReturnValue(true)
      authService.authenticateWithAuthorizationCode.mockRejectedValue(new Error('db down'))

      await request(app.getHttpServer())
        .get('/auth/strava/callback?code=c1&state=s1')
        .set('Cookie', `${STATE_COOKIE}=s1`)
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
      const token = jwt.sign({ sub: 'user-1', stravaId: '1' }, { expiresIn: -10 })

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
        .set('Authorization', `Bearer ${jwt.sign({ sub: 'gone', stravaId: '1' })}`)
        .expect(200)

      expect(res.body).toEqual({ authenticated: false })
    })

    it('returns the user for a valid token', async () => {
      const user = { id: 'user-1', stravaId: '1', name: 'Test', avatarUrl: null }
      prisma.user.findUnique.mockResolvedValue(user)

      const res = await request(app.getHttpServer())
        .get('/auth/status')
        .set('Authorization', `Bearer ${jwt.sign({ sub: 'user-1', stravaId: '1' })}`)
        .expect(200)

      expect(res.body).toEqual({ authenticated: true, user })
      expect(prisma.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'user-1' } }))
    })
  })

  describe('POST /auth/refresh', () => {
    it('answers 401 without token', async () => {
      await request(app.getHttpServer()).post('/auth/refresh').expect(401)
    })

    it('answers 401 for an invalid token', async () => {
      await request(app.getHttpServer()).post('/auth/refresh').set('Authorization', 'Bearer garbage').expect(401)
    })

    it('answers 401 when no Strava refresh token is stored', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', stravaId: '1', refreshToken: null })

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${jwt.sign({ sub: 'user-1', stravaId: '1' })}`)
        .expect(401)
    })

    it('refreshes the Strava token and issues a new JWT', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', stravaId: '1', refreshToken: 'r1' })

      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${jwt.sign({ sub: 'user-1', stravaId: '1' })}`)
        .expect(201)

      expect(authService.refreshAndPersist).toHaveBeenCalledWith('user-1', 'r1')
      expect(jwt.verify(res.body.accessToken)).toMatchObject({ sub: 'user-1', stravaId: '1' })
    })
  })

  describe('GET /auth/athlete', () => {
    it('answers 401 for an invalid token', async () => {
      await request(app.getHttpServer()).get('/auth/athlete').set('Authorization', 'Bearer garbage').expect(401)

      expect(authService.getValidAccessToken).not.toHaveBeenCalled()
    })

    it('combines the Strava profile with local stats', async () => {
      authService.getValidAccessToken.mockResolvedValue('access')
      stravaService.getAthlete.mockResolvedValue({ id: 1, firstname: 'Test', sex: 'M' })
      prisma.route.count.mockResolvedValue(2)
      prisma.activity.count.mockResolvedValue(3)
      prisma.route.findMany.mockResolvedValue([
        { stats: { distance: 1000, elevationGain: 10 } },
        { stats: { distance: 500 } },
        { stats: null },
      ])

      const res = await request(app.getHttpServer())
        .get('/auth/athlete')
        .set('Authorization', `Bearer ${jwt.sign({ sub: 'user-1', stravaId: '1' })}`)
        .expect(200)

      expect(res.body).toMatchObject({
        id: 1,
        firstname: 'Test',
        gender: 'M',
        localStats: { routeCount: 2, rideCount: 3, totalDistanceM: 1500, totalElevationM: 10 },
      })
    })
  })

  describe('POST /auth/refresh-token', () => {
    it('logs in with a Strava refresh token', async () => {
      authService.authenticateWithRefreshToken.mockResolvedValue({ jwtToken: 'jwt-1' })

      const res = await request(app.getHttpServer())
        .post('/auth/refresh-token')
        .send({ refresh_token: 'r1' })
        .expect(201)

      expect(res.body).toEqual({ accessToken: 'jwt-1' })
    })

    it('rejects a request without refresh token', async () => {
      await request(app.getHttpServer()).post('/auth/refresh-token').send({}).expect(400)

      expect(authService.authenticateWithRefreshToken).not.toHaveBeenCalled()
    })
  })
})
