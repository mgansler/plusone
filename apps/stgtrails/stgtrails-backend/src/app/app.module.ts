import { join } from 'path'

import { HttpModule } from '@nestjs/axios'
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'
import { ScheduleModule } from '@nestjs/schedule'
import { ServeStaticModule } from '@nestjs/serve-static'
import { TerminusModule } from '@nestjs/terminus'

import { RequestLoggerMiddleware, SunriseSunsetApiService, WeatherApiService } from '@plusone/nestjs-services'
import { PrismaModule } from '@plusone/stgtrails-persistence'

import { AdminController } from './admin.controller'
import { AppService } from './app.service'
import { configSchema } from './config'
import { HealthController } from './health.controller'
import { SunriseSunsetController } from './sunrise-sunset.controller'
import { SunriseSunsetService } from './sunrise-sunset.service'
import { TrailAreaController } from './trail-area.controller'
import { TrailAreaService } from './trail-area.service'
import { UsernamePasswordStrategy } from './username-password.strategy'
import { WeatherController } from './weather.controller'
import { WeatherService } from './weather.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: configSchema.parse,
      envFilePath: ['.local.env'],
    }),
    PassportModule,
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'web'),
      renderPath: new RegExp(/^(?!\/api\/).*/),
    }),
    HttpModule,
    TerminusModule,
    PrismaModule,
  ],
  controllers: [AdminController, HealthController, SunriseSunsetController, TrailAreaController, WeatherController],
  providers: [
    AppService,
    SunriseSunsetApiService,
    SunriseSunsetService,
    TrailAreaService,
    WeatherApiService,
    WeatherService,
    UsernamePasswordStrategy,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggerMiddleware)
      // excludes are matched without global prefix
      .exclude('/health', '/sunrise-sunset', '/weather')
      .forRoutes('*')
  }
}
