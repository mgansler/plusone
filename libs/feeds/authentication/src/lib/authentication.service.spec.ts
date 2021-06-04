import { Test, TestingModule } from '@nestjs/testing'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers'

import { UserModule } from '@plusone/feeds/user'

import { AuthenticationService } from './authentication.service'
import { jwtConstants } from './authentication.constants'

describe('AuthenticationService', () => {
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

  let service: AuthenticationService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UserModule,
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
