import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { jwtConstants } from './authentication.constants'
import { JwtPayload } from './jwt.payload'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    })
  }

  validate(payload: JwtPayload): JwtPayload {
    return { username: payload.username, isAdmin: payload.isAdmin, roles: payload.roles, id: payload.id }
  }
}
