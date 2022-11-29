import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'

import { Feed, Prisma, PrismaService, User } from '@plusone/feeds-persistence'
import { Sort, UserFeedResponse } from '@plusone/feeds/shared/types'

import { ArticleService } from '../article/article.service'
import { TokenPayload } from '../authentication/jwt.strategy'
import { DiscoverService } from '../discover/discover.service'
import { FetchService } from '../fetch/fetch.service'

import { FeedDiscoverDto, FeedInputDto, UpdateFeedSettingsInputDto } from './feed.dto'

@Injectable()
export class FeedService {
  private logger = new Logger(FeedService.name)

  constructor(
    private readonly prismaService: PrismaService,
    private readonly discoverService: DiscoverService,
    private readonly fetchService: FetchService,
    private readonly articleService: ArticleService,
  ) {}

  async discover({ url }: FeedDiscoverDto) {
    const discoveredFeed = await this.discoverService.discoverFeedForWebsite(url)

    if (!discoveredFeed) {
      this.logger.log(`Could not discover feed for given URL: ${url}`)
      throw new HttpException('Could not find a feed', HttpStatus.NOT_FOUND)
    }

    return { title: discoveredFeed.title, feedUrl: discoveredFeed.feedUrl, url }
  }

  async create(feedInputDto: FeedInputDto, userId: User['id']): Promise<UserFeedResponse> {
    let originalTitle: string
    try {
      if (typeof feedInputDto.url !== 'undefined') {
        originalTitle = (await this.discover({ url: feedInputDto.url })).title
      } else {
        originalTitle = feedInputDto.title
      }
    } catch (e) {
      if (typeof feedInputDto.title === 'undefined' || feedInputDto.title.length < 1) {
        throw new HttpException('Feed discovery failed, you MUST provide a title.', HttpStatus.BAD_REQUEST)
      }
      const articles = await this.fetchService.fetchFeedItems(feedInputDto.feedUrl)
      if (articles.length === 0) {
        throw new HttpException('Could not find any articles for given URL, please check.', HttpStatus.BAD_REQUEST)
      }
      originalTitle = feedInputDto.title
    }

    try {
      // Convert items to articles first so this doesn't count towards the wait time of the transaction
      const items = await this.fetchService.fetchFeedItems(feedInputDto.feedUrl)
      const articles = await Promise.all(
        items.reverse().map((item) => this.articleService.itemToArticle(feedInputDto.feedUrl, item)),
      )

      return await this.prismaService.$transaction(async (tx) => {
        const feed = await tx.feed.upsert({
          where: { feedUrl: feedInputDto.feedUrl },
          update: {
            UserFeed: {
              create: {
                user: { connect: { id: userId } },
                title: feedInputDto.title ?? originalTitle,
              },
            },
          },
          create: {
            feedUrl: feedInputDto.feedUrl,
            originalTitle,
            UserFeed: { create: { user: { connect: { id: userId } }, title: feedInputDto.title ?? originalTitle } },
          },
        })

        const userFeed = await tx.userFeed.findUnique({
          select: { title: true, includeRead: true, expandContent: true, order: true },
          where: { userId_feedId: { userId, feedId: feed.id } },
        })

        const feedSubscriberIds = (
          await tx.user.findMany({
            where: { UserFeed: { some: { feedId: feed.id } } },
          })
        ).map((user) => ({ userId: user.id }))

        for (const article of articles) {
          await tx.article.upsert({
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
              UserArticle: {
                createMany: {
                  data: feedSubscriberIds,
                  skipDuplicates: true,
                },
              },
            },
            create: {
              ...article,
              feedId: feed.id,
              UserArticle: {
                createMany: {
                  data: feedSubscriberIds,
                  skipDuplicates: true,
                },
              },
            },
          })
        }

        const unreadCount = await tx.userArticle.count({ where: { userId, article: { feedId: feed.id } } })

        return {
          id: feed.id,
          feedUrl: feed.feedUrl,
          originalTitle: feed.originalTitle,
          ...userFeed,
          order: userFeed.order === 'ASC' ? Sort.OldestFirst : Sort.NewestFirst,
          unreadCount,
        }
      })
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          this.logger.warn(`User is already subscribed to feed: ${feedInputDto.title}`)
          throw new HttpException('You are already subscribed to this feed', HttpStatus.CONFLICT)
        }
      }
      this.logger.error(e)
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async import(feedInputDtos: FeedInputDto[], userId: User['id']) {
    const urisWithoutArticles: string[] = []

    for (const feedInput of feedInputDtos) {
      const articles = await this.fetchService.fetchFeedItems(feedInput.feedUrl)
      if (articles.length === 0) {
        urisWithoutArticles.push(feedInput.feedUrl)
        continue
      }
      try {
        await this.create(feedInput, userId)
      } catch (e) {
        this.logger.error(e)
      }
    }

    if (urisWithoutArticles.length > 0) {
      this.logger.debug(`Could not find any articles for these uris:\n\t${urisWithoutArticles.join('\n\t')}`)
    }
  }

  async findAll(): Promise<Feed[]> {
    return this.prismaService.feed.findMany()
  }

  async findAllFor(user: TokenPayload): Promise<UserFeedResponse[]> {
    return this.prismaService.$transaction(async (tx) => {
      const userFeeds = await tx.userFeed.findMany({
        select: { feed: true, title: true, includeRead: true, order: true, expandContent: true },
        where: { userId: user.id },
      })

      const userFeedResponses: UserFeedResponse[] = []

      for await (const { feed, order, ...rest } of userFeeds) {
        const unreadCount = await tx.userArticle.count({
          where: {
            userId: user.id,
            article: { feedId: feed.id },
            unread: true,
          },
        })

        userFeedResponses.push({
          ...feed,
          order: order === 'DESC' ? Sort.NewestFirst : Sort.OldestFirst,
          ...rest,
          unreadCount,
        })
      }

      return userFeedResponses
    })
  }

  async updateFeedSettings(
    user: TokenPayload,
    feedId: Feed['id'],
    { order, includeRead, expandContent }: UpdateFeedSettingsInputDto,
  ) {
    await this.prismaService.userFeed.update({
      data: {
        expandContent,
        order: order === Sort.NewestFirst ? 'DESC' : 'ASC',
        includeRead,
      },
      where: {
        userId_feedId: {
          userId: user.id,
          feedId,
        },
      },
    })
  }
}
