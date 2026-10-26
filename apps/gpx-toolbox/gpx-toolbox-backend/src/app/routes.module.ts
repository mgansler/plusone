import { Module } from '@nestjs/common'

import { PrismaModule } from '@plusone/gpx-toolbox-persistence'

import { RoutesController } from './routes.controller'
import { RoutesService } from './routes.service'
import { StravaService } from './strava.service'

@Module({
  imports: [PrismaModule],
  controllers: [RoutesController],
  providers: [RoutesService, StravaService],
  exports: [RoutesService],
})
export class RoutesModule {}
