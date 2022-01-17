import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'

import { DiscoverService } from './discover.service'

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [DiscoverService],
  exports: [DiscoverService],
})
export class DiscoverModule {}
