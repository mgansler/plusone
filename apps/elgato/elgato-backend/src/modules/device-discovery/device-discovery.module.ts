import { Module } from '@nestjs/common'

import { PrismaModule } from '@plusone/elgato-persistence'

import { ElgatoModule } from '../elgato/elgato.module'

import { DeviceDiscoveryController } from './device-discovery.controller'
import { DeviceDiscoveryService } from './device-discovery.service'

@Module({
  imports: [ElgatoModule, PrismaModule],
  controllers: [DeviceDiscoveryController],
  providers: [DeviceDiscoveryService],
})
export class DeviceDiscoveryModule {}
