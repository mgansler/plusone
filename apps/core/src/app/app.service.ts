import { Inject, Injectable, Logger } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { Observable } from 'rxjs'
import { Cron, CronExpression } from '@nestjs/schedule'

import { DiscoverFeedRequest, DiscoverFeedResponse, UpdateFeedRequest, UpdateFeedResponse } from '@feeds/types'
import { FETCH_MESSAGE_PATTERN, FETCH_SERVICE } from '@feeds/fetch'
import { DISCOVER_MESSAGE_PATTERN, DISCOVER_SERVICE } from '@feeds/discover'

import { FeedsService } from '../feeds/feeds.service'
import { AddWebsiteDto } from '../dto/add-website.dto'

@Injectable()
export class AppService {
  private logger = new Logger(AppService.name)

  constructor(
    @Inject(DISCOVER_SERVICE) private discoverClient: ClientProxy,
    @Inject(FETCH_SERVICE) private fetchClient: ClientProxy,
    private readonly feedsService: FeedsService,
  ) {}

  addWebsite({ uri }: AddWebsiteDto): Observable<DiscoverFeedResponse> {
    return this.discoverClient.send<DiscoverFeedResponse, DiscoverFeedRequest>(DISCOVER_MESSAGE_PATTERN, uri)
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  handleCron() {
    this.feedsService.findAll().then((feeds) => {
      feeds.forEach((feed) => {
        this.logger.log(`Requesting update of ${feed.title}`)
        this.fetchClient
          .send<UpdateFeedResponse, UpdateFeedRequest>(FETCH_MESSAGE_PATTERN, feed.uri)
          .subscribe((items) => {
            this.logger.log(`Got ${items.length} articles for ${feed.title}`)
          })
      })
    })
  }
}
