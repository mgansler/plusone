import { Module } from '@nestjs/common'
import { ClientsModule } from '@nestjs/microservices'

import { PrismaService } from '@plusone/feeds/backend/persistence'
import { ArticleModule } from '@plusone/feeds/backend/article'
import { DISCOVER_OPTIONS } from '@plusone/feeds/shared/constants'

import { FeedService } from './feed.service'
import { FeedController } from './feed.controller'

@Module({
  imports: [ClientsModule.register([DISCOVER_OPTIONS]), ArticleModule],
  providers: [FeedService, PrismaService],
  exports: [FeedService],
  controllers: [FeedController],
})
export class FeedModule {}
