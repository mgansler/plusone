import { join } from 'path'

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { ServeStaticModule } from '@nestjs/serve-static'

import { DeviceModule } from '../modules/device/device.module'
import { GroupModule } from '../modules/group/group.module'
import { LocationModule } from '../modules/location/location.module'

import { LoggerMiddleware } from './logger.middleware'

@Module({
  imports: [
    DeviceModule,
    GroupModule,
    LocationModule,
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
