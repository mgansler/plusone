import { Inject, Injectable, Logger } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { Observable } from 'rxjs'
import { Cron, CronExpression } from '@nestjs/schedule'

import { FeedUri } from '@feeds/types'

import { FeedsService } from '../feeds/feeds.service'

@Injectable()
export class AppService {
  private logger = new Logger(AppService.name)

  constructor(
    @Inject('DISCOVER_SERVICE') private discoverClient: ClientProxy,
    @Inject('FETCH_SERVICE') private fetchClient: ClientProxy,
    private readonly feedsService: FeedsService,
  ) {}

  addWebsite({ uri }): Observable<FeedUri> {
    return this.discoverClient.send<FeedUri>('website', { uri })
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  handleCron() {
    this.feedsService.findAll().then((feeds) => {
      feeds.forEach((feed) => {
        this.logger.log(`Requesting update of ${feed.title}`)
        this.fetchClient.emit('update', feed.uri)
      })
    })
  }
}
