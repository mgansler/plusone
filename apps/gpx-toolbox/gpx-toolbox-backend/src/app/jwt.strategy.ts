import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

/**
 * JWT payload extracted from the authorization header.
 */
export type JwtPayload = {
  sub: string // user id
  stravaId: string // Strava external id
}

/**
 * Extended request with the verified JWT payload attached.
 */
export type AuthenticatedRequest = {
  user: JwtPayload
} & Express.Request

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'change-me-in-production',
    })
  }

  /**
   * Validate the JWT payload — called after decoding.
   * Returning null/undefined rejects the request.
   */
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    if (!payload.sub) {
      throw new Error('Invalid JWT payload')
    }
    return payload
  }
}
