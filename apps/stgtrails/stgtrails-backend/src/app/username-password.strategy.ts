import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthGuard, PassportStrategy } from '@nestjs/passport'
import { BasicStrategy } from 'passport-http'
import { v4 } from 'uuid'

import { ADMIN_PASSWORD, ADMIN_USERNAME, ValidatedConfig } from './config'

@Injectable()
export class UsernamePasswordStrategy extends PassportStrategy(BasicStrategy) implements OnModuleInit {
  constructor(private readonly appConfig: ConfigService<ValidatedConfig, true>) {
    super()
  }

  onModuleInit() {
    if (this.appConfig.get(ADMIN_PASSWORD) === undefined) {
      const generatedPassword = v4()
      this.appConfig.set(ADMIN_PASSWORD, generatedPassword)
      console.info(
        `Using a generated password for admin user ['${this.appConfig.get(ADMIN_USERNAME)}': '${generatedPassword}']`,
      )
    } else {
      console.info(`Using provided password for admin user ['${this.appConfig.get(ADMIN_USERNAME)}': '***']`)
    }
  }

  async validate(username: string, password: string) {
    if (username === this.appConfig.get(ADMIN_USERNAME) && password === this.appConfig.get(ADMIN_PASSWORD)) {
      return { username }
    }

    throw new UnauthorizedException()
  }
}

@Injectable()
export class AdminAuthGuard extends AuthGuard('basic') {}
