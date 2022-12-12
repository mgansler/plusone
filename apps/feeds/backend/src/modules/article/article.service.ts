import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Item } from 'rss-parser'

import { Article, Feed, Prisma, PrismaService, User } from '@plusone/feeds-persistence'
import { PaginatedArticles, Pagination, Sort } from '@plusone/feeds/shared/types'

import { getArticleBuilderFunction } from './transformation/transformation'

type ArticleFindParams = Pagination & {
  sort: Sort
  searchTerm?: string
  feedId?: Feed['id']
  includeRead: boolean
}

type MarkArticlesReadParams = {
  feedId?: Feed['id']
  searchTerm?: string
}

@Injectable()
export class ArticleService {
  private logger = new Logger(ArticleService.name)

  constructor(private readonly prismaService: PrismaService, private readonly configService: ConfigService) {}

  async create(item: Item, feed: Feed) {
    const article = await this.itemToArticle(feed.feedUrl, item)

    if (!article.guid || typeof article.guid !== 'string') {
      if (typeof article.id === 'string') {
        article.guid = article.id
      } else {
        this.logger.warn(`Could not store article for ${feed.originalTitle} as guid is not a string`)
        this.logger.debug(`${article.title}: ${article.guid}`)
        return
      }
    }

    const feedSubscribers = await this.prismaService.user.findMany({
      where: { UserFeed: { some: { feedId: feed.id } } },
    })

    await this.prismaService.article.upsert({
      where: {
        guid_feedId: {
          guid: article.guid,
          feedId: feed.id,
        },
      },
      update: {
        content: article.content,
        contentBody: article.contentBody,
        title: article.title,
        UserArticle: { createMany: { data: feedSubscribers.map(({ id }) => ({ userId: id })), skipDuplicates: true } },
      },
      create: {
        ...article,
        feedId: feed.id,
        UserArticle: { createMany: { data: feedSubscribers.map(({ id }) => ({ userId: id })), skipDuplicates: true } },
      },
    })
  }

  async find(
    userId: User['id'],
    { cursor, sort, searchTerm, feedId, includeRead }: ArticleFindParams,
  ): Promise<PaginatedArticles> {
    this.logger.debug(`User is searching for '${searchTerm}', limited by '${feedId}', sorted: '${sort}'.`)

    const pagination = this.normalizePagination(cursor)
    const search = typeof searchTerm !== 'undefined' ? searchTerm.split(' ').join(' & ') : '%'

    const where: Prisma.UserArticleFindManyArgs['where'] = {
      userId,
      article: {
        feedId,
        title: searchTerm ? { search } : undefined,
      },
    }

    // When read articles are supposed to be included we don't sort for the unread property.
    // Otherwise, read articles will show up after all unread articles.
    const orderBy: Prisma.UserArticleFindManyArgs['orderBy'] = includeRead ? [] : [{ unread: 'desc' }]
    orderBy.push({ cursor: sort })

    const [totalCount, content, unreadCount] = await this.prismaService.$transaction([
      this.prismaService.userArticle.count({ where }),
      this.prismaService.userArticle.findMany({
        ...pagination,
        select: { article: true, unread: true, cursor: true },
        where,
        orderBy,
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

  async findRecentlyReadArticles(userId: User['id']): Promise<Article[]> {
    const recentlyRead = await this.prismaService.recentlyRead.findMany({
      include: { article: true },
      where: { userId },
      orderBy: { cursor: 'desc' },
    })

    return recentlyRead.map((r) => r.article)
  }

  async toggleUnreadForUser(articleId: Article['id'], userId: User['id'], unread: boolean) {
    console.log(unread)
    return this.prismaService.$transaction(async (tx) => {
      if (unread) {
        // Remove this article
        // Workaround until deleteIfExists is implemented: https://github.com/prisma/prisma/issues/9460
        await tx.recentlyRead.deleteMany({ where: { userId, articleId: { equals: articleId } } })
      } else {
        // Remove first entry if over limit and add a new entry
        const currentCursors = (
          await tx.recentlyRead.findMany({
            select: { cursor: true },
            where: { userId },
            orderBy: { cursor: 'desc' },
            take: Math.max(this.configService.get('RECENTLY_READ_COUNT') - 1, 1),
          })
        ).map((e) => e.cursor)
        await tx.recentlyRead.deleteMany({ where: { userId, cursor: { notIn: currentCursors } } })

        // Add this article to RecentlyRead
        await tx.recentlyRead.upsert({
          where: { userId_articleId: { userId, articleId } },
          create: { articleId, userId },
          update: {},
        })
      }

      return tx.userArticle.update({
        select: { article: true, unread: true, cursor: true },
        data: { unread },
        where: { userId_articleId: { articleId, userId } },
      })
    })
  }

  async markArticlesRead({ feedId, searchTerm }: MarkArticlesReadParams, userId: User['id']) {
    const search = typeof searchTerm !== 'undefined' ? searchTerm.split(' ').join(' & ') : '%'

    const where: Prisma.UserArticleUpdateManyArgs['where'] = {
      userId,
      article: {
        feedId,
        title: searchTerm ? { search } : undefined,
      },
    }

    await this.prismaService.userArticle.updateMany({
      where,
      data: {
        unread: false,
      },
    })
  }

  async itemToArticle(
    feedUrl: Feed['feedUrl'],
    item: Item,
  ): Promise<Omit<Prisma.ArticleCreateInput, 'feed' | 'UserArticle'>> {
    return getArticleBuilderFunction(feedUrl)(item)
  }

  private normalizePagination(cursor?: Pagination['cursor']): {
    cursor: { cursor: number }
    skip: number
    take: number
  } {
    const isFirstRequest = !cursor || cursor === 'false' || Number(cursor) === 0
    return {
      cursor: isFirstRequest ? undefined : { cursor: Number(cursor) },
      skip: isFirstRequest ? 0 : 1,
      take: this.configService.get('PAGE_SIZE'),
    }
  }
}
