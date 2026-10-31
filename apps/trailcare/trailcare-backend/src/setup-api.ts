import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'process'

import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger'
import { INestApplication, Logger } from '@nestjs/common'

import { SESSION_COOKIE } from './app/auth/session-cookie'

export const GLOBAL_PREFIX = 'api'

export function setupApi(app: INestApplication): OpenAPIObject {
  app.setGlobalPrefix(GLOBAL_PREFIX)

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Trailcare API')
    .setVersion('0.1')
    .addCookieAuth(SESSION_COOKIE)
    .build()

  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup(GLOBAL_PREFIX, app, document, { customSiteTitle: 'Trailcare API' })

  return document
}

export function writeApiSpec(document: OpenAPIObject) {
  const outputPath = resolve(process.cwd(), 'apps/trailcare/trailcare-backend', 'trailcare-internal.json')
  writeFileSync(outputPath, JSON.stringify(document, undefined, 2), { encoding: 'utf-8' })
  Logger.log('OpenAPI spec has been written.')
}
