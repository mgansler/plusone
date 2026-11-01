import { randomBytes, timingSafeEqual } from 'node:crypto'

import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { PrismaService } from '@plusone/gpx-toolbox-persistence'

import { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, stravaBaseUrl } from './config'
import { StravaService } from './strava.service'

/**
 * Refresh a Strava access token this many milliseconds before it expires, so a
 * long-running request never hits an expired token mid-flight.
 */
const REFRESH_BUFFER_MS = 60_000

/** Strava tokens as stored on the user */
type StravaTokens = { accessToken: string; refreshToken: string; expiresAt: Date }

/** Result of a successful login: the local user plus the issued JWT */
type AuthenticatedUser = {
  userId: string
  stravaId: string
  name: string | null
  avatarUrl: string | null
  jwtToken: string
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly stravaService: StravaService,
  ) {}

  /**
   * Get the Strava authorization URL plus the random `state` it contains. The caller has to remember the
   * state (cookie) and compare it in the callback via `verifyState`.
   */
  getAuthorizationUrl(): { authorizationUrl: string; state: string } {
    const state = this.generateState()
    const params = new URLSearchParams({
      client_id: requireEnv(STRAVA_CLIENT_ID),
      redirect_uri: process.env.STRAVA_REDIRECT_URI ?? 'http://localhost:3333/api/auth/strava/callback',
      response_type: 'code',
      scope: 'read_all,activity:read_all,profile:read_all',
      state,
    })
    return { authorizationUrl: `${stravaBaseUrl()}/oauth/authorize?${params.toString()}`, state }
  }

  /**
   * Verify the OAuth state parameter returned by Strava against the one issued in `getAuthorizationUrl`
   * to prevent login CSRF. Both have to be present.
   */
  verifyState(state: string | undefined, expected: string | undefined): boolean {
    if (!state || !expected) return false
    const a = Buffer.from(state)
    const b = Buffer.from(expected)
    return a.length === b.length && timingSafeEqual(a, b)
  }

  /**
   * Exchange the authorization code from the OAuth callback for Strava tokens.
   */
  async exchangeAuthorizationCode(code: string): Promise<StravaTokens> {
    const response = await fetch(`${stravaBaseUrl()}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: requireEnv(STRAVA_CLIENT_ID),
        client_secret: requireEnv(STRAVA_CLIENT_SECRET),
        code,
        grant_type: 'authorization_code',
      }),
    })

    if (!response.ok) {
      this.logger.error(`Code exchange failed: ${response.status} ${response.statusText}`)
      throw new UnauthorizedException('Failed to exchange code for token')
    }

    const data = await response.json()
    this.logger.debug(`Token exchanged, scopes: ${data.scope}`)
    return toStravaTokens(data)
  }

  /**
   * Authenticate a user via the authorization code from the OAuth callback.
   */
  async authenticateWithAuthorizationCode(code: string): Promise<AuthenticatedUser> {
    const tokens = await this.exchangeAuthorizationCode(code)
    return this.loginStravaUser(tokens)
  }

  /**
   * Refresh a Strava access token using the refresh token.
   *
   * Strava's token endpoint also returns `expires_at` (unix seconds); we keep it
   * so we know when the *next* token will expire.
   */
  async refreshToken(refreshToken: string): Promise<StravaTokens> {
    const response = await fetch(`${stravaBaseUrl()}/oauth/token`, {
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
    return toStravaTokens(data)
  }

  /**
   * Authenticate a user by refreshing a Strava refresh token.
   */
  async authenticateWithRefreshToken(refreshToken: string): Promise<AuthenticatedUser> {
    const tokens = await this.refreshToken(refreshToken)
    const result = await this.loginStravaUser(tokens)
    this.logger.log(`Authenticated user ${result.userId} via refresh token`)
    return result
  }

  /**
   * Fetch the athlete profile with fresh tokens, create/update the local user and issue a JWT.
   */
  private async loginStravaUser(tokens: StravaTokens): Promise<AuthenticatedUser> {
    const profile = (await this.stravaService.getAthlete(tokens.accessToken)) as {
      id?: string | number
      firstname?: string
      lastname?: string
      profile?: string
    } | null

    // Without an athlete id we would create a user with stravaId "undefined"
    if (!profile?.id) {
      throw new UnauthorizedException('Could not fetch Strava profile')
    }

    const name = profile.firstname ?? profile.lastname ?? null
    const user = await this.prisma.user.upsert({
      where: { stravaId: String(profile.id) },
      update: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: tokens.expiresAt,
        name,
      },
      create: {
        stravaId: String(profile.id),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: tokens.expiresAt,
        name,
        avatarUrl: profile.profile ?? null,
      },
    })

    const jwtToken = this.jwtService.sign({ sub: user.id, stravaId: user.stravaId })

    return { userId: user.id, stravaId: user.stravaId, name: user.name, avatarUrl: user.avatarUrl, jwtToken }
  }

  /**
   * Refresh the Strava token for a user and persist the new access/refresh
   * tokens and expiry. Returns the fresh tokens.
   */
  async refreshAndPersist(userId: string, refreshToken: string): Promise<StravaTokens> {
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
    return randomBytes(16).toString('hex')
  }
}

/** Map Strava's token response; `expires_at` is in unix seconds, fall back to a 2h window if absent */
function toStravaTokens(data: { access_token: string; refresh_token: string; expires_at?: number }): StravaTokens {
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at ? new Date(data.expires_at * 1000) : new Date(Date.now() + 2 * 60 * 60 * 1000),
  }
}

/** Read a required environment variable; fails loudly instead of sending "undefined" to Strava */
function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing environment variable ${name}`)
  return value
}
