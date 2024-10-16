import { join } from 'path'

import { HttpModule } from '@nestjs/axios'
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { ServeStaticModule } from '@nestjs/serve-static'
import { TerminusModule } from '@nestjs/terminus'

import { RequestLoggerMiddleware, SunriseSunsetApiService, WeatherApiService } from '@plusone/nestjs-services'
import { PrismaModule } from '@plusone/stgtrails-persistence'

import { AppService } from './app.service'
import { HealthController } from './health.controller'
import { SunriseSunsetController } from './sunrise-sunset.controller'
import { SunriseSunsetService } from './sunrise-sunset.service'
import { TrailAreaController } from './trail-area.controller'
import { TrailAreaService } from './trail-area.service'
import { WeatherController } from './weather.controller'
import { WeatherService } from './weather.service'

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
  controllers: [HealthController, SunriseSunsetController, TrailAreaController, WeatherController],
  providers: [
    AppService,
    SunriseSunsetApiService,
    SunriseSunsetService,
    TrailAreaService,
    WeatherApiService,
    WeatherService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggerMiddleware)
      // excludes are matched without global prefix
      .exclude('/health', '/sunrise-sunset(.*)', '/weather')
      .forRoutes('*')
  }
}
