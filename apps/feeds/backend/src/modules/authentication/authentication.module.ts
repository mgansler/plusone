import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { PrismaService } from '@plusone/feeds-persistence'

import { AuthenticationController } from './authentication.controller'
import { AuthenticationService } from './authentication.service'
import { JwtAccessTokenStrategy, JwtRefreshTokenStrategy } from './jwt.strategy'
import { UsernamePasswordStrategy } from './username-password-strategy.service'

@Module({
  imports: [PassportModule, JwtModule.register({})],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    UsernamePasswordStrategy,
    JwtAccessTokenStrategy,
    JwtRefreshTokenStrategy,
    PrismaService,
  ],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
