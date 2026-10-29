import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { PrismaService } from '@plusone/gpx-toolbox-persistence'

import { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET } from './config'
import { StravaService } from './strava.service'

/**
 * Refresh a Strava access token this many milliseconds before it expires, so a
 * long-running request never hits an expired token mid-flight.
 */
const REFRESH_BUFFER_MS = 60_000

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly stravaService: StravaService,
  ) {}

  /**
   * Get the Strava authorization URL for the frontend.
   */
  getAuthorizationUrl(): { authorizationUrl: string } {
    const params = new URLSearchParams({
      client_id: requireEnv(STRAVA_CLIENT_ID),
      redirect_uri: process.env.STRAVA_REDIRECT_URI ?? 'http://localhost:3333/api/auth/strava/callback',
      response_type: 'code',
      scope: 'read_all,activity:read_all,profile:read_all',
      state: this.generateState(),
    })
    return { authorizationUrl: `https://www.strava.com/oauth/authorize?${params.toString()}` }
  }

  /**
   * Verify the OAuth state parameter to prevent CSRF.
   */
  verifyState(_state: string): boolean {
    // For MVP: accept any state. In production, store state in session/cookie and compare.
    return true
  }

  /**
   * Refresh a Strava access token using the refresh token.
   *
   * Strava's token endpoint also returns `expires_at` (unix seconds); we keep it
   * so we know when the *next* token will expire.
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: requireEnv(STRAVA_CLIENT_ID),
        client_secret: requireEnv(STRAVA_CLIENT_SECRET),
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '(could not read response body)')
      this.logger.error(`Token refresh failed: ${response.status} ${response.statusText} — ${body.slice(0, 200)}`)
      throw new UnauthorizedException('Failed to refresh Strava token')
    }

    const data = await response.json()
    this.logger.debug(`Token refreshed, scopes: ${data.scope}`)
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      // Strava returns expires_at in unix seconds; fall back to a 2h window if absent.
      expiresAt: data.expires_at ? new Date(data.expires_at * 1000) : new Date(Date.now() + 2 * 60 * 60 * 1000),
    }
  }

  /**
   * Authenticate a user by refreshing a Strava refresh token.
   * Exchanges the token, fetches the athlete profile, upserts the user,
   * and returns the JWT payload.
   */
  async authenticateWithRefreshToken(refreshToken: string): Promise<{
    userId: string
    stravaId: string
    name: string | null
    avatarUrl: string | null
    jwtToken: string
  }> {
    const tokens = await this.refreshToken(refreshToken)

    // Fetch athlete profile to create/update the user
    const profile = (await this.stravaService.getAthlete(tokens.accessToken)) as {
      id?: string
      firstname?: string
      lastname?: string
      profile?: string
    }

    if (!profile?.id) {
      throw new UnauthorizedException('Could not fetch Strava profile with provided refresh token')
    }

    const user = await this.prisma.user.upsert({
      where: { stravaId: String(profile.id) },
      update: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: tokens.expiresAt,
        name: profile.firstname ?? profile.lastname ?? null,
      },
      create: {
        stravaId: String(profile.id),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: tokens.expiresAt,
        name: profile.firstname ?? profile.lastname ?? null,
        avatarUrl: profile.profile ?? null,
      },
    })

    const payload = { sub: user.id, stravaId: user.stravaId }
    const jwtToken = this.jwtService.sign(payload)

    this.logger.log(`Authenticated user ${user.id} via refresh token`)

    return { userId: user.id, stravaId: user.stravaId, name: user.name, avatarUrl: user.avatarUrl, jwtToken }
  }

  /**
   * Refresh the Strava token for a user and persist the new access/refresh
   * tokens and expiry. Returns the fresh tokens.
   */
  async refreshAndPersist(
    userId: string,
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
    const tokens = await this.refreshToken(refreshToken)

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: tokens.expiresAt,
      },
    })

    this.logger.log(`Refreshed Strava token for user ${userId}`)
    return tokens
  }

  /**
   * Return a valid Strava access token for the user, refreshing it first when it
   * is missing, unknown, or (almost) expired. This is the single chokepoint every
   * Strava request must go through, so an expired access token is transparently
   * replaced by a fresh one instead of failing the request.
   */
  async getValidAccessToken(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { accessToken: true, refreshToken: true, tokenExpiresAt: true },
    })

    if (!user?.accessToken) {
      throw new UnauthorizedException('No Strava access token')
    }

    const needsRefresh = !user.tokenExpiresAt || Date.now() >= user.tokenExpiresAt.getTime() - REFRESH_BUFFER_MS

    if (needsRefresh && user.refreshToken) {
      const refreshed = await this.refreshAndPersist(userId, user.refreshToken)
      return refreshed.accessToken
    }

    if (needsRefresh && !user.refreshToken) {
      this.logger.warn(`Access token expired for user ${userId} but no refresh token is available`)
    }

    return user.accessToken
  }

  /**
   * Generate a random state string for CSRF protection.
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2)
  }
}

/** Read a required environment variable; fails loudly instead of sending "undefined" to Strava */
function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing environment variable ${name}`)
  return value
}
