import { Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'

import { FeedUri } from '@feeds/types'

import { DiscoveryService } from './discovery.service'

@Controller()
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @MessagePattern('website')
  async discoverWebsite(data: { uri: string }): Promise<FeedUri> {
    return this.discoveryService.discoverFeedForWebsite(data.uri)
  }
}
