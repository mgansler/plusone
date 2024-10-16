import { join } from 'path'

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ScheduleModule } from '@nestjs/schedule'
import { ServeStaticModule } from '@nestjs/serve-static'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'

import { RequestLoggerMiddleware } from '@plusone/nestjs-services'

import { DeviceDiscoveryModule } from '../modules/device-discovery/device-discovery.module'
import { DeviceModule } from '../modules/device/device.module'
import { HealthModule } from '../modules/health/health.module'
import { LocationModule } from '../modules/location/location.module'
import { PublicApiModule } from '../modules/public-api/public-api.module'
import { SunriseSunsetModule } from '../modules/sunrise-sunset/sunrise-sunset.module'

@Module({
  imports: [
    // custom modules
    DeviceDiscoveryModule,
    DeviceModule,
    HealthModule,
    LocationModule,
    PublicApiModule,
    SunriseSunsetModule,
    // @nestjs modules
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'web'),
      renderPath: new RegExp(/^(?!\/api\/).*/),
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
    consumer
      .apply(RequestLoggerMiddleware)
      // excludes are matched without global prefix
      .exclude('/health')
      .forRoutes('*')
  }
}
