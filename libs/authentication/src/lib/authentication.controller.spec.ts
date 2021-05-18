import { Test, TestingModule } from '@nestjs/testing'
import { JwtModule } from '@nestjs/jwt'

import { UserModule } from '@feeds/user'

import { AuthenticationController } from './authentication.controller'
import { AuthenticationService } from './authentication.service'
import { jwtConstants } from './authentication.constants'

// needs a mongo db instance
describe.skip('AuthenticationController', () => {
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
