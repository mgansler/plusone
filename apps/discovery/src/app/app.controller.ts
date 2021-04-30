import { Controller, Logger } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'

@Controller()
export class AppController {
  @MessagePattern('website')
  discoverWebsite(data: { uri: string }): string {
    Logger.log(data)
    return 'Got ya!'
  }
}
