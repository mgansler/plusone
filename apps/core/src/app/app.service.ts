import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { Observable } from 'rxjs'

import { FeedUri } from '@feeds/types'

@Injectable()
export class AppService {
  constructor(@Inject('DISCOVER_SERVICE') private discoverClient: ClientProxy) {}

  addWebsite({ uri }): Observable<FeedUri> {
    return this.discoverClient.send<FeedUri>('website', { uri })
  }
}
