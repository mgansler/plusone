import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './app/app.module'
import { PrismaExceptionFilter } from './app/prisma-exception.filter'
import { GLOBAL_PREFIX, setupApi, writeApiSpec } from './setup-api'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(new ValidationPipe())
  app.useGlobalFilters(new PrismaExceptionFilter())

  const document = setupApi(app)
  if (process.env.NODE_ENV === 'development') {
    writeApiSpec(document)
  }

  const port = process.env.PORT || 3001
  await app.listen(port)
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${GLOBAL_PREFIX}`)
}

bootstrap()
