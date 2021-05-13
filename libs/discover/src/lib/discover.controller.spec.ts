import { Test, TestingModule } from '@nestjs/testing'
import { HttpModule } from '@nestjs/common'

import { DiscoverController } from './discover.controller'
import { DiscoverService } from './discover.service'

describe.skip('AppController', () => {
  let app: TestingModule

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [DiscoverController],
      providers: [DiscoverService],
    }).compile()
  })

  describe('discoverWebsite', () => {
    it('should return "Welcome to discover!"', () => {
      const appController = app.get<DiscoverController>(DiscoverController)

      expect(appController.discoverWebsite({ uri: 'https://google.com' })).toEqual('Got ya!')
    })
  })
})
