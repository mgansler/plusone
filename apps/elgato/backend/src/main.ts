import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './app/app.module'
import { PrismaExceptionFilter } from './app/prisma-exception.filter'
import { ZodExceptionFilter } from './app/zod-exception.filter'
import { GLOBAL_PREFIX, setupApiSpec } from './setup-api-spec'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(new ValidationPipe())
  app.useGlobalFilters(new ZodExceptionFilter(), new PrismaExceptionFilter())

  setupApiSpec(app, process.env.NODE_ENV === 'development')

  const port = process.env.PORT || 3101
  await app.listen(port)
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${GLOBAL_PREFIX}`)
}

bootstrap()
