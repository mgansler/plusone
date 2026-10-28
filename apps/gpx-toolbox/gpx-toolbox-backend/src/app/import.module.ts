import { Module } from '@nestjs/common'
import { JwtModule, JwtSignOptions } from '@nestjs/jwt'

import { PrismaModule } from '@plusone/gpx-toolbox-persistence'

import { ImportController } from './import.controller'
import { ImportService } from './import.service'
import { StravaService } from './strava.service'
import { AuthModule } from './auth.module'

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'change-me-in-production',
      signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as JwtSignOptions['expiresIn'] },
    }),
  ],
  controllers: [ImportController],
  providers: [ImportService, StravaService],
  exports: [ImportService],
})
export class ImportModule {}
