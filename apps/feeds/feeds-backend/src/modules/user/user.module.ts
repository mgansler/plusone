import { Module } from '@nestjs/common'

import { PrismaModule } from '@plusone/feeds-persistence'

import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
