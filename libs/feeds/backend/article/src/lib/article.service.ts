import { Injectable, Logger } from '@nestjs/common'
import { Item } from 'rss-parser'

import { Feed, PrismaService } from '@plusone/feeds/backend/persistence'
import { Pagination } from '@plusone/feeds/shared/types'

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
        date: new Date(article.isoDate),
        UserArticle: { createMany: { data: feedSubscribers.map(({ id }) => ({ userId: id })) } },
      },
    })
  }

  async getForUserAndFeed(username: string, feedId: Feed['id'], pagination: Pagination) {
    const [totalCount, content] = await this.prismaService.$transaction([
      this.prismaService.userArticle.count({
        where: { user: { username }, article: { feedId } },
      }),
      this.prismaService.userArticle.findMany({
        take: Number(pagination.take) ?? 10,
        skip: Number(pagination.skip) ?? 0,
        select: { article: true, unread: true },
        where: { user: { username }, article: { feedId } },
        orderBy: [{ unread: 'desc' }, { article: { date: 'desc' } }],
      }),
    ])
    return { totalCount, content }
  }
}
