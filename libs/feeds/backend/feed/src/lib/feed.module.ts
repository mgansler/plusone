import { Module } from '@nestjs/common'

import { PrismaService } from '@plusone/feeds/backend/persistence'

import { FeedService } from './feed.service'

@Module({
  imports: [],
  providers: [FeedService, PrismaService],
  exports: [FeedService],
})
export class FeedModule {}
