import { HttpModule } from '@nestjs/axios'
import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'

import { DiscoverService } from './discover.service'

describe('DiscoveryService', () => {
  let service: DiscoverService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [DiscoverService],
    }).compile()

    service = module.get<DiscoverService>(DiscoverService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
