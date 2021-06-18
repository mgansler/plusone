import { Test, TestingModule } from '@nestjs/testing'
import { JwtModule } from '@nestjs/jwt'
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers'

import { PrismaService } from '@plusone/feeds/backend/persistence'

import { AuthenticationController } from './authentication.controller'
import { AuthenticationService } from './authentication.service'
import { jwtConstants } from './authentication.constants'

describe.skip('AuthenticationController', () => {
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

  let controller: AuthenticationController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: jwtConstants.secret,
          signOptions: { expiresIn: '3600s' },
        }),
      ],
      providers: [AuthenticationService, PrismaService],
      controllers: [AuthenticationController],
    }).compile()

    controller = module.get<AuthenticationController>(AuthenticationController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
