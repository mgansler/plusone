import { Module } from '@nestjs/common'
import { ClientsModule } from '@nestjs/microservices'

import { PrismaService } from '@plusone/feeds/backend/persistence'
import { discoverOptions } from '@plusone/feeds/backend/discover'
import { ArticleModule } from '@plusone/feeds/backend/article'

import { FeedService } from './feed.service'
import { FeedController } from './feed.controller'

@Module({
  imports: [ClientsModule.register([discoverOptions]), ArticleModule],
  providers: [FeedService, PrismaService],
  exports: [FeedService],
  controllers: [FeedController],
})
export class FeedModule {}
