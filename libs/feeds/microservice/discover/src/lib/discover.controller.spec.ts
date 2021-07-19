import { HttpModule } from '@nestjs/axios'
import { Test, TestingModule } from '@nestjs/testing'

import { DiscoverController } from './discover.controller'
import { DiscoverService } from './discover.service'

describe('DiscoverController', () => {
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
      const discoverController = app.get<DiscoverController>(DiscoverController)

      expect(discoverController.discoverWebsite('https://google.com')).toEqual(Promise.resolve({}))
    })
  })
})
