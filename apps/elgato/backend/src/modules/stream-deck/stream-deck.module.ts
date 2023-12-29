import { Module } from '@nestjs/common'

import { DeviceModule } from '../device/device.module'

import { StreamDeckController } from './stream-deck.controller'

@Module({
  imports: [DeviceModule],
  controllers: [StreamDeckController],
})
export class StreamDeckModule {}
