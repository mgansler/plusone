import { Module } from '@nestjs/common'
import { ClientsModule } from '@nestjs/microservices'

import { PrismaService } from '@plusone/feeds/backend/persistence'
import { discoverOptions } from '@plusone/feeds/backend/discover'

import { FeedService } from './feed.service'
import { FeedController } from './feed.controller'

@Module({
  imports: [ClientsModule.register([discoverOptions])],
  providers: [FeedService, PrismaService],
  exports: [FeedService],
  controllers: [FeedController],
})
export class FeedModule {}
