import { Module } from '@nestjs/common'

import { PrismaModule } from '@plusone/feeds-persistence'

import { AuthenticationModule } from '../authentication/authentication.module'

import { TagController } from './tag.controller'
import { TagService } from './tag.service'

@Module({
  imports: [AuthenticationModule, PrismaModule],
  providers: [TagService],
  controllers: [TagController],
  exports: [TagService],
})
export class TagModule {}
