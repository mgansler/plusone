import { Test, TestingModule } from '@nestjs/testing'
import { ClientsModule } from '@nestjs/microservices'
import { ScheduleModule } from '@nestjs/schedule'
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers'

import { fetchOptions } from '@plusone/feeds/backend/fetch'
import { discoverOptions } from '@plusone/feeds/backend/discover'
import { FeedModule } from '@plusone/feeds/backend/feed'
import { ArticleModule } from '@plusone/feeds/backend/article'

import { AppController } from './app.controller'
import { AppService } from './app.service'

describe('AppController', () => {
  jest.setTimeout(60_000)
  let app: TestingModule
  let mongoContainer: StartedTestContainer
  let ampqContainer: StartedTestContainer
  beforeAll(async () => {
    mongoContainer = await new GenericContainer('mongo:4.4')
      .withExposedPorts(27017)
      .withWaitStrategy(Wait.forLogMessage(/Waiting for connections/))
      .start()
    process.env.DB_HOST = `${mongoContainer.getHost()}:${mongoContainer.getMappedPort(27017)}`

    ampqContainer = await new GenericContainer('rabbitmq:3')
      .withExposedPorts(5672)
      .withWaitStrategy(Wait.forLogMessage(/Server startup complete/))
      .start()

    const AMQP_HOST = `${ampqContainer.getHost()}:${ampqContainer.getMappedPort(5672)}`

    const configuredDiscoverOptions = { ...discoverOptions }
    configuredDiscoverOptions.options.urls = [`amqp://${AMQP_HOST}`]

    const configuredFetchOptions = { ...fetchOptions }
    configuredFetchOptions.options.urls = [`amqp://${AMQP_HOST}`]

    app = await Test.createTestingModule({
      imports: [
        ClientsModule.register([configuredDiscoverOptions, configuredFetchOptions]),
        ScheduleModule.forRoot(),
        FeedModule,
        ArticleModule,
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile()
  })

  afterAll(async () => {
    await mongoContainer.stop()
    await ampqContainer.stop()
  })

  describe('addWebsite', () => {
    it('should return the given uri', () => {
      const appController = app.get<AppController>(AppController)
      expect(appController.addWebsite({ uri: 'https://google.com' })).toEqual(Promise.resolve({}))
    })
  })
})
