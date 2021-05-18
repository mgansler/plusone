import { Module } from '@nestjs/common'
import { ClientsModule } from '@nestjs/microservices'
import { ScheduleModule } from '@nestjs/schedule'

import { fetchOptions } from '@plusone/feeds/fetch'
import { discoverOptions } from '@plusone/feeds/discover'
import { ArticleModule } from '@plusone/feeds/article'
import { FeedModule } from '@plusone/feeds/feed'
import { AuthenticationModule } from '@plusone/feeds/authentication'

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
