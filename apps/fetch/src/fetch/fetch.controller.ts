import { Controller, Logger } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'

import { FetchService } from './fetch.service'

@Controller()
export class FetchController {
  private logger = new Logger(FetchController.name)

  constructor(private readonly fetchService: FetchService) {}

  @MessagePattern('update')
  async fetchFeed(data: string) {
    this.logger.log(data)
    await this.fetchService.fetch(data)
  }
}
