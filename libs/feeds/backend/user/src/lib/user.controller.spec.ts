import { Test, TestingModule } from '@nestjs/testing'
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers'

import { PrismaService } from '@plusone/feeds/backend/persistence'

import { UserController } from './user.controller'
import { UserService } from './user.service'

// Skipped due to unreliability of testcontainers
describe.skip('UserController', () => {
  jest.setTimeout(60_000)
  let postgresContainer: StartedTestContainer
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
  })

  afterAll(async () => {
    await postgresContainer.stop()
  })

  let controller: UserController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [UserController],
      providers: [UserService, PrismaService],
    }).compile()

    controller = module.get<UserController>(UserController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
