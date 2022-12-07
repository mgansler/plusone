import { Module } from '@nestjs/common'

import { PrismaService } from '@plusone/feeds-persistence'

import { ArticleModule } from '../article/article.module'
import { DiscoverModule } from '../discover/discover.module'
import { FetchService } from '../fetch/fetch.service'
import { TagModule } from '../tag/tag.module'

import { FeedController } from './feed.controller'
import { FeedService } from './feed.service'

@Module({
  imports: [ArticleModule, DiscoverModule, TagModule],
  providers: [FeedService, FetchService, PrismaService],
  exports: [FeedService],
  controllers: [FeedController],
})
export class FeedModule {}
