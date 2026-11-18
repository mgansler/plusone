import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'

import { BRouterController } from './brouter.controller'
import { BRouterService } from './brouter.service'

@Module({
  imports: [HttpModule],
  controllers: [BRouterController],
  providers: [BRouterService],
  exports: [BRouterService],
})
export class BRouterModule {}
