import { Test, TestingModule } from '@nestjs/testing'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers'
import { TypeOrmModule } from '@nestjs/typeorm'

import { DatabaseModule, User } from '@plusone/feeds/backend/database'

import { AuthenticationService } from './authentication.service'
import { jwtConstants } from './authentication.constants'

describe('AuthenticationService', () => {
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

  let service: AuthenticationService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        DatabaseModule,
        TypeOrmModule.forFeature([User]),
        PassportModule,
        JwtModule.register({
          secret: jwtConstants.secret,
          signOptions: { expiresIn: '3600s' },
        }),
      ],
      providers: [AuthenticationService],
    }).compile()

    service = module.get<AuthenticationService>(AuthenticationService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
