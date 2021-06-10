import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { DatabaseModule, User } from '@plusone/feeds/backend/database'

import { UserService } from './user.service'

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([User])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
