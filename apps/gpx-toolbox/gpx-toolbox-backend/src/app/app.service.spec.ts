import { Test, TestingModule } from '@nestjs/testing'

import { AppService } from './app.service'

describe('AppService', () => {
  let service: AppService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile()

    service = module.get<AppService>(AppService)
  })

  describe('getHealth', () => {
    it('returns an ok status', () => {
      const result = service.getHealth()

      expect(result).toEqual({ status: 'ok' })
    })
  })
})
