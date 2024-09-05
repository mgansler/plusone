import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Item } from 'rss-parser'
import { ZodError } from 'zod'

import { Feed, Prisma } from '@plusone/feeds-persistence'

import { ArticleService } from '../article/article.service'
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
  async handleCron() {
    this.logger.log('Fetching new articles...')
    let totalSavedArticles = 0
    const feeds = await this.feedService.findAll()
    for (const feed of feeds) {
      const items = await this.fetchService.fetchFeedItems(feed.feedUrl)
      totalSavedArticles += await this.saveNewArticles(items, feed)
    }

    this.logger.log(`Saved/updated ${totalSavedArticles} articles.`)
  }

  private async saveNewArticles(items: Array<Item>, feed: Feed): Promise<number> {
    let savedArticles = 0
    for (const item of items.reverse()) {
      try {
        await this.articleService.create(item, feed)
        savedArticles++
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          this.logger.warn(`Failed to save article for '${feed.originalTitle}': ${error.code}\n ${error.message}`)
        } else if (error instanceof ZodError) {
          const paths = error.issues.map((e) => e.path)
          this.logger.warn(
            `Failed to parse item for feed: ${feed.feedUrl} into an article. There is something wrong with the properties '${paths.join(', ')}', available properties are '${Object.keys(item).join(', ')}'.`,
          )
        } else {
          this.logger.error(`Failed to save article for '${feed.originalTitle}', unknown error`, error)
        }
      }
    }
    return savedArticles
  }
}
