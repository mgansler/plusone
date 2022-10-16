import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { PrismaService } from '@plusone/feeds-persistence'

import { AuthenticationController } from './authentication.controller'
import { AuthenticationService } from './authentication.service'
import { JwtRefreshStrategy, JwtStrategy } from './jwt.strategy'
import { LocalStrategy } from './local.strategy'

@Module({
  imports: [PassportModule, JwtModule.register({})],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    LocalStrategy, // For login via username/password
    JwtStrategy, // For normale requests
    JwtRefreshStrategy, // For refreshing an expired access token
    PrismaService,
  ],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
