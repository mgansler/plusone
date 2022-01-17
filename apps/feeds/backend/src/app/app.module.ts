import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'

import { ArticleModule } from '../modules/article/article.module'
import { AuthenticationModule } from '../modules/authentication/authentication.module'
import { FeedModule } from '../modules/feed/feed.module'
import { HealthModule } from '../modules/health/health.module'
import { SchedulingModule } from '../modules/scheduling/scheduling.module'
import { UserModule } from '../modules/user/user.module'

import { LoggerMiddleware } from './logger.middleware'

@Module({
  imports: [ArticleModule, AuthenticationModule, FeedModule, HealthModule, UserModule, SchedulingModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
