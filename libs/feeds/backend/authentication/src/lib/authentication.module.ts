import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'

import { PrismaService } from '@plusone/feeds/backend/persistence'

import { AuthenticationController } from './authentication.controller'
import { AuthenticationService } from './authentication.service'
import { JwtStrategy } from './jwt.strategy'
import { LocalStrategy } from './local.strategy'
import { jwtConstants } from './authentication.constants'

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '3600s' },
    }),
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, LocalStrategy, JwtStrategy, PrismaService],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
