import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'

import { PrismaService } from '@plusone/elgato-persistence'

import { DeviceModule } from '../device/device.module'
import { DeviceService } from '../device/device.service'

import { RoomController } from './room.controller'
import { RoomService } from './room.service'

@Module({
  controllers: [RoomController],
  imports: [DeviceModule, HttpModule],
  providers: [RoomService, PrismaService, DeviceService],
})
export class RoomModule {}
