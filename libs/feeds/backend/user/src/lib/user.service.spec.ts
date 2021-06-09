import { Test, TestingModule } from '@nestjs/testing'
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers'
import { TypeOrmModule } from '@nestjs/typeorm'

import { DatabaseModule, User } from '@plusone/feeds/backend/database'

import { UserService } from './user.service'

describe('UserService', () => {
  jest.setTimeout(60_000)
  let postgresContainer: StartedTestContainer
  beforeAll(async () => {
    postgresContainer = await new GenericContainer('postgres:12-alpine')
      .withExposedPorts(5432)
      .withEnv('POSTGRES_USER', 'postgres')
      .withEnv('POSTGRES_PASSWORD', 'postgres')
      .withEnv('POSTGRES_DB', 'feeds')
      .withWaitStrategy(Wait.forLogMessage(/database system is ready to accept connections/))
      .start()

    process.env.DB_HOST = postgresContainer.getHost()
    process.env.DB_PORT = postgresContainer.getMappedPort(5432).toString()
    process.env.DB_USER = 'postgres'
    process.env.DB_PASS = 'postgres'
    process.env.DB_NAME = 'feeds'
  })

  afterAll(async () => {
    await postgresContainer.stop()
  })

  let service: UserService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, TypeOrmModule.forFeature([User])],
      providers: [UserService],
    }).compile()

    service = module.get<UserService>(UserService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
