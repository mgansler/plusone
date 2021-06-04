import { Test, TestingModule } from '@nestjs/testing'
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers'

import { DatabaseModule } from '@plusone/feeds/database'

import { UserService } from './user.service'
import { userProviders } from './user.providers'

describe('UserService', () => {
  jest.setTimeout(60_000)
  let mongoContainer: StartedTestContainer
  beforeAll(async () => {
    mongoContainer = await new GenericContainer('mongo:4.4')
      .withExposedPorts(27017)
      .withWaitStrategy(Wait.forLogMessage(/Waiting for connections/))
      .start()

    process.env.DB_HOST = `${mongoContainer.getHost()}:${mongoContainer.getMappedPort(27017)}`
  })

  afterAll(async () => {
    await mongoContainer.stop()
  })

  let service: UserService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [UserService, ...userProviders],
    }).compile()

    service = module.get<UserService>(UserService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
