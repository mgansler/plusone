import { Test } from '@nestjs/testing'
import { ClientsModule } from '@nestjs/microservices'
import { ScheduleModule } from '@nestjs/schedule'

import { fetchOptions } from '@feeds/fetch'
import { FeedModule } from '@feeds/feed'
import { ArticleModule } from '@feeds/article'
import { discoverOptions } from '@feeds/discover'

import { AppService } from './app.service'

// App needs a mongo db instance
describe.skip('AppService', () => {
  let service: AppService

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      imports: [
        ClientsModule.register([discoverOptions]),
        ClientsModule.register([fetchOptions]),
        ScheduleModule.forRoot(),
        FeedModule,
        ArticleModule,
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
