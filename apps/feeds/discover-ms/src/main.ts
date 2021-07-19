/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestFactory } from '@nestjs/core'

import { DiscoverModule } from '@plusone/feeds/microservice/discover'
import { DISCOVER_OPTIONS } from '@plusone/feeds/shared/constants'

async function bootstrap() {
  const app = await NestFactory.createMicroservice(DiscoverModule, DISCOVER_OPTIONS)

  await app.listen()
}

bootstrap()
