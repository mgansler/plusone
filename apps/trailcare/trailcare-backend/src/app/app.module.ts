import { join } from 'path'

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { ServeStaticModule } from '@nestjs/serve-static'
import { ScheduleModule } from '@nestjs/schedule'
import { TerminusModule } from '@nestjs/terminus'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'

import { RequestLoggerMiddleware } from '@plusone/nestjs-services'
import { PrismaModule } from '@plusone/trailcare-persistence'

import { AccessPasswordService } from './access-password.service'
import { AdminController } from './admin.controller'
import { AuthModule } from './auth/auth.module'
import { BackupService } from './backup.service'
import { CareNeedCategoryService } from './care-need-category.service'
import { CareNeedController } from './care-need.controller'
import { CareNeedService } from './care-need.service'
import { CareController } from './care.controller'
import { CareService } from './care.service'
import { configSchema } from './config'
import { HealthController } from './health.controller'
import { TrailController } from './trail.controller'
import { TrailService } from './trail.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: configSchema.parse,
      envFilePath: ['.local.env'],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'web'),
      renderPath: new RegExp(/^(?!\/api\/).*/),
    }),
    ThrottlerModule.forRoot([{ ttl: 1_000, limit: 50 }]),
    ScheduleModule.forRoot(),
    TerminusModule,
    PrismaModule,
    AuthModule,
  ],
  controllers: [HealthController, TrailController, CareController, CareNeedController, AdminController],
  providers: [
    TrailService,
    CareService,
    CareNeedService,
    CareNeedCategoryService,
    AccessPasswordService,
    BackupService,
    // useExisting allows tests to override the guard
    ThrottlerGuard,
    { provide: APP_GUARD, useExisting: ThrottlerGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggerMiddleware)
      // excludes are matched without a global prefix
      .exclude('/health')
      .forRoutes('*')
  }
}
