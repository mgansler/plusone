import { Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'

import type { DiscoverFeedRequest, DiscoverFeedResponse } from '@plusone/feeds/shared/types'
import { DISCOVER_MESSAGE_PATTERN } from '@plusone/feeds/shared/constants'

import type { DiscoverService } from './discover.service'

@Controller()
export class DiscoverController {
  constructor(private readonly discoverService: DiscoverService) {}

  @MessagePattern(DISCOVER_MESSAGE_PATTERN)
  async discoverWebsite(data: DiscoverFeedRequest): Promise<DiscoverFeedResponse> {
    return this.discoverService.discoverFeedForWebsite(data)
  }
}
