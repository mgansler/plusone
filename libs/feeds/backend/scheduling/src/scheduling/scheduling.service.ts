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
import { FeedService } from '@plusone/feeds/backend/feed'
import { ArticleService } from '@plusone/feeds/backend/article'
import { Feed, Prisma } from '@plusone/feeds/backend/persistence'

@Injectable()
export class SchedulingService {
  private logger = new Logger(SchedulingService.name)

  constructor(
    @Inject(FETCH_SERVICE) private fetchClient: ClientProxy,
    private readonly feedService: FeedService,
    private readonly articleService: ArticleService,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  handleCron() {
    this.feedService.findAll({ username: 'SYSTEM', isAdmin: true, roles: ['admin'] }).then((feeds) => {
      feeds.forEach((feed) => {
        this.logger.log(`Requesting update of ${feed.title}`)
        this.fetchClient
          .send<UpdateFeedResponse, UpdateFeedRequest>(FETCH_MESSAGE_PATTERN, feed.feedUrl)
          .toPromise()
          .then((articles) => this.saveNewArticles(articles, feed))
          .catch(() => this.logger.error(`Failed to fetch or store articles for ${feed.title} (${feed.feedUrl})`))
      })
    })
  }

  private async saveNewArticles(articles: Item[], feed: Feed): Promise<number> {
    let newArticleCount = 0
    for (const article of articles) {
      try {
        if (await this.articleService.create(article, feed)) {
          newArticleCount++
        }
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          this.logger.error(`Failed to save article: ${e.code}\n ${e.message}`)
        } else {
          this.logger.error('Failed to save article, unknown error', e)
        }
      }
    }
    this.logger.log(`Got ${newArticleCount} new articles for ${feed.title}`)
    return newArticleCount
  }
}
