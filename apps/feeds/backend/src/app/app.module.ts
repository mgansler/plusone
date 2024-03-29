import { join } from 'path'

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'
import * as Joi from 'joi'

import { ArticleModule } from '../modules/article/article.module'
import { AuthenticationModule } from '../modules/authentication/authentication.module'
import { BootInfoModule } from '../modules/boot-info/boot-info.module'
import { FeedModule } from '../modules/feed/feed.module'
import { HealthModule } from '../modules/health/health.module'
import { SchedulingModule } from '../modules/scheduling/scheduling.module'
import { TagModule } from '../modules/tag/tag.module'
import { UserModule } from '../modules/user/user.module'

import { PAGE_SIZE } from './consts'
import { LoggerMiddleware } from './logger.middleware'

@Module({
  imports: [
    ArticleModule,
    AuthenticationModule,
    BootInfoModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
        JWT_ACCESS_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
        JWT_REFRESH_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        FEEDS_DATABASE_URL: Joi.string().required(),
        [PAGE_SIZE]: Joi.number().default(20),
        RECENTLY_READ_COUNT: Joi.number().default(20),
      }),
      envFilePath: ['.local.env'],
    }),
    FeedModule,
    HealthModule,
    SchedulingModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'web'),
    }),
    TagModule,
    UserModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
