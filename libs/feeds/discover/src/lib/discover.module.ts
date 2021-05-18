import { HttpModule, Module } from '@nestjs/common'

import { DiscoverController } from './discover.controller'
import { DiscoverService } from './discover.service'

@Module({
  imports: [HttpModule],
  controllers: [DiscoverController],
  providers: [DiscoverService],
})
export class DiscoverModule {}
