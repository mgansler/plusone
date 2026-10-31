import * as process from 'process'

import { NestFactory } from '@nestjs/core'

import { AppModule } from './app/app.module'
import { setupApi, writeApiSpec } from './setup-api'

NestFactory.create(AppModule).then((app) => {
  const document = setupApi(app)
  writeApiSpec(document)
  process.exit(0)
})
