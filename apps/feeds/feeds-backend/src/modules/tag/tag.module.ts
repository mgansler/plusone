import { Module } from '@nestjs/common'

import { PrismaModule } from '@plusone/feeds-persistence'

import { TagController } from './tag.controller'
import { TagService } from './tag.service'

@Module({
  imports: [PrismaModule],
  providers: [TagService],
  controllers: [TagController],
  exports: [TagService],
})
export class TagModule {}
