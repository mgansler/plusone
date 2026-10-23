import { Controller, Get, Post, Query, Req, Res } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { JwtService } from '@nestjs/jwt'
import type { Request, Response } from 'express'

import { AuthService } from './auth.service'
import { StravaService } from './strava.service'
import { PrismaService } from '@plusone/gpx-toolbox-persistence'

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
  @ApiOperation({ operationId: 'stravaAuthUrl' })
  @ApiOkResponse({ description: 'Strava authorization URL' })
  stravaAuth() {
    return this.authService.getAuthorizationUrl()
  }

  @Get('strava/callback')
  @ApiOperation({ operationId: 'stravaCallback' })
  @ApiQuery({ name: 'code', required: false, description: 'Strava authorization code' })
  @ApiQuery({ name: 'state', required: false, description: 'OAuth state parameter' })
  async stravaCallback(@Req() req: Request, @Res() res: Response) {
    const { code, state } = req.query as any

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
      const { access_token, refresh_token } = tokenData

      // Fetch athlete profile
      const profile = await this.stravaService.getAthlete(access_token)

      // Upsert user and issue JWT
      const user = await this.prisma.user.upsert({
        where: { stravaId: String(profile.id) },
        update: {
          accessToken: access_token,
          refreshToken: refresh_token,
          name: profile.firstname ?? profile.lastname ?? profile.name ?? null,
        },
        create: {
          stravaId: String(profile.id),
          accessToken: access_token,
          refreshToken: refresh_token,
          name: profile.firstname ?? profile.lastname ?? profile.name ?? null,
          avatarUrl: profile.profile,
        },
      })

      const payload = { sub: user.id, stravaId: user.stravaId }
      const jwtToken = this.jwtService.sign(payload)

      // Redirect frontend with JWT in URL fragment (SPA-friendly)
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
      res.redirect(`${frontendUrl}#token=${jwtToken}`)
    } catch (error) {
      res.status(500).json({ error: 'Authentication failed' })
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

    const newTokens = await this.authService.refreshToken(user.refreshToken)

    // Update stored tokens
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
      },
    })

    // Issue new JWT
    const jwtPayload = { sub: user.id, stravaId: user.stravaId }
    const newJwt = this.jwtService.sign(jwtPayload)

    return { accessToken: newJwt }
  }
}
