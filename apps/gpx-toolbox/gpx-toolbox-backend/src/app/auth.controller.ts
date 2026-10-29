import { Controller, Get, Post, Body, Req, Res, UnauthorizedException } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { JwtService } from '@nestjs/jwt'
import { Request, Response } from 'express'

import { PrismaService } from '@plusone/gpx-toolbox-persistence'

import { AuthService } from './auth.service'
import { StravaService } from './strava.service'
import { StravaAthleteProfileDto } from './dto/strava-athlete-profile.dto'

/** DTO for manual refresh token authentication. */
class RefreshTokenAuthDto {
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
    const { authorizationUrl } = this.authService.getAuthorizationUrl()
    res.redirect(authorizationUrl)
  }

  @Get('strava/callback')
  @ApiOperation({ operationId: 'stravaCallback' })
  @ApiQuery({ name: 'code', required: false, description: 'Strava authorization code' })
  @ApiQuery({ name: 'state', required: false, description: 'OAuth state parameter' })
  async stravaCallback(@Req() req: Request, @Res() res: Response) {
    const { code, state } = req.query as { code?: string; state?: string }

    // Verify state if present
    if (state && !this.authService.verifyState(state)) {
      return res.status(401).json({ error: 'Invalid state parameter' })
    }

    try {
      // Exchange code for tokens
      const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: process.env.STRAVA_CLIENT_ID,
          client_secret: process.env.STRAVA_CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
        }),
      })

      if (!tokenResponse.ok) {
        return res.status(401).json({ error: 'Failed to exchange code for token' })
      }

      const tokenData = await tokenResponse.json()
      const { access_token, refresh_token, expires_at, scope } = tokenData
      console.log('[OAuth] Token exchanged, scopes:', scope)
      // Strava returns expires_at in unix seconds; fall back to a 2h window if absent.
      const tokenExpiresAt = expires_at ? new Date(expires_at * 1000) : new Date(Date.now() + 2 * 60 * 60 * 1000)

      // Fetch athlete profile
      const profile = (await this.stravaService.getAthlete(access_token)) as {
        id?: string
        firstname?: string
        lastname?: string
        profile?: string
      }

      // Upsert user and issue JWT
      const user = await this.prisma.user.upsert({
        where: { stravaId: String(profile.id) },
        update: {
          accessToken: access_token,
          refreshToken: refresh_token,
          tokenExpiresAt,
          name: profile.firstname ?? profile.lastname ?? null,
        },
        create: {
          stravaId: String(profile.id),
          accessToken: access_token,
          refreshToken: refresh_token,
          tokenExpiresAt,
          name: profile.firstname ?? profile.lastname ?? null,
          avatarUrl: profile.profile,
        },
      })

      const payload = { sub: user.id, stravaId: user.stravaId }
      const jwtToken = this.jwtService.sign(payload)

      // Redirect frontend with JWT in URL fragment (SPA-friendly)
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4250'
      res.redirect(`${frontendUrl}#token=${jwtToken}`)
    } catch {
      res.status(500).json({ error: 'Authentication failed' })
    }
  }

  @Get('athlete')
  @ApiOperation({ operationId: 'stravaAthlete' })
  @ApiOkResponse({ type: StravaAthleteProfileDto, description: 'Strava athlete profile with local stats' })
  async getStravaAthlete(@Req() req: Request) {
    const auth = req.headers['authorization']?.replace('Bearer ', '')
    if (!auth) throw new UnauthorizedException()

    const payload = this.jwtService.verify(auth)
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
      this.prisma.fahrt.count({ where: { userId: payload.sub } }),
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
    const auth = req.headers['authorization']?.replace('Bearer ', '')

    if (!auth) {
      return { authenticated: false }
    }

    try {
      const payload = this.jwtService.verify(auth)
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, stravaId: true, name: true, avatarUrl: true },
      })

      return { authenticated: true, user }
    } catch {
      return { authenticated: false }
    }
  }

  @Post('refresh')
  @ApiOperation({ operationId: 'refreshStravaToken' })
  @ApiOkResponse({ description: 'Token refreshed successfully' })
  async refreshStravaToken(@Req() req: Request) {
    const auth = req.headers['authorization']?.replace('Bearer ', '')

    if (!auth) {
      throw new Error('No access token provided')
    }

    const payload = this.jwtService.verify(auth)
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    })

    if (!user?.refreshToken) {
      throw new Error('No refresh token available')
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
}
