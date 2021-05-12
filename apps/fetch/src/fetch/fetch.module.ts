import { HttpModule, Module } from '@nestjs/common'

import { FetchService } from './fetch.service'
import { FetchController } from './fetch.controller'

@Module({
  imports: [HttpModule],
  providers: [FetchService],
  controllers: [FetchController],
})
export class FetchModule {}
