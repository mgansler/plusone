import { join } from 'path'

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ServeStaticModule } from '@nestjs/serve-static'

import { DeviceModule } from '../modules/device/device.module'

import { LoggerMiddleware } from './logger.middleware'

@Module({
  imports: [
    DeviceModule,
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
