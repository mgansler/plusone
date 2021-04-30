/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { Transport } from '@nestjs/microservices'

import { DiscoveryModule } from './discovery/discovery.module'

async function bootstrap() {
  const app = await NestFactory.createMicroservice(DiscoveryModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost'],
      queue: 'discover',
      queueOptions: { durable: false },
    },
  })

  await app.listen(() => Logger.log('Discovery Microservice is listening'))
}

bootstrap()
