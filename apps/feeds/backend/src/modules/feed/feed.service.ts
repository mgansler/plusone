import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'

import { Feed, Prisma, PrismaService, User } from '@plusone/feeds-persistence'

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

  async findAllFor(user: TokenPayload) {
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
