import { Test, TestingModule } from '@nestjs/testing'
import { HttpModule } from '@nestjs/common'

import { DiscoveryService } from './discovery.service'

describe('DiscoveryService', () => {
  let service: DiscoveryService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [DiscoveryService],
    }).compile()

    service = module.get<DiscoveryService>(DiscoveryService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
