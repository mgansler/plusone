/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { Transport } from '@nestjs/microservices'

import { FetchModule } from './fetch/fetch.module'

async function bootstrap() {
  const app = await NestFactory.createMicroservice(FetchModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost'],
      queue: 'fetch',
      queueOptions: { durable: false, arguments: { 'x-message-ttl': 3000 } },
    },
  })

  await app.listen(() => Logger.log('Fetch Microservice is listening'))
}

bootstrap()
