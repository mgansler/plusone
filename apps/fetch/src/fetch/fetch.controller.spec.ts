import { Test, TestingModule } from '@nestjs/testing'
import { FetchController } from './fetch.controller'

describe('FetchController', () => {
  let controller: FetchController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FetchController],
    }).compile()

    controller = module.get<FetchController>(FetchController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
