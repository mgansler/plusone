import { Module } from '@nestjs/common'

import { PrismaModule } from '@plusone/elgato-persistence'

import { ElgatoModule } from '../elgato/elgato.module'
import { LocationModule } from '../location/location.module'

import { SunriseSunsetService } from './sunrise-sunset.service'

@Module({
  imports: [ElgatoModule, LocationModule, PrismaModule],
  providers: [SunriseSunsetService],
})
export class SunriseSunsetModule {}
