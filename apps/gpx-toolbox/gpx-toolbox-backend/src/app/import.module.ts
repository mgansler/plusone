import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'

import { ImportController } from './import.controller'
import { ImportService } from './import.service'
import { StravaService } from './strava.service'
import { PrismaModule } from '@plusone/gpx-toolbox-persistence'

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'change-me-in-production',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' },
    }),
  ],
  controllers: [ImportController],
  providers: [ImportService, StravaService],
  exports: [ImportService],
})
export class ImportModule {}
