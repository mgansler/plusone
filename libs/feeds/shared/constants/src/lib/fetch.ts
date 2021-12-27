import type { RmqOptions } from '@nestjs/microservices/interfaces/microservice-configuration.interface'
import { Transport } from '@nestjs/microservices'

export const FETCH_SERVICE = 'FETCH_SERVICE'
export const FETCH_MESSAGE_PATTERN = 'update'

export const FETCH_OPTIONS: RmqOptions & { name: string } = {
  name: FETCH_SERVICE,
  transport: Transport.RMQ,
  options: {
    urls: [`amqp://${process.env.AMQP_HOST}`],
    queue: 'fetch',
    queueOptions: { durable: false, arguments: { 'x-message-ttl': 3000 } },
  },
}
