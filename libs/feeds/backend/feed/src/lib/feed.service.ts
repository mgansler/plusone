import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'

import { JwtPayload } from '@plusone/feeds/backend/authentication'
import { Feed, Prisma, PrismaService, User } from '@plusone/feeds/backend/persistence'
import { DiscoverFeedRequest, DiscoverFeedResponse } from '@plusone/feeds/shared/types'
import { DISCOVER_MESSAGE_PATTERN, DISCOVER_SERVICE } from '@plusone/feeds/shared/constants'

import { FeedDiscoverDto, FeedInputDto } from './feed.dto'

@Injectable()
export class FeedService {
  private logger = new Logger(FeedService.name)

  constructor(private prismaService: PrismaService, @Inject(DISCOVER_SERVICE) private discoverClient: ClientProxy) {}

  async discover({ url }: FeedDiscoverDto) {
    const discoveredFeed = await this.discoverClient
      .send<DiscoverFeedResponse, DiscoverFeedRequest>(DISCOVER_MESSAGE_PATTERN, url)
      .toPromise()

    if (!discoveredFeed) {
      this.logger.log(`Could not discover feed for given URL: ${url}`)
      throw new HttpException('Could not find a feed', HttpStatus.NOT_FOUND)
    }

    return { title: discoveredFeed.title, feedUrl: discoveredFeed.feedUrl, url }
  }

  async create(feedInputDto: FeedInputDto, userId: User['id']): Promise<Feed> {
    const { title: originalTitle } = await this.discover({ url: feedInputDto.url })

    try {
      return await this.prismaService.feed.upsert({
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

  async findAllFor(user: JwtPayload) {
    if (user.isAdmin) {
      return this.prismaService.feed.findMany()
    } else {
      return (
        await this.prismaService.userFeed.findMany({
          select: { feed: true, title: true },
          where: { userId: user.id },
        })
      ).map(({ feed, title }) => ({ ...feed, title }))
    }
  }
}
