import { ClientProviderOptions, Transport } from '@nestjs/microservices'

import { DISCOVER_SERVICE } from './discover.constants'

export const discoverOptions: ClientProviderOptions = {
  name: DISCOVER_SERVICE,
  transport: Transport.RMQ,
  options: {
    urls: ['amqp://localhost'],
    queue: 'discover',
    queueOptions: { durable: false },
  },
}
