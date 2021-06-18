import { Module } from '@nestjs/common'

import { PrismaService } from '@plusone/feeds/backend/persistence'

import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService, PrismaService],
  exports: [UserService],
})
export class UserModule {}
