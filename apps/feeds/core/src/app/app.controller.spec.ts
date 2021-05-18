import { Test, TestingModule } from '@nestjs/testing'
import { ClientsModule } from '@nestjs/microservices'
import { ScheduleModule } from '@nestjs/schedule'

import { fetchOptions } from '@feeds/fetch'
import { discoverOptions } from '@feeds/discover'
import { FeedModule } from '@feeds/feed'
import { ArticleModule } from '@feeds/article'

import { AppController } from './app.controller'
import { AppService } from './app.service'

// App needs a mongo db instance
describe.skip('AppController', () => {
  let app: TestingModule

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        ClientsModule.register([discoverOptions, fetchOptions]),
        ScheduleModule.forRoot(),
        FeedModule,
        ArticleModule,
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
