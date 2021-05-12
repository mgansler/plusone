import { Test, TestingModule } from '@nestjs/testing'
import { HttpModule } from '@nestjs/common'

import { DiscoveryController } from './discovery.controller'
import { DiscoveryService } from './discovery.service'

describe.skip('AppController', () => {
  let app: TestingModule

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [DiscoveryController],
      providers: [DiscoveryService],
    }).compile()
  })

  describe('discoverWebsite', () => {
    it('should return "Welcome to discover!"', () => {
      const appController = app.get<DiscoveryController>(DiscoveryController)

      expect(appController.discoverWebsite({ uri: 'https://google.com' })).toEqual('Got ya!')
    })
  })
})
