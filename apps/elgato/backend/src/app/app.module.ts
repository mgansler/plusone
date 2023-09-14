import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'

import { DeviceModule } from '../modules/device/device.module'

import { LoggerMiddleware } from './logger.middleware'

@Module({
  imports: [DeviceModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
