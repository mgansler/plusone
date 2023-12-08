import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { AppModule } from './app/app.module'
import { PrismaExceptionFilter } from './app/prisma-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(new ValidationPipe())
  app.useGlobalFilters(new PrismaExceptionFilter())

  const globalPrefix = 'api'
  app.setGlobalPrefix(globalPrefix)

  const swaggerConfig = new DocumentBuilder().setTitle('Elgato API').setVersion('0.1').build()
  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup(globalPrefix, app, document)
  if (process.env.NODE_ENV === 'development') {
    const outputPath = resolve(process.cwd(), 'apps/elgato/backend', 'openapi-elgato.json')
    writeFileSync(outputPath, JSON.stringify(document, undefined, 2), { encoding: 'utf-8' })
    Logger.log('OpenAPI spec has been written.')
  }

  const port = process.env.PORT || 3001
  await app.listen(port)
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`)
}

bootstrap()
