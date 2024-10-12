import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'

import { PrismaModule } from '@plusone/elgato-persistence'
import { SunriseSunsetApiService } from '@plusone/nestjs-services/sunrise-sunset-api'

import { LocationController } from './location.controller'
import { LocationService } from './location.service'

@Module({
  controllers: [LocationController],
  imports: [HttpModule, PrismaModule],
  providers: [LocationService, SunriseSunsetApiService],
  exports: [LocationService],
})
export class LocationModule {}
