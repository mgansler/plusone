import { Module } from '@nestjs/common'
import { ClientsModule } from '@nestjs/microservices'
import { ScheduleModule } from '@nestjs/schedule'

import { fetchOptions } from '@feeds/fetch'
import { discoverOptions } from '@feeds/discover'
import { ArticleModule } from '@feeds/article'
import { FeedModule } from '@feeds/feed'

import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [
    ClientsModule.register([discoverOptions]),
    ClientsModule.register([fetchOptions]),
    ScheduleModule.forRoot(),
    FeedModule,
    ArticleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
