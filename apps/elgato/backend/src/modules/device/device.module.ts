import { Module } from '@nestjs/common'

import { PrismaModule } from '@plusone/elgato-persistence'

import { ElgatoModule } from '../elgato/elgato.module'

import { DeviceController } from './device.controller'
import { DeviceService } from './device.service'

@Module({
  imports: [ElgatoModule, PrismaModule],
  controllers: [DeviceController],
  providers: [DeviceService],
  exports: [DeviceService],
})
export class DeviceModule {}
