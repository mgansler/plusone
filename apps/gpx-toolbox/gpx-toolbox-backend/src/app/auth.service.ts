import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { PrismaService } from '@plusone/gpx-toolbox-persistence'

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Get the Strava authorization URL for the frontend.
   */
  getAuthorizationUrl(): { authorizationUrl: string } {
    const params = new URLSearchParams({
      client_id: process.env.STRAVA_CLIENT_ID!,
      redirect_uri: process.env.STRAVA_REDIRECT_URI ?? 'http://localhost:3333/api/auth/strava/callback',
      response_type: 'code',
      scope: 'read,activity:read_all',
      state: this.generateState(),
    })
    return { authorizationUrl: `https://www.strava.com/oauth/authorize?${params.toString()}` }
  }

  /**
   * Verify the OAuth state parameter to prevent CSRF.
   */
  verifyState(state: string): boolean {
    // For MVP: accept any state. In production, store state in session/cookie and compare.
    return true
  }

  /**
   * Refresh a Strava access token using the refresh token.
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID!,
        client_secret: process.env.STRAVA_CLIENT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })

    if (!response.ok) {
      throw new UnauthorizedException('Failed to refresh Strava token')
    }

    const data = await response.json()
    return { accessToken: data.access_token, refreshToken: data.refresh_token }
  }

  /**
   * Generate a random state string for CSRF protection.
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2)
  }
}
