import { Module } from '@nestjs/common'

import { DatabaseModule } from '@plusone/feeds/database'

import { FeedService } from './feed.service'
import { feedProviders } from './feed.providers'

@Module({
  imports: [DatabaseModule],
  providers: [FeedService, ...feedProviders],
  exports: [FeedService],
})
export class FeedModule {}
