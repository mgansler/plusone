import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'

import { JwtPayload } from '@plusone/feeds/backend/authentication'
import { Feed, PrismaService } from '@plusone/feeds/backend/persistence'
import {
  DISCOVER_MESSAGE_PATTERN,
  DISCOVER_SERVICE,
  DiscoverFeedRequest,
  DiscoverFeedResponse,
} from '@plusone/feeds/backend/discover'

import { FeedDiscoverDto, FeedInputDto } from './feed.dto'

@Injectable()
export class FeedService {
  private logger = new Logger(FeedService.name)

  constructor(private prismaService: PrismaService, @Inject(DISCOVER_SERVICE) private discoverClient: ClientProxy) {}

  async discover(feedDiscoverDto: FeedDiscoverDto) {
    const discoveredFeed = await this.discoverClient
      .send<DiscoverFeedResponse, DiscoverFeedRequest>(DISCOVER_MESSAGE_PATTERN, feedDiscoverDto.feedUrl)
      .toPromise()

    if (!discoveredFeed) {
      this.logger.log(`Could not discover feed for given URL: ${feedDiscoverDto.feedUrl}`)
      throw new HttpException('Could not find a feed', HttpStatus.NOT_FOUND)
    }

    return { title: discoveredFeed.title, feedUrl: discoveredFeed.feedUrl }
  }

  async create(feedDto: FeedInputDto, username: string): Promise<Feed> {
    if (await this.prismaService.feed.findUnique({ where: { feedUrl: feedDto.feedUrl } })) {
      return this.prismaService.feed.update({
        data: { user: { connect: { username } } },
        where: { feedUrl: feedDto.feedUrl },
      })
    } else {
      return this.prismaService.feed.create({ data: { ...feedDto, user: { connect: { username } } } })
    }
  }

  async findAll(user: JwtPayload) {
    if (user.isAdmin) {
      return this.prismaService.feed.findMany()
    } else {
      return this.prismaService.feed.findMany({ where: { user: { every: { username: user.username } } } })
    }
  }
}
