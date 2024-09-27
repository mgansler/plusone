import { join } from 'path'

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { ServeStaticModule } from '@nestjs/serve-static'
import { TerminusModule } from '@nestjs/terminus'

import { PrismaModule } from '@plusone/stgtrails-persistence'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { HealthController } from './health.controller'
import { LoggerMiddleware } from './logger.middleware'
import { WeatherApiService } from './weather-api.service'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'web'),
      renderPath: new RegExp(/^(?!\/api\/).*/),
    }),
    TerminusModule,
    PrismaModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService, WeatherApiService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
