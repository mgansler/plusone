import { Test, TestingModule } from '@nestjs/testing'
import { ClientsModule } from '@nestjs/microservices'
import { ScheduleModule } from '@nestjs/schedule'
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers'

import { ArticleModule } from '@plusone/feeds/article'
import { discoverOptions } from '@plusone/feeds/discover'
import { FeedModule } from '@plusone/feeds/feed'
import { fetchOptions } from '@plusone/feeds/fetch'

import { AppService } from './app.service'

describe('AppService', () => {
  let service: AppService

  jest.setTimeout(45_000)
  let mongoContainer: StartedTestContainer
  let ampqContainer: StartedTestContainer
  let app: TestingModule
  beforeAll(async () => {
    mongoContainer = await new GenericContainer('mongo:4.4')
      .withExposedPorts(27017)
      .withWaitStrategy(Wait.forLogMessage(/Waiting for connections/))
      .start()
    process.env.DB_HOST = `localhost:${mongoContainer.getMappedPort(27017)}`

    ampqContainer = await new GenericContainer('rabbitmq:3')
      .withExposedPorts(5672)
      .withWaitStrategy(Wait.forLogMessage(/Server startup complete/))
      .start()
    process.env.AMQP_HOST = `localhost:${ampqContainer.getMappedPort(5672)}`

    const configuredDiscoverOptions = { ...discoverOptions }
    configuredDiscoverOptions.options.urls = [`amqp://${process.env.AMQP_HOST}`]

    const configuredFetchOptions = { ...fetchOptions }
    configuredFetchOptions.options.urls = [`amqp://${process.env.AMQP_HOST}`]

    app = await Test.createTestingModule({
      imports: [
        ClientsModule.register([configuredDiscoverOptions, configuredFetchOptions]),
        ScheduleModule.forRoot(),
        FeedModule,
        ArticleModule,
      ],
      providers: [AppService],
    }).compile()

    service = app.get<AppService>(AppService)
  })

  afterAll(async () => {
    await mongoContainer.stop()
    await ampqContainer.stop()
  })

  describe('addWebsite', () => {
    it('should return the given uri', () => {
      expect(service.addWebsite({ uri: 'https://google.com' })).toEqual(Promise.resolve({}))
    })
  })
})
