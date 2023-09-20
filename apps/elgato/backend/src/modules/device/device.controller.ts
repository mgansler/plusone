import { Controller, Get, Param, Put } from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'

import { DeviceDetailsResponseDto, DeviceListResponseDto } from './device.dto'
import { DeviceService } from './device.service'

@Controller()
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @ApiOperation({ operationId: 'device-list' })
  @ApiOkResponse({ description: 'List of all devices in the local network.', type: DeviceListResponseDto })
  @Get('/devices')
  async getDevices(): Promise<DeviceListResponseDto> {
    const devices = await this.deviceService.getAllDevices()
    return { devices }
  }

  @ApiOperation({ operationId: 'device-details' })
  @ApiOkResponse({
    description: 'Detailed information for the device with the given id.',
    type: DeviceDetailsResponseDto,
  })
  @Get('/devices/:id')
  async getDevice(@Param('id') id: string): Promise<DeviceDetailsResponseDto> {
    return this.deviceService.getDevice(id)
  }

  @ApiOperation({ operationId: 'toggle-device' })
  @Put('/devices/:id/toggle')
  async toggleDevice(@Param('id') id: string) {
    return this.deviceService.toggle(id)
  }
}
