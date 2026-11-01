import { Controller, Get, Post, Body, Req, Res, UnauthorizedException } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { JwtService } from '@nestjs/jwt'
import { Request, Response } from 'express'
import { IsNotEmpty, IsString } from 'class-validator'

import { PrismaService } from '@plusone/gpx-toolbox-persistence'

import { AuthService } from './auth.service'
import { StravaService } from './strava.service'
import { StravaAthleteProfileDto } from './dto/strava-athlete-profile.dto'
import { JwtPayload } from './jwt.strategy'

const OAUTH_STATE_COOKIE = 'gpx_toolbox_oauth_state'
const OAUTH_STATE_MAX_AGE_MS = 10 * 60 * 1000

/** DTO for manual refresh token authentication. */
class RefreshTokenAuthDto {
  @IsString()
  @IsNotEmpty()
  refresh_token: string
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly stravaService: StravaService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('strava')
  @ApiOperation({ operationId: 'stravaAuthRedirect' })
  @ApiOkResponse({ description: 'Redirects to Strava authorization page' })
  stravaAuth(@Res({ passthrough: true }) res: Response) {
    const { authorizationUrl, state } = this.authService.getAuthorizationUrl()
    // Remembered in the browser so the callback can check that it belongs to a login started here
    res.cookie(OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      sameSite: 'lax',
      secure: (process.env.STRAVA_REDIRECT_URI ?? '').startsWith('https://'),
      maxAge: OAUTH_STATE_MAX_AGE_MS,
    })
    res.redirect(authorizationUrl)
  }

  @Get('strava/callback')
  @ApiOperation({ operationId: 'stravaCallback' })
  @ApiQuery({ name: 'code', required: false, description: 'Strava authorization code' })
  @ApiQuery({ name: 'state', required: false, description: 'OAuth state parameter' })
  async stravaCallback(@Req() req: Request, @Res() res: Response) {
    const { code, state } = req.query as { code?: string; state?: string }

    const expectedState = readCookie(req.headers.cookie, OAUTH_STATE_COOKIE)
    res.clearCookie(OAUTH_STATE_COOKIE)

    if (!this.authService.verifyState(state, expectedState)) {
      return res.status(401).json({ error: 'Invalid state parameter' })
    }

    if (!code) {
      return res.status(400).json({ error: 'Missing authorization code' })
    }

    try {
      const { jwtToken } = await this.authService.authenticateWithAuthorizationCode(code)

      // Redirect frontend with JWT in URL fragment (SPA-friendly)
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4250'
      res.redirect(`${frontendUrl}#token=${jwtToken}`)
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return res.status(401).json({ error: error.message })
      }
      res.status(500).json({ error: 'Authentication failed' })
    }
  }

  @Get('athlete')
  @ApiOperation({ operationId: 'stravaAthlete' })
  @ApiOkResponse({ type: StravaAthleteProfileDto, description: 'Strava athlete profile with local stats' })
  async getStravaAthlete(@Req() req: Request) {
    const payload = this.verifyBearer(req)
    const accessToken = await this.authService.getValidAccessToken(payload.sub)

    const athlete = (await this.stravaService.getAthlete(accessToken)) as {
      id?: string
      username?: string | null
      firstname?: string
      lastname?: string
      profile?: string
      profile_medium?: string
      city?: string
      state?: string
      country?: string
      sex?: string
      weight?: number
      premium?: boolean
      summit?: boolean
      created_at?: string
      updated_at?: string
      follower_count?: number
      friend_count?: number
      measurement_preference?: string
      ftp?: number
      clubs?: unknown
      bikes?: unknown
      shoes?: unknown
    }

    // Aggregate local stats from database
    const [routeCount, rideCount, routesWithPolyline] = await Promise.all([
      this.prisma.route.count({ where: { userId: payload.sub } }),
      this.prisma.activity.count({ where: { userId: payload.sub } }),
      this.prisma.route.findMany({
        where: { userId: payload.sub },
        select: { stats: true },
      }),
    ])

    const totalDistance = routesWithPolyline.reduce((sum, r) => {
      const stats = r.stats as { distance?: number } | null
      return sum + (stats?.distance ?? 0)
    }, 0)

    const totalElevation = routesWithPolyline.reduce((sum, r) => {
      const stats = r.stats as { elevationGain?: number } | null
      return sum + (stats?.elevationGain ?? 0)
    }, 0)

    return {
      id: athlete.id,
      username: athlete.username ?? undefined,
      firstname: athlete.firstname,
      lastname: athlete.lastname,
      profile: athlete.profile,
      profile_medium: athlete.profile_medium,
      city: athlete.city,
      state: athlete.state,
      country: athlete.country,
      gender: athlete.sex,
      weight: athlete.weight,
      premium: athlete.premium,
      summit: athlete.summit,
      created_at: athlete.created_at,
      updated_at: athlete.updated_at,
      follower_count: athlete.follower_count,
      friend_count: athlete.friend_count,
      measurement_preference: athlete.measurement_preference,
      ftp: athlete.ftp,
      clubs: athlete.clubs,
      bikes: athlete.bikes,
      shoes: athlete.shoes,
      // Local database stats (fallback when Strava Premium stats are unavailable)
      localStats: {
        routeCount,
        rideCount,
        totalDistanceM: totalDistance,
        totalElevationM: totalElevation,
      },
    }
  }

  @Get('status')
  @ApiOperation({ operationId: 'authStatus' })
  @ApiOkResponse({ description: 'Authentication status' })
  async authStatus(@Req() req: Request) {
    try {
      const payload = this.verifyBearer(req)
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, stravaId: true, name: true, avatarUrl: true },
      })

      // A valid JWT of a deleted user is not a valid login
      return user ? { authenticated: true, user } : { authenticated: false }
    } catch {
      return { authenticated: false }
    }
  }

  @Post('refresh')
  @ApiOperation({ operationId: 'refreshStravaToken' })
  @ApiOkResponse({ description: 'Token refreshed successfully' })
  async refreshStravaToken(@Req() req: Request) {
    const payload = this.verifyBearer(req)
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    })

    if (!user?.refreshToken) {
      throw new UnauthorizedException('No refresh token available')
    }

    // Refresh the Strava token and persist the new access/refresh tokens + expiry.
    await this.authService.refreshAndPersist(user.id, user.refreshToken)

    // Issue new JWT
    const jwtPayload = { sub: user.id, stravaId: user.stravaId }
    const newJwt = this.jwtService.sign(jwtPayload)

    return { accessToken: newJwt }
  }

  @Post('refresh-token')
  @ApiOperation({ operationId: 'authenticateWithRefreshToken' })
  @ApiOkResponse({ description: 'Authenticated successfully, returns JWT token' })
  async authenticateWithRefreshToken(@Body() body: RefreshTokenAuthDto) {
    const result = await this.authService.authenticateWithRefreshToken(body.refresh_token)
    return { accessToken: result.jwtToken }
  }

  /** Verify the JWT from the Authorization header; an invalid or missing token is a 401, not a 500 */
  private verifyBearer(req: Request): JwtPayload {
    const token = req.headers['authorization']?.replace('Bearer ', '')
    if (!token) throw new UnauthorizedException('No access token provided')

    try {
      return this.jwtService.verify<JwtPayload>(token)
    } catch {
      throw new UnauthorizedException('Invalid access token')
    }
  }
}

/** Read a single cookie from the raw Cookie header */
function readCookie(header: string | undefined, name: string): string | undefined {
  for (const part of header?.split(';') ?? []) {
    const [key, ...value] = part.trim().split('=')
    if (key === name) return decodeURIComponent(value.join('='))
  }
  return undefined
}
