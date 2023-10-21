import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'

import { PrismaModule } from '@plusone/elgato-persistence'

import { LocationController } from './location.controller'
import { LocationService } from './location.service'

@Module({
  controllers: [LocationController],
  imports: [HttpModule, PrismaModule],
  providers: [LocationService],
  exports: [LocationService],
})
export class LocationModule {}
