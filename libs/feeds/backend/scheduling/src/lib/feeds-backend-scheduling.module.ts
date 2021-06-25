import { Module } from '@nestjs/common'
import { ClientsModule } from '@nestjs/microservices'
import { ScheduleModule } from '@nestjs/schedule'

import { FeedModule } from '@plusone/feeds/backend/feed'
import { ArticleModule } from '@plusone/feeds/backend/article'
import { DISCOVER_OPTIONS, FETCH_OPTIONS } from '@plusone/feeds/shared/constants'

import { SchedulingService } from './scheduling.service'
import { SchedulingController } from './scheduling.controller'

@Module({
  imports: [
    ClientsModule.register([DISCOVER_OPTIONS, FETCH_OPTIONS]),
    ScheduleModule.forRoot(),
    FeedModule,
    ArticleModule,
  ],
  controllers: [SchedulingController],
  providers: [SchedulingService],
  exports: [],
})
export class FeedsBackendSchedulingModule {}
