import { join } from 'path'

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { ServeStaticModule } from '@nestjs/serve-static'

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
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
