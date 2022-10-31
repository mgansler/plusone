import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'

import { Feed, Prisma, PrismaService, User } from '@plusone/feeds-persistence'
import { Sort, UserFeedResponse } from '@plusone/feeds/shared/types'

import { TokenPayload } from '../authentication/jwt.strategy'
import { DiscoverService } from '../discover/discover.service'

import { FeedDiscoverDto, FeedInputDto } from './feed.dto'

@Injectable()
export class FeedService {
  private logger = new Logger(FeedService.name)

  constructor(private readonly prismaService: PrismaService, private readonly discoverService: DiscoverService) {}

  async discover({ url }: FeedDiscoverDto) {
    const discoveredFeed = await this.discoverService.discoverFeedForWebsite(url)

    if (!discoveredFeed) {
      this.logger.log(`Could not discover feed for given URL: ${url}`)
      throw new HttpException('Could not find a feed', HttpStatus.NOT_FOUND)
    }

    return { title: discoveredFeed.title, feedUrl: discoveredFeed.feedUrl, url }
  }

  async create(feedInputDto: FeedInputDto, userId: User['id']): Promise<UserFeedResponse> {
    const { title: originalTitle } = await this.discover({ url: feedInputDto.url })

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
          where: { userId_feedId: { userId, feedId: feed.id } },
        })

        return {
          id: feed.id,
          originalTitle: feed.originalTitle,
          title: userFeed.title,
          feedUrl: feed.feedUrl,
          includeRead: userFeed.includeRead,
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
          select: { feed: true, title: true, includeRead: true, order: true },
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
