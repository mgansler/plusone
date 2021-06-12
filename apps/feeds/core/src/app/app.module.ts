import { Module } from '@nestjs/common'
import { ClientsModule } from '@nestjs/microservices'
import { ScheduleModule } from '@nestjs/schedule'

import { fetchOptions } from '@plusone/feeds/backend/fetch'
import { discoverOptions } from '@plusone/feeds/backend/discover'
import { ArticleModule } from '@plusone/feeds/backend/article'
import { AuthenticationModule } from '@plusone/feeds/backend/authentication'
import { FeedModule } from '@plusone/feeds/backend/feed'
import { UserModule } from '@plusone/feeds/backend/user'

import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [
    ClientsModule.register([discoverOptions, fetchOptions]),
    ScheduleModule.forRoot(),
    ArticleModule,
    AuthenticationModule,
    FeedModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
