import { Injectable } from '@nestjs/common'

import { Feed, PrismaService } from '@plusone/feeds/backend/persistence'

import { FeedDto } from './feed.dto'

@Injectable()
export class FeedService {
  constructor(private prismaService: PrismaService) {}

  async create(feedDto: FeedDto): Promise<Feed> {
    return this.prismaService.feed.create({ data: feedDto })
  }

  async findAll() {
    return this.prismaService.feed.findMany()
  }
}
