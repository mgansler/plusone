import { Controller, Get, Param } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

import { DeviceService } from '../device/device.service'

@ApiTags('public', 'stream-deck')
@Controller('/public/stream-deck')
export class StreamDeckController {
  constructor(private readonly deviceService: DeviceService) {}

  @ApiOperation({
    operationId: 'toggle-device-power-state',
    summary: 'Toggles devices on and off.',
  })
  @Get('/toggle/:macAddress')
  async toggleDevice(@Param('macAddress') macAddress: string) {
    await this.deviceService.toggle(macAddress)
  }
}
