import { Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'

import { FeedUri } from '@feeds/types'

import { DiscoverService } from './discover.service'

@Controller()
export class DiscoverController {
  constructor(private readonly discoverService: DiscoverService) {}

  @MessagePattern('website')
  async discoverWebsite(data: { uri: string }): Promise<FeedUri> {
    return this.discoverService.discoverFeedForWebsite(data.uri)
  }
}
