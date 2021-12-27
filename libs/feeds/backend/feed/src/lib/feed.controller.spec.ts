import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'

import { FeedController } from './feed.controller'

// TODO: RMQ Mocking, Prisma Mock
describe.skip('FeedController', () => {
  let controller: FeedController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedController],
    }).compile()

    controller = module.get<FeedController>(FeedController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
