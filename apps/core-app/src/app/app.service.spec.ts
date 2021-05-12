import { Test } from '@nestjs/testing'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { ScheduleModule } from '@nestjs/schedule'

import { fetchOptions } from '@feeds/fetch'

import { FeedsModule } from '../feeds/feeds.module'

import { AppService } from './app.service'

// App needs a mongo db instance
describe.skip('AppService', () => {
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
        ClientsModule.register([fetchOptions]),
        ScheduleModule.forRoot(),
        FeedsModule,
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
