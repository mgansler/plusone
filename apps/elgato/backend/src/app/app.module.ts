import { join } from 'path'

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ScheduleModule } from '@nestjs/schedule'
import { ServeStaticModule } from '@nestjs/serve-static'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'

import { DeviceModule } from '../modules/device/device.module'
import { GroupModule } from '../modules/group/group.module'
import { LocationModule } from '../modules/location/location.module'
import { SunriseSunsetModule } from '../modules/sunrise-sunset/sunrise-sunset.module'

import { LoggerMiddleware } from './logger.middleware'

@Module({
  imports: [
    // custom modules
    DeviceModule,
    GroupModule,
    LocationModule,
    SunriseSunsetModule,
    // @nestjs modules
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'web'),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 1_000,
        limit: 100,
      },
    ]),
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
