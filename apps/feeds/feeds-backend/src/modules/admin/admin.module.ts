import { Module } from '@nestjs/common'

import { PrismaService } from '@plusone/feeds-persistence'

import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'

@Module({
  providers: [AdminService, PrismaService],
  controllers: [AdminController],
})
export class AdminModule {}
