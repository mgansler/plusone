import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'

import { DeviceResponseDto } from './device.dto'
import { DeviceService } from './device.service'

@Controller()
export class DeviceController {
  constructor(private readonly appService: DeviceService) {}

  @ApiOperation({ operationId: 'device-list' })
  @ApiOkResponse({ description: 'List of all devices in the local network.', type: [DeviceResponseDto] })
  @Get('/devices')
  getDevices(): Promise<DeviceResponseDto[]> {
    return this.appService.getAllDevices()
  }
}
