import { Module } from '@nestjs/common'

import { PrismaService } from '@plusone/feeds-persistence'

import { TagController } from './tag.controller'
import { TagService } from './tag.service'

@Module({
  providers: [TagService, PrismaService],
  controllers: [TagController],
  exports: [TagService],
})
export class TagModule {}
