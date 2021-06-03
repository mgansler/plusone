import { ClientProviderOptions, Transport } from '@nestjs/microservices'

import { FETCH_SERVICE } from './fetch.constants'

export const fetchOptions: ClientProviderOptions = {
  name: FETCH_SERVICE,
  transport: Transport.RMQ,
  options: {
    urls: [`amqp://${process.env.AMQP_HOST}`],
    queue: 'fetch',
    queueOptions: { durable: false, arguments: { 'x-message-ttl': 3000 } },
  },
}
