import { Controller, Logger } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'

import { UpdateFeedRequest } from '@feeds/types'

import { FETCH_MESSAGE_PATTERN } from './fetch.constants'
import { FetchService } from './fetch.service'

@Controller()
export class FetchController {
  private logger = new Logger(FetchController.name)

  constructor(private readonly fetchService: FetchService) {}

  @MessagePattern(FETCH_MESSAGE_PATTERN)
  async fetchFeed(data: UpdateFeedRequest) {
    return this.fetchService.fetchFeedArticles(data)
  }
}
