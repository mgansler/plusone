import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Item } from 'rss-parser'

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

    this.logger.log(`Saved/updated ${totalSavedArticles} articles`)
  }

  private async saveNewArticles(items: Item[], feed: Feed): Promise<number> {
    let savedArticles = 0
    for (const item of items.reverse()) {
      try {
        await this.articleService.create(item, feed)
        savedArticles++
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          this.logger.error(`Failed to save article for '${feed.originalTitle}': ${e.code}\n ${e.message}`)
        } else {
          this.logger.error(`Failed to save article for '${feed.originalTitle}', unknown error`, e)
        }
      }
    }
    return savedArticles
  }
}
