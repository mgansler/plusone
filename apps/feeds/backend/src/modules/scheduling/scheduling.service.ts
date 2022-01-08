import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Item } from 'rss-parser'

import { Feed, Prisma } from '@plusone/feeds-persistence'

import { ArticleService } from '../article/article.service'
import { SystemUser } from '../authentication/system-user'
import { FeedService } from '../feed/feed.service'
import { FetchService } from '../fetch/fetch.service'

@Injectable()
export class SchedulingService {
  private logger = new Logger(SchedulingService.name)

  constructor(
    private readonly feedService: FeedService,
    private readonly articleService: ArticleService,
    private readonly fetchService: FetchService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  handleCron() {
    this.feedService.findAllFor(SystemUser).then((feeds) => {
      feeds.forEach((feed) => {
        this.logger.log(`Requesting update of ${feed.originalTitle}`)
        this.fetchService
          .fetchFeedArticles(feed.feedUrl)
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
    this.logger.log(`Saved ${newArticleCount} new articles for ${feed.originalTitle}`)
    return newArticleCount
  }
}
