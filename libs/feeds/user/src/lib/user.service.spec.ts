import { Test, TestingModule } from '@nestjs/testing'

import { DatabaseModule } from '@plusone/feeds/database'

import { UserService } from './user.service'
import { userProviders } from './user.providers'

// App needs a mongo db instance
describe.skip('UserService', () => {
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
