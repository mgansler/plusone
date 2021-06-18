import { Test, TestingModule } from '@nestjs/testing'
import { ClientsModule } from '@nestjs/microservices'
import { ScheduleModule } from '@nestjs/schedule'
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers'

import { ArticleModule } from '@plusone/feeds/backend/article'
import { discoverOptions } from '@plusone/feeds/backend/discover'
import { FeedModule } from '@plusone/feeds/backend/feed'
import { fetchOptions } from '@plusone/feeds/backend/fetch'

import { AppService } from './app.service'

describe.skip('AppService', () => {
  let service: AppService

  jest.setTimeout(60_000)
  let postgresContainer: StartedTestContainer
  let ampqContainer: StartedTestContainer
  let app: TestingModule
  beforeAll(async () => {
    postgresContainer = await new GenericContainer('postgres:12-alpine')
      .withExposedPorts(5432)
      .withEnv('POSTGRES_USER', 'postgres')
      .withEnv('POSTGRES_PASSWORD', 'postgres')
      .withEnv('POSTGRES_DB', 'feeds')
      .withWaitStrategy(Wait.forLogMessage(/listening on IPv4 address/))
      .start()

    process.env.DATABASE_URL = `postgres://postgres:postgres@${postgresContainer.getHost()}:${postgresContainer.getMappedPort(
      5432,
    )}/feeds`

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
      providers: [AppService],
    }).compile()

    service = app.get<AppService>(AppService)
  })

  afterAll(async () => {
    await postgresContainer.stop()
    await ampqContainer.stop()
  })

  describe('addWebsite', () => {
    it('should return the given uri', () => {
      expect(service.addWebsite({ uri: 'https://google.com' })).toEqual(Promise.resolve({}))
    })
  })
})
