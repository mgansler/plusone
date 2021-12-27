import type { RmqOptions } from '@nestjs/microservices/interfaces/microservice-configuration.interface'
import { Transport } from '@nestjs/microservices'

export const DISCOVER_SERVICE = 'DISCOVER_SERVICE'
export const DISCOVER_MESSAGE_PATTERN = 'discover'

export const DISCOVER_OPTIONS: RmqOptions & { name: string } = {
  name: DISCOVER_SERVICE,
  transport: Transport.RMQ,
  options: {
    urls: [`amqp://${process.env.AMQP_HOST}`],
    queue: 'discover',
    queueOptions: { durable: false },
  },
}
