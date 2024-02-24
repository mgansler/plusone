import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'process'

import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger'
import { INestApplication, Logger } from '@nestjs/common'

export const GLOBAL_PREFIX = 'api'

export function setupApi(app: INestApplication): OpenAPIObject {
  app.setGlobalPrefix(GLOBAL_PREFIX)

  const swaggerConfig = new DocumentBuilder().setTitle('Feeds API').setVersion('0.1').build()
  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup(GLOBAL_PREFIX, app, document)

  return document
}

export function writeApiSpec(document: OpenAPIObject) {
  const outputPath = resolve(process.cwd(), 'apps/feeds/backend', 'openapi-feeds.json')
  writeFileSync(outputPath, JSON.stringify(document, undefined, 2), { encoding: 'utf-8' })
  Logger.log('OpenAPI spec has been written.')
}
