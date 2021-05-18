import { Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'

import { DiscoverFeedRequest, DiscoverFeedResponse } from './discover.types'
import { DISCOVER_MESSAGE_PATTERN } from './discover.constants'
import { DiscoverService } from './discover.service'

@Controller()
export class DiscoverController {
  constructor(private readonly discoverService: DiscoverService) {}

  @MessagePattern(DISCOVER_MESSAGE_PATTERN)
  async discoverWebsite(data: DiscoverFeedRequest): Promise<DiscoverFeedResponse> {
    return this.discoverService.discoverFeedForWebsite(data)
  }
}
