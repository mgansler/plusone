import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { DatabaseModule, Feed } from '@plusone/feeds/backend/database'

import { FeedService } from './feed.service'

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([Feed])],
  providers: [FeedService],
  exports: [FeedService],
})
export class FeedModule {}
