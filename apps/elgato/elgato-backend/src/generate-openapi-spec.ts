import * as process from 'process'

import { NestFactory } from '@nestjs/core'

import { AppModule } from './app/app.module'
import { setupApiSpec } from './setup-api-spec'

NestFactory.create(AppModule).then((app) => {
  setupApiSpec(app, true)
  process.exit(0)
})
