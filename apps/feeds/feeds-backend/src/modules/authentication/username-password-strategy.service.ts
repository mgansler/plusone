import { Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthGuard, PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'

import { User } from '@plusone/feeds-persistence'

import { AuthenticationService } from './authentication.service'

@Injectable()
export class UsernamePasswordStrategy extends PassportStrategy(Strategy, 'username-password') {
  constructor(private authenticationService: AuthenticationService) {
    super()
  }

  async validate(username: string, password: string): Promise<Omit<User, 'password'>> {
    const user = await this.authenticationService.validateUsernamePassword(username, password)
    if (!user) {
      throw new UnauthorizedException()
    }
    return user
  }
}

@Injectable()
export class LocalAuthGuard extends AuthGuard('username-password') {}
