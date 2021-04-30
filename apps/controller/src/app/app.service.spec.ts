import { Test } from '@nestjs/testing'

import { AppService } from './app.service'
import { ClientsModule, Transport } from '@nestjs/microservices'

describe('AppService', () => {
  let service: AppService

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      imports: [
        ClientsModule.register([
          {
            name: 'DISCOVER_SERVICE',
            transport: Transport.RMQ,
            options: {
              urls: ['amqp://localhost'],
              queue: 'discover',
              queueOptions: { durable: false },
            },
          },
        ]),
      ],
      providers: [AppService],
    }).compile()

    service = app.get<AppService>(AppService)
  })

  describe('addWebsite', () => {
    it('should return the given uri', () => {
      expect(service.addWebsite({ uri: 'https://google.com' })).toEqual({ uri: 'https://google.com' })
    })
  })
})
