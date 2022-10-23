import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthGuard, PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { User } from '@plusone/feeds-persistence'

import { AuthenticationService } from './authentication.service'

export type TokenPayload = {
  id: User['id']
  username: User['username']
  isAdmin: User['isAdmin']
  roles: string[]
}

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(Strategy, 'jwt-access-token') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_ACCESS_TOKEN_SECRET'),
      ignoreExpiration: false,
    })
  }

  validate(payload: TokenPayload): TokenPayload {
    return { username: payload.username, isAdmin: payload.isAdmin, roles: payload.roles, id: payload.id }
  }
}

@Injectable()
export class JwtAccessTokenGuard extends AuthGuard('jwt-access-token') {}

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    })
  }

  async validate(request: Request, payload: { id: string }) {
    const refreshToken = request.headers.authorization.split(' ')[1]
    return this.authenticationService.validateRefreshToken(refreshToken, payload.id)
  }
}

@Injectable()
export class JwtRefreshTokenGuard extends AuthGuard('jwt-refresh-token') {}
