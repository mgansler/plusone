import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'

import { ArticleModule } from '../article/article.module'
import { FeedModule } from '../feed/feed.module'
import { FetchModule } from '../fetch/fetch.module'

import { SchedulingController } from './scheduling.controller'
import { SchedulingService } from './scheduling.service'

@Module({
  imports: [ScheduleModule.forRoot(), FeedModule, FetchModule, ArticleModule],
  controllers: [SchedulingController],
  providers: [SchedulingService],
  exports: [],
})
export class SchedulingModule {}
