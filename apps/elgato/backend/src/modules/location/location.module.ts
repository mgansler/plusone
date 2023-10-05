import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'

import { PrismaService } from '@plusone/elgato-persistence'

import { LocationController } from './location.controller'
import { LocationService } from './location.service'

@Module({
  controllers: [LocationController],
  imports: [HttpModule],
  providers: [LocationService, PrismaService],
})
export class LocationModule {}
