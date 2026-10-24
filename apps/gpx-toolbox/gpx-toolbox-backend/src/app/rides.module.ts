import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'

import { PrismaModule } from '@plusone/gpx-toolbox-persistence'

import { RidesController } from './rides.controller'
import { RidesService } from './rides.service'

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [RidesController],
  providers: [RidesService],
  exports: [RidesService],
})
export class RidesModule {}
