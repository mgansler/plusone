/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'

import { DiscoverModule, discoverOptions } from '@plusone/feeds/discover'

async function bootstrap() {
  const app = await NestFactory.createMicroservice(DiscoverModule, discoverOptions)

  await app.listen(() => Logger.log('Discovery Microservice is listening'))
}

bootstrap()
