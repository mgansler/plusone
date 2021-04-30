import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'

@Injectable()
export class AppService {
  constructor(@Inject('DISCOVER_SERVICE') private discoverClient: ClientProxy) {}

  addWebsite({ uri }): { uri: string } {
    this.discoverClient.emit('website', { uri })
    return { uri }
  }
}
