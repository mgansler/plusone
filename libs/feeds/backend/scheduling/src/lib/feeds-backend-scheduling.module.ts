import { Module } from '@nestjs/common'
import { ClientsModule } from '@nestjs/microservices'
import { ScheduleModule } from '@nestjs/schedule'

import { discoverOptions } from '@plusone/feeds/backend/discover'
import { fetchOptions } from '@plusone/feeds/backend/fetch'
import { FeedModule } from '@plusone/feeds/backend/feed'
import { ArticleModule } from '@plusone/feeds/backend/article'

import { SchedulingService } from '../scheduling/scheduling.service'

@Module({
  imports: [
    ClientsModule.register([discoverOptions, fetchOptions]),
    ScheduleModule.forRoot(),
    FeedModule,
    ArticleModule,
  ],
  controllers: [],
  providers: [SchedulingService],
  exports: [],
})
export class FeedsBackendSchedulingModule {}
