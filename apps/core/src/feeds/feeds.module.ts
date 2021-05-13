import { Module } from '@nestjs/common'

import { DatabaseModule } from '@feeds/database'

import { FeedsService } from './feeds.service'
import { feedsProviders } from './feeds.providers'

@Module({
  imports: [DatabaseModule],
  providers: [FeedsService, ...feedsProviders],
  exports: [FeedsService],
})
export class FeedsModule {}
