import { HttpModule, Module } from '@nestjs/common'

import { DiscoveryController } from './discovery.controller'
import { DiscoveryService } from './discovery.service'

@Module({
  imports: [HttpModule],
  controllers: [DiscoveryController],
  providers: [DiscoveryService],
})
export class DiscoveryModule {}
