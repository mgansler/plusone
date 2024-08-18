import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './app/app.module'
import { GLOBAL_PREFIX, setupApi, writeApiSpec } from './setup-api'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const document = setupApi(app)
  if (process.env.NODE_ENV === 'development') {
    writeApiSpec(document)
  }

  const port = process.env.PORT || 3104
  await app.listen(port)
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${GLOBAL_PREFIX}`)
}

bootstrap()
