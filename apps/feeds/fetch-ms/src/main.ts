/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestFactory } from '@nestjs/core'

import { FetchModule } from '@plusone/feeds/microservice/fetch'
import { FETCH_OPTIONS } from '@plusone/feeds/shared/constants'

async function bootstrap() {
  const app = await NestFactory.createMicroservice(FetchModule, FETCH_OPTIONS)

  await app.listen()
}

bootstrap()
