import { Inject, Injectable, Logger } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { Observable } from 'rxjs'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Item } from 'rss-parser'

import { FETCH_MESSAGE_PATTERN, FETCH_SERVICE, UpdateFeedRequest, UpdateFeedResponse } from '@feeds/fetch'
import { DISCOVER_MESSAGE_PATTERN, DISCOVER_SERVICE, DiscoverFeedRequest, DiscoverFeedResponse } from '@feeds/discover'
import { ArticleService } from '@feeds/article'
import { FeedService } from '@feeds/feed'

import { AddWebsiteDto } from '../dto/add-website.dto'

@Injectable()
export class AppService {
  private logger = new Logger(AppService.name)

  constructor(
    @Inject(DISCOVER_SERVICE) private discoverClient: ClientProxy,
    @Inject(FETCH_SERVICE) private fetchClient: ClientProxy,
    private readonly feedService: FeedService,
    private readonly articleService: ArticleService,
  ) {}

  addWebsite({ uri }: AddWebsiteDto): Observable<DiscoverFeedResponse> {
    return this.discoverClient.send<DiscoverFeedResponse, DiscoverFeedRequest>(DISCOVER_MESSAGE_PATTERN, uri)
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  handleCron() {
    this.feedService.findAll().then((feeds) => {
      feeds.forEach((feed) => {
        this.logger.log(`Requesting update of ${feed.title}`)
        this.fetchClient
          .send<UpdateFeedResponse, UpdateFeedRequest>(FETCH_MESSAGE_PATTERN, feed.uri)
          .subscribe((articles) => this.saveNewArticles(articles, feed.title))
      })
    })
  }

  private async saveNewArticles(articles: Item[], title: string): Promise<number> {
    let newArticleCount = 0
    for (const article of articles) {
      if (await this.articleService.create(article)) {
        newArticleCount++
      }
    }
    this.logger.log(`Got ${newArticleCount} new articles for ${title}`)
    return newArticleCount
  }
}
