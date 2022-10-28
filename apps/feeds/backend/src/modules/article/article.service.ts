import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Item } from 'rss-parser'

import { Article, Feed, Prisma, PrismaService, User } from '@plusone/feeds-persistence'
import { PaginatedArticles, Pagination } from '@plusone/feeds/shared/types'

@Injectable()
export class ArticleService {
  private logger = new Logger(ArticleService.name)

  constructor(private readonly prismaService: PrismaService, private readonly configService: ConfigService) {}

  async create(newArticle: Item & { id?: string }, feed: Feed) {
    if (!newArticle.guid || typeof newArticle.guid !== 'string') {
      if (typeof newArticle.id === 'string') {
        newArticle.guid = newArticle.id
      } else {
        this.logger.warn(`Could not store article for ${feed.originalTitle} as guid is not a string`)
        this.logger.debug(`${newArticle.title}: ${newArticle.guid}`)
        return
      }
    }

    const feedSubscribers = await this.prismaService.user.findMany({
      where: { UserFeed: { some: { feedId: feed.id } } },
    })

    await this.prismaService.article.upsert({
      where: {
        guid_feedId: {
          guid: newArticle.guid,
          feedId: feed.id,
        },
      },
      update: {
        content: newArticle.content,
        contentBody: newArticle['content:encoded'],
        title: newArticle.title,
        UserArticle: { createMany: { data: feedSubscribers.map(({ id }) => ({ userId: id })), skipDuplicates: true } },
      },
      create: {
        content: newArticle.content,
        contentBody: newArticle['content:encoded'],
        feedId: feed.id,
        guid: newArticle.guid,
        link: newArticle.link,
        title: newArticle.title,
        date: new Date(newArticle.isoDate),
        UserArticle: { createMany: { data: feedSubscribers.map(({ id }) => ({ userId: id })), skipDuplicates: true } },
      },
    })
  }

  async getForUserAndFeed(userId: User['id'], feedId: Feed['id'], pagination: Pagination): Promise<PaginatedArticles> {
    const isFirstRequest = !pagination.cursor || Number(pagination.cursor) === 0

    const [totalCount, unreadCount, content] = await this.prismaService.$transaction([
      this.prismaService.userArticle.count({
        where: { userId, article: { feedId } },
      }),
      this.prismaService.userArticle.count({
        where: { userId, article: { feedId }, unread: true },
      }),
      this.prismaService.userArticle.findMany({
        take: this.configService.get('PAGE_SIZE'),
        cursor: isFirstRequest ? undefined : { cursor: Number(pagination.cursor) },
        skip: isFirstRequest ? 0 : 1,
        select: { article: true, unread: true, cursor: true },
        where: { userId, article: { feedId } },
        orderBy: [{ cursor: 'desc' }],
      }),
    ])

    return {
      totalCount,
      content,
      unreadCount,
      lastCursor: content[content.length - 1]?.cursor,
      pageSize: this.configService.get('PAGE_SIZE'),
    }
  }

  async find(
    userId: User['id'],
    s: string | undefined,
    feedId: Feed['id'] | undefined,
    pagination: Pagination,
  ): Promise<PaginatedArticles> {
    this.logger.debug(`User is searching for '${s}', limited by '${feedId}'.`)

    const isFirstRequest = !pagination.cursor || Number(pagination.cursor) === 0
    const search = typeof s !== 'undefined' ? s.split(' ').join(' & ') : '%'

    const where: Prisma.UserArticleFindManyArgs['where'] = {
      userId,
      article: {
        feedId,
        title: s ? { search } : undefined,
      },
    }

    const [totalCount, content, unreadCount] = await this.prismaService.$transaction([
      this.prismaService.userArticle.count({ where }),
      this.prismaService.userArticle.findMany({
        cursor: isFirstRequest ? undefined : { cursor: Number(pagination.cursor) },
        skip: isFirstRequest ? 0 : 1,
        take: this.configService.get('PAGE_SIZE'),
        select: { article: true, unread: true, cursor: true },
        where,
        orderBy: [{ cursor: 'desc' }],
      }),
      this.prismaService.userArticle.count({ where: { ...where, unread: true } }),
    ])

    return {
      content,
      totalCount,
      lastCursor: content[content.length - 1]?.cursor,
      pageSize: this.configService.get('PAGE_SIZE'),
      unreadCount,
    }
  }

  async search(userId: User['id'], s: string, pagination: Pagination): Promise<PaginatedArticles> {
    this.logger.debug(`User is searching for '${s}'.`)

    const isFirstRequest = !pagination.cursor || Number(pagination.cursor) === 0
    const search = s.split(' ').join(' & ')

    const [totalCount, content, unreadCount] = await this.prismaService.$transaction([
      this.prismaService.userArticle.count({
        where: { userId, article: { title: { search } } },
      }),
      this.prismaService.userArticle.findMany({
        cursor: isFirstRequest ? undefined : { cursor: Number(pagination.cursor) },
        skip: isFirstRequest ? 0 : 1,
        take: this.configService.get('PAGE_SIZE'),
        select: { article: true, unread: true, cursor: true },
        where: { userId, article: { title: { search } } },
        orderBy: [{ cursor: 'desc' }],
      }),
      this.prismaService.userArticle.count({
        where: { userId, article: { title: { search } }, unread: true },
      }),
    ])

    return {
      content,
      totalCount,
      lastCursor: content[content.length - 1]?.cursor,
      pageSize: this.configService.get('PAGE_SIZE'),
      unreadCount,
    }
  }

  async toggleUnreadForUser(articleId: Article['id'], userId: User['id'], unread: boolean) {
    return this.prismaService.userArticle.update({
      select: { article: true, unread: true, cursor: true },
      data: { unread },
      where: { userId_articleId: { articleId, userId } },
    })
  }
}
