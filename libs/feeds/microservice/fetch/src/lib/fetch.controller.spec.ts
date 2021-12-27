import { HttpModule } from '@nestjs/axios'
import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'

import { FetchController } from './fetch.controller'
import { FetchService } from './fetch.service'

describe('FetchController', () => {
  let controller: FetchController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [FetchService],
      controllers: [FetchController],
    }).compile()

    controller = module.get<FetchController>(FetchController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
