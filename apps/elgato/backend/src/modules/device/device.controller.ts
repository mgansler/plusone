import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'

import { DeviceListResponseDto } from './device.dto'
import { DeviceService } from './device.service'

@Controller()
export class DeviceController {
  constructor(private readonly appService: DeviceService) {}

  @ApiOperation({ operationId: 'device-list' })
  @ApiOkResponse({ description: 'List of all devices in the local network.', type: DeviceListResponseDto })
  @Get('/devices')
  async getDevices(): Promise<DeviceListResponseDto> {
    const devices = await this.appService.getAllDevices()
    return { devices }
  }
}
