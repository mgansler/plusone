import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'

import { RidesController } from './rides.controller'
import { RidesService } from './rides.service'
import { PrismaModule } from '@plusone/gpx-toolbox-persistence'

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [RidesController],
  providers: [RidesService],
  exports: [RidesService],
})
export class RidesModule {}
