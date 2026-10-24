import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'

import { PrismaModule } from '@plusone/gpx-toolbox-persistence'

import { ImportController } from './import.controller'
import { ImportService } from './import.service'
import { StravaService } from './strava.service'

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'change-me-in-production',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' } as any,
    }),
  ],
  controllers: [ImportController],
  providers: [ImportService, StravaService],
  exports: [ImportService],
})
export class ImportModule {}
