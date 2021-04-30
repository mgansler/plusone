import { Test, TestingModule } from '@nestjs/testing'

import { AppController } from './app.controller'

describe('AppController', () => {
  let app: TestingModule

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [],
    }).compile()
  })

  describe('discoverWebsite', () => {
    it('should return "Welcome to discover!"', () => {
      const appController = app.get<AppController>(AppController)
      expect(appController.discoverWebsite({ uri: 'https://google.com' })).toEqual('Got ya!')
    })
  })
})
