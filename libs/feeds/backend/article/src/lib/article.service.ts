import { Injectable, Logger } from '@nestjs/common'
import { Item } from 'rss-parser'

import { Feed, PrismaService } from '@plusone/feeds/backend/persistence'

@Injectable()
export class ArticleService {
  private logger = new Logger(ArticleService.name)

  constructor(private prismaService: PrismaService) {}

  async create(article: Item, feed: Feed) {
    if (!article.guid || typeof article.guid !== 'string') {
      this.logger.warn(`Could not store article for ${feed.title} as guid is not a string`)
      return
    }

    if (
      await this.prismaService.article.findUnique({ where: { guid_feedId: { guid: article.guid, feedId: feed.id } } })
    ) {
      return
    }

    return this.prismaService.article.create({
      data: {
        content: article.content,
        contentBody: article['content:encoded'],
        feed: { connect: { id: feed.id } },
        guid: article.guid,
        link: article.link,
        title: article.title,
      },
    })
  }
}
