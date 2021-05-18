/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'

import { FetchModule, fetchOptions } from '@plusone/feeds/fetch'

async function bootstrap() {
  const app = await NestFactory.createMicroservice(FetchModule, fetchOptions)

  await app.listen(() => Logger.log('Fetch Microservice is listening'))
}

bootstrap()
