import { HttpException, Inject, Injectable, Logger } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
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

  async addWebsite({ uri }: AddWebsiteDto) {
    const discoveredFeed = await this.discoverClient
      .send<DiscoverFeedResponse, DiscoverFeedRequest>(DISCOVER_MESSAGE_PATTERN, uri)
      .toPromise()
    if (discoveredFeed) {
      await this.feedService.create({ title: discoveredFeed.title, feedUrl: discoveredFeed.feedUrl })
      return { title: discoveredFeed.title, feedUrl: discoveredFeed.feedUrl, description: discoveredFeed.description }
    } else {
      throw new HttpException('No feed found', 404)
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  handleCron() {
    this.feedService.findAll().then((feeds) => {
      feeds.forEach((feed) => {
        this.logger.log(`Requesting update of ${feed.title}`)
        this.fetchClient
          .send<UpdateFeedResponse, UpdateFeedRequest>(FETCH_MESSAGE_PATTERN, feed.feedUrl)
          .toPromise()
          .then((articles) => this.saveNewArticles(articles, feed.title))
          .catch(() => this.logger.error(`Failed to fetch articles for ${feed.title} (${feed.feedUrl})`))
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
