import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers'

import { DatabaseModule, User } from '@plusone/feeds/backend/database'

import { UserController } from './user.controller'
import { UserService } from './user.service'

describe('UserController', () => {
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

    process.env.DB_HOST = postgresContainer.getHost()
    process.env.DB_PORT = postgresContainer.getMappedPort(5432).toString()
    process.env.DB_USER = 'postgres'
    process.env.DB_PASS = 'postgres'
    process.env.DB_NAME = 'feeds'
  })

  afterAll(async () => {
    await postgresContainer.stop()
  })

  let controller: UserController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, TypeOrmModule.forFeature([User])],
      controllers: [UserController],
      providers: [UserService],
    }).compile()

    controller = module.get<UserController>(UserController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
