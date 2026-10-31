import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'

import { AppModule } from './app/app.module'
import { GLOBAL_PREFIX, setupApi, writeApiSpec } from './setup-api'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  // Running behind Traefik: use X-Forwarded-For for the login rate limit
  app.set('trust proxy', 1)
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))

  const document = setupApi(app)
  if (process.env.NODE_ENV === 'development') {
    writeApiSpec(document)
  }

  const port = process.env.PORT || 3105
  await app.listen(port)
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${GLOBAL_PREFIX}`)
}

bootstrap()
