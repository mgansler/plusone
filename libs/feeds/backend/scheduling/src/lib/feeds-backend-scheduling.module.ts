import { Module } from '@nestjs/common'
import { ClientsModule } from '@nestjs/microservices'
import { ScheduleModule } from '@nestjs/schedule'

import { FeedModule } from '@plusone/feeds/backend/feed'
import { ArticleModule } from '@plusone/feeds/backend/article'
import { DISCOVER_OPTIONS, FETCH_OPTIONS } from '@plusone/feeds/shared/constants'

import { SchedulingService } from '../scheduling/scheduling.service'

@Module({
  imports: [
    ClientsModule.register([DISCOVER_OPTIONS, FETCH_OPTIONS]),
    ScheduleModule.forRoot(),
    FeedModule,
    ArticleModule,
  ],
  controllers: [],
  providers: [SchedulingService],
  exports: [],
})
export class FeedsBackendSchedulingModule {}
