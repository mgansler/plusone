import { Test, TestingModule } from '@nestjs/testing'
import { JwtModule } from '@nestjs/jwt'
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers'

import { UserModule } from '@plusone/feeds/backend/user'

import { AuthenticationController } from './authentication.controller'
import { AuthenticationService } from './authentication.service'
import { jwtConstants } from './authentication.constants'

describe('AuthenticationController', () => {
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

  let controller: AuthenticationController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UserModule,
        JwtModule.register({
          secret: jwtConstants.secret,
          signOptions: { expiresIn: '3600s' },
        }),
      ],
      providers: [AuthenticationService],
      controllers: [AuthenticationController],
    }).compile()

    controller = module.get<AuthenticationController>(AuthenticationController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
