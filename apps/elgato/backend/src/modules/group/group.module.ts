import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'

import { PrismaModule } from '@plusone/elgato-persistence'

import { DeviceModule } from '../device/device.module'

import { GroupController } from './group.controller'
import { GroupService } from './group.service'

@Module({
  controllers: [GroupController],
  imports: [DeviceModule, HttpModule, PrismaModule],
  providers: [GroupService],
})
export class GroupModule {}
