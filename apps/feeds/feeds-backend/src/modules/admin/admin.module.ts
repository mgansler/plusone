import { Module } from '@nestjs/common'

import { PrismaModule } from '@plusone/feeds-persistence'

import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'

@Module({
  imports: [PrismaModule],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
