import { Transport } from '@nestjs/microservices'
import { RmqOptions } from '@nestjs/microservices/interfaces/microservice-configuration.interface'

import { DISCOVER_SERVICE } from './discover.constants'

export const discoverOptions: RmqOptions & { name: string } = {
  name: DISCOVER_SERVICE,
  transport: Transport.RMQ,
  options: {
    urls: [`amqp://${process.env.AMQP_HOST}`],
    queue: 'discover',
    queueOptions: { durable: false },
  },
}
