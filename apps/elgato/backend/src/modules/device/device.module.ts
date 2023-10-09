import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'

import { PrismaModule } from '@plusone/elgato-persistence'

import { DeviceController } from './device.controller'
import { DeviceService } from './device.service'

@Module({
  imports: [HttpModule, PrismaModule],
  controllers: [DeviceController],
  providers: [DeviceService],
  exports: [DeviceService],
})
export class DeviceModule {}
