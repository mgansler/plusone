import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'

import { DeviceResponseDto } from './app.dto'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ operationId: 'device-list' })
  @ApiOkResponse({ description: 'List of all devices in the local network.', type: [DeviceResponseDto] })
  @Get('/devices')
  getDevices(): Promise<DeviceResponseDto[]> {
    return this.appService.getAllDevices()
  }
}
