import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { PrismaModule } from '@plusone/feeds-persistence'

import { UserService } from '../user/user.service'

import { AuthenticationController } from './authentication.controller'
import { AuthenticationService } from './authentication.service'
import { JwtAccessTokenStrategy, JwtRefreshTokenStrategy } from './jwt.strategy'
import { UsernamePasswordStrategy } from './username-password-strategy.service'

@Module({
  imports: [PassportModule, JwtModule.register({}), PrismaModule],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    UsernamePasswordStrategy,
    JwtAccessTokenStrategy,
    JwtRefreshTokenStrategy,
    UserService,
  ],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
