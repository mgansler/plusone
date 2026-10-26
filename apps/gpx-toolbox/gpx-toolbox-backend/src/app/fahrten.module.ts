import { Module } from '@nestjs/common'

import { PrismaModule } from '@plusone/gpx-toolbox-persistence'

import { FahrtenController } from './fahrten.controller'
import { FahrtenService } from './fahrten.service'

@Module({
  imports: [PrismaModule],
  controllers: [FahrtenController],
  providers: [FahrtenService],
})
export class FahrtenModule {}
