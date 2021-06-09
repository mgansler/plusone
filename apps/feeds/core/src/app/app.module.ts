import { Module } from '@nestjs/common'
import { ClientsModule } from '@nestjs/microservices'
import { ScheduleModule } from '@nestjs/schedule'

import { fetchOptions } from '@plusone/feeds/backend/fetch'
import { discoverOptions } from '@plusone/feeds/backend/discover'
import { ArticleModule } from '@plusone/feeds/backend/article'
import { FeedModule } from '@plusone/feeds/backend/feed'
import { AuthenticationModule } from '@plusone/feeds/backend/authentication'

import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [
    ClientsModule.register([discoverOptions, fetchOptions]),
    ScheduleModule.forRoot(),
    FeedModule,
    ArticleModule,
    AuthenticationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
