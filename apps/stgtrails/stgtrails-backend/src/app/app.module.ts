import { join } from 'path'

import { HttpModule } from '@nestjs/axios'
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { ServeStaticModule } from '@nestjs/serve-static'
import { TerminusModule } from '@nestjs/terminus'

import { SunriseSunsetApiService } from '@plusone/nestjs-services/sunrise-sunset-api'
import { WeatherApiService } from '@plusone/nestjs-services/weather-api'
import { PrismaModule } from '@plusone/stgtrails-persistence'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { HealthController } from './health.controller'
import { LoggerMiddleware } from './logger.middleware'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'web'),
      renderPath: new RegExp(/^(?!\/api\/).*/),
    }),
    HttpModule,
    TerminusModule,
    PrismaModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService, SunriseSunsetApiService, WeatherApiService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
