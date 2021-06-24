import { Injectable, Logger } from '@nestjs/common'
import { Item } from 'rss-parser'

import { Feed, PrismaService } from '@plusone/feeds/backend/persistence'

@Injectable()
export class ArticleService {
  private logger = new Logger(ArticleService.name)

  constructor(private prismaService: PrismaService) {}

  async create(article: Item, feed: Feed) {
    if (!article.guid || typeof article.guid !== 'string') {
      this.logger.warn(`Could not store article for ${feed.originalTitle} as guid is not a string`)
      return
    }

    // TODO: upsert?
    if (
      await this.prismaService.article.findUnique({ where: { guid_feedId: { guid: article.guid, feedId: feed.id } } })
    ) {
      return
    }

    const feedSubscribers = await this.prismaService.user.findMany({
      where: { UserFeed: { some: { feedId: feed.id } } },
    })

    return this.prismaService.article.create({
      data: {
        content: article.content,
        contentBody: article['content:encoded'],
        feedId: feed.id,
        guid: article.guid,
        link: article.link,
        title: article.title,
        UserArticle: { createMany: { data: feedSubscribers.map(({ id }) => ({ userId: id })) } },
      },
    })
  }

  async getForUserAndFeed(username: string, feedId: Feed['id'], includeRead: boolean) {
    return this.prismaService.userArticle.findMany({
      select: { article: true, unread: true },
      where: { user: { username }, article: { feedId }, unread: includeRead ? undefined : true },
    })
  }
}
