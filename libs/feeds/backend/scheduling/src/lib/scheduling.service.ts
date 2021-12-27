import { Inject, Injectable, Logger } from '@nestjs/common'
import type { ClientProxy } from '@nestjs/microservices'
import { Cron, CronExpression } from '@nestjs/schedule'
import type { Item } from 'rss-parser'

import type { FeedService } from '@plusone/feeds/backend/feed'
import type { ArticleService } from '@plusone/feeds/backend/article'
import type { Feed } from '@plusone/feeds/backend/persistence'
import { Prisma } from '@plusone/feeds/backend/persistence'
import { SystemUser } from '@plusone/feeds/backend/authentication'
import { FETCH_MESSAGE_PATTERN, FETCH_SERVICE } from '@plusone/feeds/shared/constants'
import type { UpdateFeedRequest, UpdateFeedResponse } from '@plusone/feeds/shared/types'

@Injectable()
export class SchedulingService {
  private logger = new Logger(SchedulingService.name)

  constructor(
    @Inject(FETCH_SERVICE) private fetchClient: ClientProxy,
    private readonly feedService: FeedService,
    private readonly articleService: ArticleService,
  ) {}

  async onApplicationBootstrap() {
    // https://github.com/nestjs/nest/issues/7972
    // https://github.com/jwalton/node-amqp-connection-manager/issues/172
    await this.fetchClient.connect()
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  handleCron() {
    this.feedService.findAllFor(SystemUser).then((feeds) => {
      feeds.forEach((feed) => {
        this.logger.log(`Requesting update of ${feed.originalTitle}`)
        this.fetchClient
          .send<UpdateFeedResponse, UpdateFeedRequest>(FETCH_MESSAGE_PATTERN, feed.feedUrl)
          .toPromise()
          .then((articles) => this.saveNewArticles(articles, feed))
          .catch(() =>
            this.logger.error(`Failed to fetch or store articles for ${feed.originalTitle} (${feed.feedUrl})`),
          )
      })
    })
  }

  private async saveNewArticles(articles: Item[], feed: Feed): Promise<number> {
    let newArticleCount = 0
    for (const article of articles.reverse()) {
      try {
        // TODO: create many?
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
    this.logger.log(`Got ${newArticleCount} new articles for ${feed.originalTitle}`)
    return newArticleCount
  }
}
