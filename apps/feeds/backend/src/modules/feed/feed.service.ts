import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'

import { Feed, Prisma, PrismaService, User } from '@plusone/feeds-persistence'
import { Sort, UserFeedResponse } from '@plusone/feeds/shared/types'

import { TokenPayload } from '../authentication/jwt.strategy'
import { DiscoverService } from '../discover/discover.service'
import { FetchService } from '../fetch/fetch.service'

import { FeedDiscoverDto, FeedInputDto } from './feed.dto'

@Injectable()
export class FeedService {
  private logger = new Logger(FeedService.name)

  constructor(
    private readonly prismaService: PrismaService,
    private readonly discoverService: DiscoverService,
    private readonly fetchService: FetchService,
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
      originalTitle = (await this.discover({ url: feedInputDto.url })).title
    } catch (e) {
      if (typeof feedInputDto.title === 'undefined' || feedInputDto.title.length < 1) {
        throw new HttpException('Feed discovery failed, you MUST provide a title.', HttpStatus.BAD_REQUEST)
      }
      const articles = await this.fetchService.fetchFeedArticles(feedInputDto.feedUrl)
      if (articles.length === 0) {
        throw new HttpException('Could not find any articles for given URL, please check.', HttpStatus.BAD_REQUEST)
      }
      originalTitle = feedInputDto.title
    }

    try {
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

        return {
          id: feed.id,
          feedUrl: feed.feedUrl,
          originalTitle: feed.originalTitle,
          ...userFeed,
          order: userFeed.order === 'ASC' ? Sort.OldestFirst : Sort.NewestFirst,
        }
      })
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          this.logger.warn(`User is already subscribed to feed: ${feedInputDto.title}`)
          throw new HttpException('You are already subscribed to this feed', HttpStatus.CONFLICT)
        }
        this.logger.error(e)
        throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
      }
    }
  }

  async findAll(): Promise<Feed[]> {
    return this.prismaService.feed.findMany()
  }

  async findAllFor(user: TokenPayload): Promise<UserFeedResponse[]> {
    return (
      (
        await this.prismaService.userFeed.findMany({
          select: { feed: true, title: true, includeRead: true, order: true, expandContent: true },
          where: { userId: user.id },
        })
      )
        // Unpack feed, transform order, copy the rest
        .map(({ feed, order, ...rest }) => ({
          ...feed,
          order: order === 'DESC' ? Sort.NewestFirst : Sort.OldestFirst,
          ...rest,
        }))
    )
  }
}
