import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'

import { PrismaService } from '@plusone/elgato-persistence'

import { DeviceModule } from '../device/device.module'
import { DeviceService } from '../device/device.service'

import { GroupController } from './group.controller'
import { GroupService } from './group.service'

@Module({
  controllers: [GroupController],
  imports: [DeviceModule, HttpModule],
  providers: [GroupService, PrismaService, DeviceService],
})
export class GroupModule {}
