import { Controller, Logger } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'

import { DiscoveryService } from './discovery.service'

@Controller()
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @MessagePattern('website')
  async discoverWebsite(data: { uri: string }): Promise<string> {
    const feedUri = await this.discoveryService.discoverFeedForWebsite(data.uri)
    Logger.log(feedUri)
    return feedUri
  }
}
