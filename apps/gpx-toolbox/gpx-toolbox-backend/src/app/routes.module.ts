import { Module } from '@nestjs/common'

import { PrismaModule } from '@plusone/gpx-toolbox-persistence'

import { RoutesController } from './routes.controller'
import { RoutesService } from './routes.service'

@Module({
  imports: [PrismaModule],
  controllers: [RoutesController],
  providers: [RoutesService],
  exports: [RoutesService],
})
export class RoutesModule {}
