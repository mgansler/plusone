import { join } from 'path'

import { HttpModule } from '@nestjs/axios'
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'
import { ServeStaticModule } from '@nestjs/serve-static'
import { TerminusModule } from '@nestjs/terminus'

import { RequestLoggerMiddleware } from '@plusone/nestjs-services'
import { PrismaModule } from '@plusone/gpx-toolbox-persistence'

import { AppService } from './app.service'
import { configSchema } from './config'
import { HealthController } from './health.controller'
import { RoutesModule } from './routes.module'
import { AuthModule } from './auth.module'
import { ImportModule } from './import.module'
import { RidesModule } from './rides.module'
import { ActivitiesModule } from './activities.module'
import { JwtStrategy } from './jwt.strategy'
import { DebugModule } from './debug.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: configSchema.parse,
      envFilePath: ['.local.env'],
    }),
    PassportModule.register({}),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'web'),
      renderPath: new RegExp(/^(?!\/api\/).*/),
    }),
    HttpModule,
    TerminusModule,
    PrismaModule,
    RoutesModule,
    AuthModule,
    ImportModule,
    RidesModule,
    ActivitiesModule,
    DebugModule,
  ],
  controllers: [HealthController],
  providers: [AppService, JwtStrategy],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggerMiddleware)
      // excludes are matched without a global prefix
      .exclude('/health')
      .forRoutes('*')
  }
}
