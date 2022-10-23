import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'

import { ArticleModule } from '../modules/article/article.module'
import { AuthenticationModule } from '../modules/authentication/authentication.module'
import { FeedModule } from '../modules/feed/feed.module'
import { HealthModule } from '../modules/health/health.module'
import { SchedulingModule } from '../modules/scheduling/scheduling.module'
import { UserModule } from '../modules/user/user.module'

import { LoggerMiddleware } from './logger.middleware'

@Module({
  imports: [
    ArticleModule,
    AuthenticationModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
        JWT_ACCESS_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
        JWT_REFRESH_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        DATABASE_URL: Joi.string().required(),
        PAGE_SIZE: Joi.number().default(20),
      }),
      envFilePath: ['.local.env'],
    }),
    FeedModule,
    HealthModule,
    UserModule,
    SchedulingModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
