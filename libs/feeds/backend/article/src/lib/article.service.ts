import { Injectable, Logger } from '@nestjs/common'
import { Item } from 'rss-parser'

import { Feed, PrismaService } from '@plusone/feeds/backend/persistence'

@Injectable()
export class ArticleService {
  private logger = new Logger(ArticleService.name)

  constructor(private prismaService: PrismaService) {}

  async create(article: Item, feed: Feed) {
    if (!article.guid) {
      this.logger.warn(`Could not store article for ${feed.title} as guid is undefined`)
      return
    }

    if (
      await this.prismaService.article.findUnique({ where: { guid_feedId: { guid: article.guid, feedId: feed.id } } })
    ) {
      return
    }

    return this.prismaService.article.create({
      data: {
        ...article,
        guid: article.guid,
        contentBody: article['content:encoded'],
        feed: { connect: feed },
      },
    })
  }
}
