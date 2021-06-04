import { Transport } from '@nestjs/microservices'
import { RmqOptions } from '@nestjs/microservices/interfaces/microservice-configuration.interface'

import { FETCH_SERVICE } from './fetch.constants'

export const fetchOptions: RmqOptions & { name: string } = {
  name: FETCH_SERVICE,
  transport: Transport.RMQ,
  options: {
    urls: [`amqp://${process.env.AMQP_HOST}`],
    queue: 'fetch',
    queueOptions: { durable: false, arguments: { 'x-message-ttl': 3000 } },
  },
}
