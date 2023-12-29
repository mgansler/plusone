import { Controller, Get, Param } from '@nestjs/common'

import { DeviceService } from '../device/device.service'

@Controller('/stream-deck')
export class StreamDeckController {
  constructor(private readonly deviceService: DeviceService) {}

  @Get('/toggle/:deviceId')
  async toggleDevice(@Param('deviceId') deviceId: string) {
    await this.deviceService.toggle(deviceId)
  }
}
