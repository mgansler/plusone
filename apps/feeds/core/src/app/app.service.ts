import { Inject, Injectable, Logger } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Item } from 'rss-parser'

import {
  FETCH_MESSAGE_PATTERN,
  FETCH_SERVICE,
  UpdateFeedRequest,
  UpdateFeedResponse,
} from '@plusone/feeds/backend/fetch'
import { ArticleService } from '@plusone/feeds/backend/article'
import { FeedService } from '@plusone/feeds/backend/feed'
import { Feed } from '@plusone/feeds/backend/persistence'

@Injectable()
export class AppService {
  private logger = new Logger(AppService.name)

  constructor(
    @Inject(FETCH_SERVICE) private fetchClient: ClientProxy,
    private readonly feedService: FeedService,
    private readonly articleService: ArticleService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  handleCron() {
    this.feedService.findAll().then((feeds) => {
      feeds.forEach((feed) => {
        this.logger.log(`Requesting update of ${feed.title}`)
        this.fetchClient
          .send<UpdateFeedResponse, UpdateFeedRequest>(FETCH_MESSAGE_PATTERN, feed.feedUrl)
          .toPromise()
          .then((articles) => this.saveNewArticles(articles, feed))
          .catch(() => this.logger.error(`Failed to fetch articles for ${feed.title} (${feed.feedUrl})`))
      })
    })
  }

  private async saveNewArticles(articles: Item[], feed: Feed): Promise<number> {
    let newArticleCount = 0
    for (const article of articles) {
      if (await this.articleService.create(article, feed)) {
        newArticleCount++
      }
    }
    this.logger.log(`Got ${newArticleCount} new articles for ${feed.title}`)
    return newArticleCount
  }
}
