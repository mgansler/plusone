import { Module } from '@nestjs/common'

import { PrismaModule } from '@plusone/elgato-persistence'

import { ElgatoModule } from '../elgato/elgato.module'

import { DeviceSettingsController } from './device-settings.controller'
import { DeviceSettingsService } from './device-settings.service'
import { DeviceController } from './device.controller'
import { DeviceService } from './device.service'

@Module({
  imports: [ElgatoModule, PrismaModule],
  controllers: [DeviceController, DeviceSettingsController],
  providers: [DeviceService, DeviceSettingsService],
  exports: [DeviceService],
})
export class DeviceModule {}
