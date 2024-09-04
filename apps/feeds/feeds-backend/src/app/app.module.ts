import { join } from 'path'

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'

import { ArticleModule } from '../modules/article/article.module'
import { AuthenticationModule } from '../modules/authentication/authentication.module'
import { BootInfoModule } from '../modules/boot-info/boot-info.module'
import { FeedModule } from '../modules/feed/feed.module'
import { HealthModule } from '../modules/health/health.module'
import { SchedulingModule } from '../modules/scheduling/scheduling.module'
import { TagModule } from '../modules/tag/tag.module'
import { UserModule } from '../modules/user/user.module'

import { configSchema } from './config'
import { LoggerMiddleware } from './logger.middleware'

@Module({
  imports: [
    ArticleModule,
    AuthenticationModule,
    BootInfoModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validate: configSchema.parse,
      envFilePath: ['.local.env'],
    }),
    FeedModule,
    HealthModule,
    SchedulingModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'web'),
      renderPath: new RegExp(/^(?!\/api\/).*/),
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
