import { Module } from '@nestjs/common'

import { PrismaModule } from '@plusone/feeds-persistence'

import { AuthenticationModule } from '../authentication/authentication.module'

import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'

@Module({
  imports: [AuthenticationModule, PrismaModule],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
