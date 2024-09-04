import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'process'

import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger'
import { INestApplication, Logger } from '@nestjs/common'

import { PublicApiModule } from './modules/public-api/public-api.module'

export const GLOBAL_PREFIX = 'api'

export function setupApiSpec(app: INestApplication, writeApi = false): OpenAPIObject {
  app.setGlobalPrefix(GLOBAL_PREFIX)

  const internalApiConfig = new DocumentBuilder().setTitle('Elgato API').setVersion('0.1').build()
  const internalDocument = SwaggerModule.createDocument(app, internalApiConfig)
  SwaggerModule.setup(GLOBAL_PREFIX, app, internalDocument)

  const publicApiConfig = new DocumentBuilder().setTitle('Elgato Public API').setVersion('0.1').build()
  const publicDocument = SwaggerModule.createDocument(app, publicApiConfig, { include: [PublicApiModule] })
  SwaggerModule.setup(GLOBAL_PREFIX + '/public', app, publicDocument)

  if (writeApi) {
    writeApiSpec(internalDocument, 'elgato-internal.json')
    writeApiSpec(publicDocument, 'elgato-public.json')
  }

  return internalDocument
}

function writeApiSpec(document: OpenAPIObject, filename: string) {
  const outputPath = resolve(process.cwd(), 'apps/elgato/elgato-backend', filename)
  writeFileSync(outputPath, JSON.stringify(document, undefined, 2), { encoding: 'utf-8' })
  Logger.log(`OpenAPI spec '${filename}' has been written.`)
}
