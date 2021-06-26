import { Injectable, Logger } from '@nestjs/common'
import { Item } from 'rss-parser'

import { Article, Feed, PrismaService, User } from '@plusone/feeds/backend/persistence'
import { Pagination } from '@plusone/feeds/shared/types'

@Injectable()
export class ArticleService {
  private logger = new Logger(ArticleService.name)

  constructor(private prismaService: PrismaService) {}

  async create(article: Item & { id?: string }, feed: Feed) {
    if (!article.guid || typeof article.guid !== 'string') {
      if (typeof article.id === 'string') {
        article.guid = article.id
      } else {
        this.logger.warn(`Could not store article for ${feed.originalTitle} as guid is not a string`)
        this.logger.debug(`${article.title}: ${article.guid}`)
        return
      }
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

  async getForUserAndFeed(userId: User['id'], feedId: Feed['id'], pagination: Pagination) {
    const [totalCount, unreadCount, content] = await this.prismaService.$transaction([
      this.prismaService.userArticle.count({
        where: { userId, article: { feedId } },
      }),
      this.prismaService.userArticle.count({
        where: { userId, article: { feedId }, unread: true },
      }),
      this.prismaService.userArticle.findMany({
        take: Number(pagination.take) ?? 10,
        skip: Number(pagination.skip) ?? 0,
        select: { article: true, unread: true },
        where: { userId, article: { feedId } },
        orderBy: [{ article: { date: 'desc' } }],
      }),
    ])
    return { totalCount, content, unreadCount }
  }

  async toggleUnreadForUser(articleId: Article['id'], userId: User['id'], unread: boolean) {
    return this.prismaService.userArticle.update({
      select: { article: true, unread: true },
      data: { unread },
      where: { userId_articleId: { articleId, userId } },
    })
  }
}
