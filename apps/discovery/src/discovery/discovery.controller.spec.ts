import { Test, TestingModule } from '@nestjs/testing'

import { DiscoveryController } from './discovery.controller'

describe('AppController', () => {
  let app: TestingModule

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [DiscoveryController],
      providers: [],
    }).compile()
  })

  describe('discoverWebsite', () => {
    it('should return "Welcome to discover!"', () => {
      const appController = app.get<DiscoveryController>(DiscoveryController)
      expect(appController.discoverWebsite({ uri: 'https://google.com' })).toEqual('Got ya!')
    })
  })
})
