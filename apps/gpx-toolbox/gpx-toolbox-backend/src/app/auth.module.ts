import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { JwtModule, JwtSignOptions } from '@nestjs/jwt'

import { PrismaModule } from '@plusone/gpx-toolbox-persistence'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { StravaService } from './strava.service'
import { StravaStrategy } from './strava.strategy'

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'change-me-in-production',
      signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as JwtSignOptions['expiresIn'] },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, StravaService, StravaStrategy],
  exports: [AuthService, StravaService],
})
export class AuthModule {}
