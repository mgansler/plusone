import { Test, TestingModule } from '@nestjs/testing'
import { ClientsModule, Transport } from '@nestjs/microservices'

import { AppController } from './app.controller'
import { AppService } from './app.service'

describe('AppController', () => {
  let app: TestingModule

  beforeAll(async () => {
    app = await Test.createTestingModule({
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
      controllers: [AppController],
      providers: [AppService],
    }).compile()
  })

  describe('addWebsite', () => {
    it('should return the given uri', () => {
      const appController = app.get<AppController>(AppController)
      expect(appController.addWebsite({ uri: 'https://google.com' })).toEqual({ uri: 'https://google.com' })
    })
  })
})
