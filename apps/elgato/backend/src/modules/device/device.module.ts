import { Module } from '@nestjs/common'

import { PrismaService } from '@plusone/elgato-persistence'

import { DeviceController } from './device.controller'
import { DeviceService } from './device.service'

@Module({
  imports: [],
  controllers: [DeviceController],
  providers: [DeviceService, PrismaService],
  exports: [DeviceService],
})
export class DeviceModule {}
