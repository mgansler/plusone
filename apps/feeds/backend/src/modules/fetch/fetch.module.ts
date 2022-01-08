import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'

import { FetchService } from './fetch.service'

@Module({
  imports: [HttpModule],
  providers: [FetchService],
  controllers: [],
  exports: [FetchService],
})
export class FetchModule {}
